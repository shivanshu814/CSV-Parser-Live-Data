import type { NextApiRequest, NextApiResponse } from 'next';
import { Client } from 'pg';

const pgClient = new Client({
  connectionString: 'postgres://tsdbadmin:shqe0l3u1qxpy2yx@fhhlm10mlp.nnvc5mamw2.tsdb.cloud.timescale.com:39625/tsdb?sslmode=require',
});

let isConnected = false;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (!isConnected) {
      await pgClient.connect();
      isConnected = true;
    }

    const result = await pgClient.query(`SELECT * FROM crypto_prices ORDER BY timestamp ASC`);
    const rows = result.rows;

    const processed = rows.map(row => {
      const { timestamp, ...prices } = row;
      const values = Object.values(prices).map(Number).filter(v => !isNaN(v));
      const avg = values.reduce((a, b) => a + b, 0) / values.length;

      return { timestamp, avg };
    });

    res.status(200).json(processed);
  } catch (err) {
    console.error('❌ DB fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch data from database' });
  }
}
