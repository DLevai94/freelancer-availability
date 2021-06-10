import { GetServerSideProps } from 'next';
import Head from 'next/head';

type Props = {
  ssp: string;
};

export default function Message({ ssp }: Props) {
  return (
    <>
      <Head>
        <title>Freelancer Availability - ScreamingBox</title>
      </Head>

      <main>
        <h1>Freelancer Availability</h1>
        <p>{ssp}</p>
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    props: {
      ssp: 'Got it. Thank you.',
    },
  };
};
