'use client';

import { useEffect, useState } from 'react';

interface Shop {
  id: number;
  name: string;
  city: string;
  country: string;
  rating: number;
  review_count: number;
  verified: boolean;
  specializations: string[];
  brands_serviced: string[];
  last_updated: string;
}

interface Stats {
  total_shops: number;
  verified_shops: number;
  average_rating: number;
  shops_by_country: { country: string; count: number }[];
  shops_by_city: { city: string; country: string; count: number }[];
  top_rated_shops: { name: string; city: string; country: string; rating: number }[];
  data_sources: { data_source: string; count: number }[];
}

interface Log {
  id: number;
  timestamp: string;
  action: string;
  status: string;
  details: string;
  shops_processed: number;
  shops_added: number;
  shops_updated: number;
  execution_time_ms: number;
}

export default function AgentDashboard() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'shops' | 'logs'>('overview');
  const [selectedCountry, setSelectedCountry] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, [selectedCountry]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch shops
      const shopsUrl = selectedCountry
        ? `/api/shops?country=${selectedCountry}&limit=20`
        : '/api/shops?limit=20';
      const shopsRes = await fetch(shopsUrl);
      const shopsData = await shopsRes.json();
      setShops(shopsData.data || []);

      // Fetch stats
      const statsRes = await fetch('/api/stats');
      const statsData = await statsRes.json();
      setStats(statsData.data || null);

      // Fetch logs
      const logsRes = await fetch('/api/logs?limit=10');
      const logsData = await logsRes.json();
      setLogs(logsData.data.logs || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-2xl animate-pulse">Loading AI-Agent Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <div className="bg-black/30 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                🤖 Motorcycle Shop AI-Agent
              </h1>
              <p className="text-gray-400 mt-1">
                Autonomous database management system for EU motorcycle repair shops
              </p>
            </div>
            <button
              onClick={fetchData}
              className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg transition-all transform hover:scale-105"
            >
              🔄 Refresh Data
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 rounded-lg transition-all ${
              activeTab === 'overview'
                ? 'bg-purple-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            📊 Overview
          </button>
          <button
            onClick={() => setActiveTab('shops')}
            className={`px-6 py-3 rounded-lg transition-all ${
              activeTab === 'shops'
                ? 'bg-purple-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            🏪 Shops Database
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-6 py-3 rounded-lg transition-all ${
              activeTab === 'logs'
                ? 'bg-purple-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            📝 Agent Logs
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="text-gray-400 text-sm">Total Shops</div>
                <div className="text-4xl font-bold mt-2">{stats.total_shops}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="text-gray-400 text-sm">Verified Shops</div>
                <div className="text-4xl font-bold mt-2 text-green-400">{stats.verified_shops}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="text-gray-400 text-sm">Average Rating</div>
                <div className="text-4xl font-bold mt-2 text-yellow-400">
                  {stats.average_rating.toFixed(1)} ⭐
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="text-gray-400 text-sm">Countries Covered</div>
                <div className="text-4xl font-bold mt-2 text-blue-400">
                  {stats.shops_by_country.length}
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Shops by Country */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h3 className="text-xl font-bold mb-4">📍 Shops by Country</h3>
                <div className="space-y-3">
                  {stats.shops_by_country.slice(0, 8).map((item) => (
                    <div key={item.country} className="flex items-center justify-between">
                      <span className="text-gray-300">{item.country}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 bg-white/10 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                            style={{
                              width: `${(item.count / stats.total_shops) * 100}%`
                            }}
                          />
                        </div>
                        <span className="font-bold w-8 text-right">{item.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Rated Shops */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h3 className="text-xl font-bold mb-4">⭐ Top Rated Shops</h3>
                <div className="space-y-3">
                  {stats.top_rated_shops.map((shop, index) => (
                    <div key={index} className="bg-white/5 rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold">{shop.name}</div>
                          <div className="text-sm text-gray-400">
                            {shop.city}, {shop.country}
                          </div>
                        </div>
                        <div className="text-yellow-400 font-bold">{shop.rating} ⭐</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Data Sources */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h3 className="text-xl font-bold mb-4">🔍 Data Sources</h3>
                <div className="space-y-3">
                  {stats.data_sources.map((source) => (
                    <div key={source.data_source} className="flex items-center justify-between">
                      <span className="text-gray-300">{source.data_source}</span>
                      <span className="font-bold bg-purple-600/30 px-3 py-1 rounded-full">
                        {source.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Cities */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h3 className="text-xl font-bold mb-4">🏙️ Top Cities</h3>
                <div className="space-y-3">
                  {stats.shops_by_city.slice(0, 5).map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-gray-300">
                        {item.city}, {item.country}
                      </span>
                      <span className="font-bold bg-blue-600/30 px-3 py-1 rounded-full">
                        {item.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Shops Tab */}
        {activeTab === 'shops' && (
          <div>
            {/* Filter */}
            <div className="mb-6 flex gap-4">
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-2 text-white"
              >
                <option value="">All Countries</option>
                {stats?.shops_by_country.map((item) => (
                  <option key={item.country} value={item.country}>
                    {item.country} ({item.count})
                  </option>
                ))}
              </select>
            </div>

            {/* Shops Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {shops.map((shop) => (
                <div
                  key={shop.id}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:border-purple-500 transition-all"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold">{shop.name}</h3>
                    {shop.verified && <span className="text-green-400">✓</span>}
                  </div>
                  <div className="text-gray-400 text-sm space-y-1 mb-4">
                    <div>📍 {shop.city}, {shop.country}</div>
                    <div>⭐ {shop.rating} ({shop.review_count} reviews)</div>
                    <div className="text-xs text-gray-500 mt-2">
                      Updated: {formatDate(shop.last_updated)}
                    </div>
                  </div>
                  {shop.specializations && shop.specializations.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {shop.specializations.slice(0, 2).map((spec, idx) => (
                        <span
                          key={idx}
                          className="bg-purple-600/30 text-xs px-2 py-1 rounded-full"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  )}
                  {shop.brands_serviced && shop.brands_serviced.length > 0 && (
                    <div className="text-xs text-gray-500">
                      Brands: {shop.brands_serviced.slice(0, 3).join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {shops.length === 0 && (
              <div className="text-center text-gray-400 py-12">
                No shops found. Run the AI-Agent to populate the database.
              </div>
            )}
          </div>
        )}

        {/* Logs Tab */}
        {activeTab === 'logs' && (
          <div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Timestamp
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Action
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Processed
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Added
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Updated
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Time (ms)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-white/5">
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {formatDate(log.timestamp)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{log.action}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              log.status === 'success'
                                ? 'bg-green-600/30 text-green-300'
                                : log.status === 'error'
                                ? 'bg-red-600/30 text-red-300'
                                : 'bg-yellow-600/30 text-yellow-300'
                            }`}
                          >
                            {log.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {log.shops_processed}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400">
                          +{log.shops_added}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-400">
                          ~{log.shops_updated}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {log.execution_time_ms}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {logs.length === 0 && (
              <div className="text-center text-gray-400 py-12">
                No logs available. Run the AI-Agent to see execution logs.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
