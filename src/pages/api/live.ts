import type { NextApiRequest, NextApiResponse } from 'next';
import { Client } from 'pg';

// PostgreSQL config
const pgClient = new Client({
  connectionString: 'postgres://tsdbadmin:shqe0l3u1qxpy2yx@fhhlm10mlp.nnvc5mamw2.tsdb.cloud.timescale.com:39625/tsdb?sslmode=require',
});

let isConnected = false;

async function getLatestRowAvg() {
  if (!isConnected) {
    await pgClient.connect();
    isConnected = true;
  }

  // Fetch latest row
  const result = await pgClient.query(`
    SELECT * FROM crypto_prices
    ORDER BY timestamp DESC
    LIMIT 1
  `);

  const row = result.rows[0];
  const { timestamp, ...rest } = row;

  // Get numeric values and calculate average
  const values = Object.values(rest).map(Number).filter(v => !isNaN(v));
  const avg = values.reduce((a, b) => a + b, 0) / values.length;

  return { timestamp, avg };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { timestamp, avg } = await getLatestRowAvg();
    res.status(200).json({ timestamp, avg });
  } catch (error) {
    console.error('❌ API Error:', error);
    res.status(500).json({ error: 'Failed to fetch data from database' });
  }
}
