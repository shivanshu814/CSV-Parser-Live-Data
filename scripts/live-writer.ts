import fs from 'fs';
import path from 'path';

const filePath = path.resolve('./public/mock_data.csv');

if (!fs.existsSync(filePath)) {
  const headers = ['timestamp', 'BTC', 'ETH', 'MATIC', 'SOL', 'XRP', 'DOGE', 'BNB'];
  fs.writeFileSync(filePath, headers.join(',') + '\n');
}

const generateRow = () => {
  const timestamp = new Date().toISOString();
  const values = Array(7).fill(0).map(() => (Math.random() * 1000).toFixed(2));
  return [timestamp, ...values].join(',');
};

setInterval(() => {
  const newLine = generateRow();
  fs.appendFileSync(filePath, newLine + '\n');
  console.log('Appended:', newLine);
}, 1000);
