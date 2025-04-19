import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { Client } from 'pg';

const CMC_API_KEY = '5684bcd0-b1b8-4482-84f7-fb72257469e9';
const filePath = path.resolve('./public/mock_data.csv');
const symbols = ['btc', 'eth', 'pol', 'sol', 'xrp', 'doge', 'bnb'];

const pgClient = new Client({
  connectionString: 'postgres://tsdbadmin:shqe0l3u1qxpy2yx@fhhlm10mlp.nnvc5mamw2.tsdb.cloud.timescale.com:39625/tsdb?sslmode=require',
});

console.log('⏳ Connecting to TimescaleDB...');

pgClient.connect()
  .then(async () => {
    console.log('✅ Connected to TimescaleDB');

    const cols = symbols.map(sym => `${sym} DOUBLE PRECISION`).join(', ');
    const query = `
      CREATE TABLE IF NOT EXISTS crypto_prices (
        timestamp TIMESTAMPTZ PRIMARY KEY,
        ${cols}
      );
    `;
    await pgClient.query(query);
    console.log('✅ Table crypto_prices created with lowercase column names');

    if (!fs.existsSync(filePath)) {
      const headers = ['timestamp', ...symbols];
      fs.writeFileSync(filePath, headers.join(',') + '\n');
      console.log('📝 CSV file created with headers:', headers.join(', '));
    } else {
      console.log('📁 CSV file found, appending data...');
    }

    setInterval(fetchCMCPrices, 1000);
  })
  .catch((err) => {
    console.error('❌ Failed to connect to TimescaleDB:', err.message);
  });

const fetchCMCPrices = async () => {
  try {
    const res = await axios.get(
      'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest',
      {
        headers: {
          'X-CMC_PRO_API_KEY': CMC_API_KEY,
          Accepts: 'application/json',
        },
        params: {
          symbol: symbols.map(s => s.toUpperCase()).join(','),
          convert: 'USD',
        },
      }
    );

    const data = res.data.data;
    const timestamp = new Date().toISOString();

    const values = symbols.map(sym => {
      const price = data[sym.toUpperCase()]?.quote?.USD?.price;
      return price ? Number(price.toFixed(2)) : null;
    });

    const csvLine = [timestamp, ...values.map(v => v ?? 'NA')].join(',');
    fs.appendFileSync(filePath, csvLine + '\n');
    console.log('✅ CSV appended:', csvLine);

    const colNames = symbols.join(', ');
    const placeholders = values.map((_, i) => `$${i + 2}`).join(', ');
    const insertQuery = `INSERT INTO crypto_prices (timestamp, ${colNames}) VALUES ($1, ${placeholders}) ON CONFLICT (timestamp) DO NOTHING`;

    await pgClient.query(insertQuery, [timestamp, ...values]);
    console.log('📦 Inserted into DB at', timestamp);

  } catch (err) {
    console.error('❌ Error in fetchCMCPrices:', err.message);
  }
};
