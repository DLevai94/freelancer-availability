import type { NextApiRequest, NextApiResponse } from 'next';
import Airtable from 'airtable';
import { ServerClient } from 'postmark';

const mailClient = new ServerClient(process.env.POSTMARK_API);
const table = new Airtable({ apiKey: process.env.AIRTABLE_API })
  .base(process.env.AIRTABLE_BASE)
  .table(process.env.AIRTABLE_TABLE);

type ResData = {
  result: string;
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  if (req?.headers?.authorization?.split(' ')?.[1] !== `${process?.env?.AUTH_SECRET}`) {
    return res.status(401).json({ result: 'Authorization error' });
  }

  try {
    const records = await table.select({ fields: ['First Name', 'Email'] });
    let users = [];
    records.eachPage(
      async function page(records, fetchNextPage) {
        for await (const record of records) {
          console.log('foreach');
          const firstName = record.get('First Name');
          const email = record.get('Email');
          const id = record.getId();
          users = [...users, { id, email, firstName }];
          console.log(`users: ${users}`);
        }

        fetchNextPage();
      },
      function done(err) {
        if (err) {
          console.error(err);
          return res.status(500).json({ result: 'Error' });
        }
        Promise.all(
          users.map(async (freelancer) => {
            await mailClient.sendEmailWithTemplate({
              From: process.env.POSTMARK_FROM,
              To: 'david.levai@screamingbox.com',
              TemplateAlias: 'monthly-availability',
              TemplateModel: {
                name: freelancer.firstName,
                month: 'June',
                action_url_0: `${process.env.VERCEL_URL}/message?user=${freelancer.id}&availability=0`,
                action_url_10: `${process.env.VERCEL_URL}/message?user=${freelancer.id}&availability=10`,
                action_url_20: `${process.env.VERCEL_URL}/message?user=${freelancer.id}&availability=20`,
                action_url_30: `${process.env.VERCEL_URL}/message?user=${freelancer.id}&availability=30`,
                action_url_40: `${process.env.VERCEL_URL}/message?user=${freelancer.id}&availability=40`,
              },
              MessageStream: 'monthly-availability',
            });
          })
        )
          .then(() => {
            console.log('sent all');
            return res.status(200).json({ result: 'ok' });
          })
          .catch((error) => {
            console.log(`error: ${error}`);
            return res.status(200).json({ result: 'error', error });
          });
      }
    );
  } catch (error) {
    console.log(`error: ${error}`);
    return res.status(200).json({ result: 'error', error });
  }
};
