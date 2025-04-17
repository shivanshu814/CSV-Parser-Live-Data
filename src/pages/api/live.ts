import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const filePath = path.resolve('./public/mock_data.csv');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const lines = fs.readFileSync(filePath, 'utf-8').trim().split('\n');
  const line = lines[lines.length - 1]; // get last line

  const [timestamp, ...values] = line.split(',');
  const prices: Record<string, number> = {};
  ['BTC', 'ETH', 'MATIC', 'SOL', 'XRP', 'DOGE', 'BNB'].forEach((asset, i) => {
    prices[asset] = parseFloat(values[i]);
  });

  res.status(200).json({ timestamp, prices });
}
