
## 📄 `README.md`

```md
# 📊 CSV + TimescaleDB Crypto Tracker

This project fetches **live cryptocurrency prices** every second from CoinMarketCap using their public API and:

- 📁 Stores each data point in a **CSV file**
- 🧠 Inserts the same into a **PostgreSQL TimescaleDB** table
- 📉 Exposes API to fetch current and historical average prices

---

## 🚀 Tech Stack

- 🔥 **Next.js 15**
- 🧠 **TimescaleDB** (PostgreSQL extension)
- 📈 **Chart.js** / Lightweight Charts
- 📦 **TypeScript**
- 🧪 **CoinMarketCap API**
- 🧵 **TailwindCSS**

---

## 🛠️ Setup Instructions

### 1. Clone the repo

```bash
git clone <repo-url>
cd CSV-Parser-Live-Data
```

### 2. Install dependencies

```bash
npm install
```

### 3. Add your `.env.local`

Create a file named `.env.local` in the root:

```env
DATABASE_URL=postgres://tsdbadmin:shqe0l3u1qxpy2yx@fhhlm10mlp.nnvc5mamw2.tsdb.cloud.timescale.com:39625/tsdb?sslmode=require
CMC_API_KEY=your_coinmarketcap_api_key  # (optional if using server-side only)
```

> ⚠️ Keep your `.env.local` file secret and do not commit it.

---

### 4. Run the app (Next.js + Live Writer)

```bash
npm run dev
```

> This will:
> - Run `live-writer.ts` to store data every second
> - Start the Next.js dev server

---

## 💾 What gets stored in TimescaleDB?

Table: `crypto_prices`

| Column Name | Type               | Description             |
|-------------|--------------------|-------------------------|
| timestamp   | `TIMESTAMPTZ`      | Time of data capture    |
| btc         | `DOUBLE PRECISION` | Price of BTC in USD     |
| eth         | `DOUBLE PRECISION` | Price of ETH in USD     |
| pol         | `DOUBLE PRECISION` | Price of POL (Polygon)  |
| sol         | `DOUBLE PRECISION` | Price of Solana         |
| xrp         | `DOUBLE PRECISION` | Price of XRP            |
| doge        | `DOUBLE PRECISION` | Price of DOGE           |
| bnb         | `DOUBLE PRECISION` | Price of BNB            |

---

## 🧪 Sample PostgreSQL Queries

Get latest row:
```sql
SELECT * FROM crypto_prices ORDER BY timestamp DESC LIMIT 1;
```

Get average of each coin over last 10 mins:
```sql
SELECT
  AVG(btc) as avg_btc,
  AVG(eth) as avg_eth,
  AVG(pol) as avg_pol
FROM crypto_prices
WHERE timestamp > now() - interval '10 minutes';
```

Get all timestamp + avg:
```sql
SELECT
  timestamp,
  (btc + eth + pol + sol + xrp + doge + bnb) / 7 as avg_price
FROM crypto_prices
ORDER BY timestamp DESC;
```

---

## 📡 API Endpoints

### `/api/live`

Returns latest price average:
```json
{
  "timestamp": "2025-04-19T05:06:45.000Z",
  "avg": 1234.56
}
```

### `/api/history`

Returns all rows with calculated average per row:
```json
[
  { "timestamp": "...", "avg": ... },
  ...
]
```

---

## 🔁 Scripts Breakdown

```json
"scripts": {
  "dev": "concurrently \"npm run live\" \"next dev\"",
  "live": "tsx scripts/live-writer.ts",
  "start": "node server.js",
  "build": "next build"
}
```

- `npm run dev` → Starts writer + dev server
- `npm run live` → Only price logger
- `next dev` → Only frontend

---

## 📍 Roadmap

- [ ] Add 15m / 1h / 1d interval-based downsampling
- [ ] Add frontend charts
- [ ] Use WebSockets for live updates
- [ ] Add frontend filters

