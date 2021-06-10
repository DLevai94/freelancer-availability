import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';

type Props = {
  result: boolean;
};

type Query = {
  email: string;
  availability: 0 | 10 | 20 | 30 | 40;
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
        <ul>
          <li>Your email: {query.email}</li>
          <li>Your availability for the month: {query.availability}</li>
        </ul>
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  if (!context.query.email && !context.query.availability) {
    return {
      props: {
        result: false,
      },
    };
  }

  // TODO: update airtable row
  const res = await fetch('airtable');
  const data = res.json();

  return {
    props: {
      result: !!data,
    },
  };
};
