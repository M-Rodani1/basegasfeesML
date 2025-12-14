import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface HistoricalDataPoint {
  time: string;
  gwei: number;
}

const GasPriceGraph: React.FC = () => {
  const [data, setData] = useState<HistoricalDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('https://basegasfeesml.onrender.com/api/historical?hours=24');
      if (!response.ok) {
        throw new Error('Failed to fetch historical data');
      }

      const result = await response.json();

      // Format the data for the chart
      const formattedData = result.data.map((point: any) => ({
        time: new Date(point.time).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }),
        gwei: point.gwei
      }));

      setData(formattedData);

    } catch (err) {
      console.error('Error loading graph data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Auto-refresh every 60 seconds
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading && data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-cyan-400">Loading historical data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-red-400 mb-4">⚠️ {error}</p>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-md transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">No data available</div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
        <XAxis
          dataKey="time"
          stroke="#A0AEC0"
          tick={{ fontSize: 12 }}
          interval="preserveStartEnd"
        />
        <YAxis
          stroke="#A0AEC0"
          tick={{ fontSize: 12 }}
          label={{ value: 'Gwei', angle: -90, position: 'insideLeft', style: { fill: '#A0AEC0' } }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1A202C',
            borderColor: '#4A5568',
            borderRadius: '8px'
          }}
          labelStyle={{ color: '#E2E8F0' }}
          formatter={(value: any) => {
            return [`${Number(value).toFixed(4)} gwei`, 'Gas Price'];
          }}
        />
        <Line
          type="monotone"
          dataKey="gwei"
          stroke="#4FD1C5"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 6, fill: '#4FD1C5' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default GasPriceGraph;
