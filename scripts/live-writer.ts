import fs from 'fs';
import path from 'path';
import axios from 'axios';

const filePath = path.resolve('./public/mock_data.csv');
const CMC_API_KEY = '5684bcd0-b1b8-4482-84f7-fb72257469e9'; 
const symbols = ['BTC', 'ETH', 'POL', 'SOL', 'XRP', 'DOGE', 'BNB'];

if (!fs.existsSync(filePath)) {
  const headers = ['timestamp', ...symbols];
  fs.writeFileSync(filePath, headers.join(',') + '\n');
}

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
          symbol: symbols.join(','),
          convert: 'USD', // Or 'JIMS' if supported
        },
      }
    );

    const data = res.data.data;
    const timestamp = new Date().toISOString();
    const prices = symbols.map((sym) => data[sym]?.quote?.USD?.price?.toFixed(2) ?? 'NA');
    const newLine = [timestamp, ...prices].join(',');
    fs.appendFileSync(filePath, newLine + '\n');
    console.log('Appended:', newLine);
  } catch (error) {
    console.error('Error fetching prices:', error);
  }
};

setInterval(fetchCMCPrices, 40000);
