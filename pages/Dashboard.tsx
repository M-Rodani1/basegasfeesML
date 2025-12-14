import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-100">Base Gas Optimizer</h1>
              <p className="text-sm text-gray-400 mt-1">Know the best times to transact on Base network</p>
            </div>
            <Link
              to="/"
              className="px-6 py-2 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 transition"
            >
              ← Back to Home
            </Link>
          </div>
        </header>

        <main>
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Dashboard Coming Soon</h2>
            <p className="text-gray-400 mb-6">
              We're working on bringing you the full dashboard with real-time gas price tracking,
              ML predictions, and savings analysis.
            </p>
            <div className="grid md:grid-cols-3 gap-4 mt-8">
              <div className="bg-gray-900 p-6 rounded-lg">
                <div className="text-4xl mb-2">🚦</div>
                <h3 className="font-bold mb-2">Real-Time Indicator</h3>
                <p className="text-sm text-gray-400">Coming soon</p>
              </div>
              <div className="bg-gray-900 p-6 rounded-lg">
                <div className="text-4xl mb-2">📊</div>
                <h3 className="font-bold mb-2">Price Analytics</h3>
                <p className="text-sm text-gray-400">Coming soon</p>
              </div>
              <div className="bg-gray-900 p-6 rounded-lg">
                <div className="text-4xl mb-2">💰</div>
                <h3 className="font-bold mb-2">Savings Tracker</h3>
                <p className="text-sm text-gray-400">Coming soon</p>
              </div>
            </div>
          </div>
        </main>

        <footer className="mt-8 text-center text-gray-500 text-sm">
          <p>Pattern-based guidance for Base network • Chain ID: 8453</p>
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;
