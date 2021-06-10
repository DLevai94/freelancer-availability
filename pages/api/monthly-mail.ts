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

export default async (req: NextApiRequest, res: NextApiResponse<ResData>) => {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  if (req?.headers?.authorization?.split(' ')?.[1] !== `${process?.env?.AUTH_SECRET}`) {
    res.status(401).send({ result: 'Authorization error' });
    return;
  }
  console.log('start');

  const records = await table.select({ fields: ['First Name', 'Email'] });
  console.log('records');
  console.table(records);
  records.eachPage(
    async function page(records, fetchNextPage) {
      console.log('foreach');
      for await (const record of records) {
        console.log('Retrieved', record.get('First Name'));
        console.log('Retrieved', record.get('Email'));
        const id = record.getId();
        mailClient
          .sendEmailWithTemplate({
            From: process.env.POSTMARK_FROM,
            To: 'david.levai@screamingbox.com',
            TemplateAlias: 'monthly-availability',
            TemplateModel: {
              name: record.get('First Name'),
              month: 'June',
              action_url_0: `${process.env.VERCEL_URL}/message?user=${id}&availability=0`,
              action_url_10: `${process.env.VERCEL_URL}/message?user=${id}&availability=10`,
              action_url_20: `${process.env.VERCEL_URL}/message?user=${id}&availability=20`,
              action_url_30: `${process.env.VERCEL_URL}/message?user=${id}&availability=30`,
              action_url_40: `${process.env.VERCEL_URL}/message?user=${id}&availability=40`,
            },
            MessageStream: 'monthly-availability',
          })
          .then((res) => console.log('sent'))
          .catch((err) => console.log(err));
      }

      fetchNextPage();
    },
    function done(err) {
      if (err) {
        console.error(err);
        res.status(500).send({ result: 'Error' });
        return;
      }
    }
  );

  res.status(200).json({ result: 'ok' });
};
