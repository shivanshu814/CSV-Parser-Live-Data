import fs from 'fs';
import path from 'path';

const filePath = path.resolve('./public/mock_data.csv');
const headers = ['timestamp', 'BTC', 'ETH', 'MATIC', 'SOL', 'XRP', 'DOGE', 'BNB'];
const startTime = new Date();
startTime.setHours(0, 0, 0, 0);

const rows: string[] = [headers.join(',')];

for (let i = 0; i < 86400; i++) {
  const timestamp = new Date(startTime.getTime() + i * 1000).toISOString();
  const values = Array(7).fill(0).map(() => (Math.random() * 1000 + 1).toFixed(2));
  rows.push([timestamp, ...values].join(','));
}

fs.writeFileSync(filePath, rows.join('\n'));
console.log('CSV generated with 86,400 lines.');
