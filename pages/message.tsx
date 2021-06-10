import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Airtable from 'airtable';

const availabilityOptions = ['0', '10', '20', '30', '40'];

type Props = {
  result: boolean;
};

export default function Message({ result }: Props) {
  const { query } = useRouter();
  return (
    <>
      <Head>
        <title>Freelancer Availability - ScreamingBox</title>
      </Head>

      <main>
        <h1>Freelancer Availability</h1>
        <p>{result ? 'Got it, thanks.' : 'Something happened. Please report to David'}</p>
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  if (
    !context.query.user ||
    !context.query.availability ||
    !availabilityOptions.includes(context.query.availability.toString())
  ) {
    return {
      props: {
        result: false,
      },
    };
  }

  const table = new Airtable({ apiKey: process.env.AIRTABLE_API })
    .base(process.env.AIRTABLE_BASE)
    .table(process.env.AIRTABLE_TABLE);

  const now: string = new Date().toISOString().split('T')[0];

  try {
    await table.update(context.query.user.toString(), {
      Availability: context.query.availability,
      'Last Answered': now,
    });
    return {
      props: {
        result: true,
      },
    };
  } catch (error) {
    console.log(error);
    return {
      props: {
        result: false,
      },
    };
  }
};
