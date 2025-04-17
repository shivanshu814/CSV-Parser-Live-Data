'use client';

import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
  Tooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Legend, Tooltip);

export default function Home() {
  const [data, setData] = useState<any[]>([]);
  const [latest, setLatest] = useState<any>(null);

  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch('/api/live');
      const json = await res.json();
      setLatest(json);
      setData(prev => [...prev.slice(-60), json]); // Keep last 60 entries only
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // ✅ Calculate average price from all 7 assets
  const averagePrices = data.map((d) => {
    const values = Object.values(d.prices) as number[];
    const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
    return avg;
  });

  const chartData = {
    labels: data.map((d) => new Date(d.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: 'Average Price of 7 Assets',
        data: averagePrices,
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
        cubicInterpolationMode: 'monotone',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    animation: {
      duration: 0,
    },
    plugins: {
      legend: {
        display: true,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Time',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Average Price (USD)',
        },
      },
    },
  };

  return (
    <main className="p-2 font-mono text-sm">
      <h1 className="text-xl font-bold mb-4">Real-Time Average Price Chart</h1>

      {latest && (
        <div className="mb-4">
          <strong>Latest Time:</strong> {new Date(latest.timestamp).toLocaleTimeString()}<br />
          <strong>Prices:</strong>{' '}
          {Object.entries(latest.prices).map(([k, v]) => `${k}: ${v}`).join(', ')}
        </div>
      )}

      <div className="mb-6 bg-white rounded-md p-4 shadow">
        <Line data={chartData} options={chartOptions} />
      </div>

      <h2 className="text-lg font-semibold mb-2">History</h2>
      <ul className="max-h-[300px] overflow-y-scroll">
        {data.map((entry, idx) => (
          <li key={idx}>
            {new Date(entry.timestamp).toLocaleTimeString()} -{' '}
            {Object.entries(entry.prices).map(([k, v]) => `${k}: ${v}`).join(', ')}
          </li>
        ))}
      </ul>
    </main>
  );
}
