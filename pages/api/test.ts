import type { NextApiRequest, NextApiResponse } from 'next';

type ResData = {
  result: string;
};

export default async (req: NextApiRequest, res: NextApiResponse<ResData>) => {
  console.log('test');
  res.status(200).json({ result: 'ok' });
};
