'use client';

import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
  Tooltip,
} from 'chart.js';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Legend, Tooltip);

export default function Home() {
  const [labels, setLabels] = useState<string[]>([]);
  const [dataPoints, setDataPoints] = useState<number[]>([]);
  const [lastTimestamp, setLastTimestamp] = useState<string | null>(null);

  // load full CSV history once on first load
  useEffect(() => {
    const loadHistory = async () => {
      const res = await fetch('/api/history');
      const json = await res.json();
      const newLabels = json.map((d: any) => new Date(d.timestamp).toLocaleTimeString());
      const newData = json.map((d: any) => d.avg);
      setLabels(newLabels);
      setDataPoints(newData);
      setLastTimestamp(json[json.length - 1]?.timestamp || null);
    };

    loadHistory();
  }, []);

  // ⏱append new point every 40 second 
  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch('/api/live');
      const json = await res.json();

      if (json.timestamp !== lastTimestamp) {
        setLabels((prev) => [...prev, new Date(json.timestamp).toLocaleTimeString()]);
        setDataPoints((prev) => [...prev, json.avg]);
        setLastTimestamp(json.timestamp);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lastTimestamp]);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Average Price (7 Assets)',
        data: dataPoints,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.4,
        pointRadius: 0,
        fill: false,
        pointHoverRadius: 4,
        cubicInterpolationMode: 'monotone',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    animation: { duration: 0 },
    plugins: {
      legend: { display: true },
    },
    scales: {
      x: {
        title: { display: true, text: 'Time' },
        ticks: { maxTicksLimit: 10 },
      },
      y: {
        title: { display: true, text: 'Avg Price (USD)' },
      },
    },
  };

  return (
    <main className="p-4 font-mono">
      <h1 className="text-xl font-bold mb-4">Live Full-Day Price Graph</h1>
      <div className="bg-white rounded p-4 shadow">
        <Line data={chartData} options={chartOptions} />
      </div>
    </main>
  );
}
