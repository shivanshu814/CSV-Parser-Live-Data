import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const filePath = path.resolve('./public/mock_data.csv');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const lines = fs.readFileSync(filePath, 'utf-8').trim().split('\n');
  const result: { timestamp: string, avg: number }[] = [];

  for (const line of lines.slice(1)) { // skip header
    const [timestamp, ...values] = line.split(',');
    const avg = values.map(Number).reduce((a, b) => a + b, 0) / values.length;
    result.push({ timestamp, avg });
  }

  res.status(200).json(result);
}
