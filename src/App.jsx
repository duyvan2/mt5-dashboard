import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, Activity, AlertCircle, Server, DollarSign, Target, Percent } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue } from 'firebase/database';

// ============================================================
// FIREBASE CONFIG - THAY ĐỔI PHẦN NÀY VỚI THÔNG TIN CỦA BẠN
// ============================================================
const firebaseConfig = {
  apiKey: "AIzaSyADDFHKPVP2znTDSZVhcRBYG-1sjxG5XvA",
  authDomain: "mt5-dashboard-6b7a3.firebaseapp.com",
  databaseURL: "https://mt5-dashboard-6b7a3-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "mt5-dashboard-6b7a3",
  storageBucket: "mt5-dashboard-6b7a3.firebasestorage.app",
  messagingSenderId: "673396325962",
  appId: "1:673396325962:web:433d5cec01c041f6eef0b3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const MT5Dashboard = () => {
  const [vpsData, setVpsData] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterVps, setFilterVps] = useState('all');
  const [sortBy, setSortBy] = useState('equity');
  const [totalStats, setTotalStats] = useState({
    totalEquity: 0,
    totalPnLToday: 0,
    totalPnLWeek: 0,
    totalPnLMonth: 0,
    avgWinRate: 0,
    totalOpenPositions: 0,
    avgDrawdown: 0
  });

  // Firebase Realtime Listener
  useEffect(() => {
    const vpsRef = ref(database, 'vps');
    
    const unsubscribe = onValue(vpsRef, (snapshot) => {
      try {
        const data = snapshot.val();
        if (data) {
          const vpsArray = Object.values(data);
          setVpsData(vpsArray);
          calculateTotalStats(vpsArray);
          setError(null);
        } else {
          const demoData = generateDemoData();
          setVpsData(demoData);
          calculateTotalStats(demoData);
          setError("No live data yet. Showing demo data.");
        }
        setLoading(false);
      } catch (err) {
        console.error('Error processing Firebase data:', err);
        setError('Error loading data: ' + err.message);
        setLoading(false);
      }
    }, (err) => {
      console.error('Firebase error:', err);
      setError('Firebase connection error: ' + err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const generateDemoData = () => {
    const vpsCount = 4;
    const accountsPerVps = 3;
    const data = [];

    for (let v = 1; v <= vpsCount; v++) {
      const vps = {
        id: `vps-${v}`,
        name: `VPS ${v}`,
        status: 'online',
        lastUpdate: new Date().toISOString(),
        accounts: []
      };

      for (let a = 1; a <= accountsPerVps; a++) {
        const accountNum = (v - 1) * accountsPerVps + a;
        const account = {
          id: `account-${accountNum}`,
          accountNumber: `10000${accountNum}`,
          broker: 'IC Markets',
          balance: 5000 + Math.random() * 5000,
          equity: 5000 + Math.random() * 5000,
          pnlToday: (Math.random() - 0.3) * 500,
          pnlWeek: (Math.random() - 0.2) * 1500,
          pnlMonth: (Math.random() - 0.1) * 3000,
          drawdown: Math.random() * 15,
          openPositions: Math.floor(Math.random() * 5),
          bots: []
        };

        const botCount = 2 + Math.floor(Math.random() * 3);
        for (let b = 1; b <= botCount; b++) {
          const bot = {
            id: `bot-${accountNum}-${b}`,
            name: `EA_${['Scalper', 'Trend', 'Grid', 'Breakout'][Math.floor(Math.random() * 4)]}_${b}`,
            magicNumber: 10000 + accountNum * 100 + b,
            status: Math.random() > 0.1 ? 'active' : 'stopped',
            symbol: ['EURUSD', 'GBPUSD', 'USDJPY', 'XAUUSD'][Math.floor(Math.random() * 4)],
            pnlToday: (Math.random() - 0.3) * 200,
            tradesTotal: Math.floor(Math.random() * 50) + 10,
            tradesWin: 0,
            tradesLoss: 0,
            winRate: 0,
            positions: []
          };
          
          bot.tradesWin = Math.floor(bot.tradesTotal * (0.4 + Math.random() * 0.3));
          bot.tradesLoss = bot.tradesTotal - bot.tradesWin;
          bot.winRate = (bot.tradesWin / bot.tradesTotal * 100).toFixed(1);

          if (Math.random() > 0.5) {
            bot.positions.push({
              ticket: Math.floor(Math.random() * 1000000),
              type: Math.random() > 0.5 ? 'BUY' : 'SELL',
              lots: (0.01 + Math.random() * 0.5).toFixed(2),
              openPrice: (1.0 + Math.random()).toFixed(5),
              currentPrice: (1.0 + Math.random()).toFixed(5),
              pnl: (Math.random() - 0.5) * 100,
              openTime: new Date(Date.now() - Math.random() * 86400000).toISOString()
            });
          }

          account.bots.push(bot);
        }

        vps.accounts.push(account);
      }

      data.push(vps);
    }

    return data;
  };

  const calculateTotalStats = (data) => {
    let totalEquity = 0;
    let totalPnLToday = 0;
    let totalPnLWeek = 0;
    let totalPnLMonth = 0;
    let totalWinRate = 0;
    let totalOpenPositions = 0;
    let totalDrawdown = 0;
    let accountCount = 0;
    let botCount = 0;

    data.forEach(vps => {
      vps.accounts.forEach(acc => {
        totalEquity += acc.equity || 0;
        totalPnLToday += acc.pnlToday || 0;
        totalPnLWeek += acc.pnlWeek || 0;
        totalPnLMonth += acc.pnlMonth || 0;
        totalOpenPositions += acc.openPositions || 0;
        totalDrawdown += acc.drawdown || 0;
        
        if (acc.bots) {
          acc.bots.forEach(bot => {
            totalWinRate += parseFloat(bot.winRate) || 0;
            botCount++;
          });
        }
        
        accountCount++;
      });
    });

    setTotalStats({
      totalEquity: totalEquity.toFixed(2),
      totalPnLToday: totalPnLToday.toFixed(2),
      totalPnLWeek: totalPnLWeek.toFixed(2),
      totalPnLMonth: totalPnLMonth.toFixed(2),
      avgWinRate: botCount > 0 ? (totalWinRate / botCount).toFixed(1) : 0,
      totalOpenPositions,
      avgDrawdown: accountCount > 0 ? (totalDrawdown / accountCount).toFixed(1) : 0
    });
  };

  // Flatten all accounts with VPS info
  const allAccounts = vpsData.flatMap(vps => 
    vps.accounts.map(account => ({
      ...account,
      vpsId: vps.id,
      vpsName: vps.name,
      vpsStatus: vps.status
    }))
  );

  // Filter and sort accounts
  const filteredAccounts = allAccounts
    .filter(acc => filterVps === 'all' || acc.vpsId === filterVps)
    .sort((a, b) => {
      switch(sortBy) {
        case 'equity': return (b.equity || 0) - (a.equity || 0);
        case 'pnl': return (b.pnlToday || 0) - (a.pnlToday || 0);
        case 'drawdown': return (a.drawdown || 0) - (b.drawdown || 0);
        default: return 0;
      }
    });

  const StatCard = ({ title, value, subtitle, icon: Icon, color, trend }) => (
    <div className="bg-white rounded-lg shadow p-6 border-l-4" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 font-medium">{title}</p>
          <p className="text-2xl font-bold mt-1" style={{ color }}>{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className="p-3 rounded-full" style={{ backgroundColor: `${color}20` }}>
          <Icon size={24} style={{ color }} />
        </div>
      </div>
      {trend && (
        <div className="mt-2 flex items-center text-xs">
          {trend > 0 ? (
            <TrendingUp size={14} className="text-green-500 mr-1" />
          ) : (
            <TrendingDown size={14} className="text-red-500 mr-1" />
          )}
          <span className={trend > 0 ? 'text-green-500' : 'text-red-500'}>
            {Math.abs(trend).toFixed(1)}% vs yesterday
          </span>
        </div>
      )}
    </div>
  );

  const AccountDetails = ({ account, vpsName }) => {
    const isProfit = (account.pnlToday || 0) >= 0;
    
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">{vpsName} - Account {account.accountNumber}</h2>
            <p className="text-gray-600">{account.broker}</p>
          </div>
          <button 
            onClick={() => setSelectedAccount(null)}
            className="text-gray-500 hover:text-gray-700 font-medium"
          >
            ← Back
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Balance</p>
            <p className="text-xl font-bold text-blue-600">${(account.balance || 0).toFixed(2)}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Equity</p>
            <p className="text-xl font-bold text-green-600">${(account.equity || 0).toFixed(2)}</p>
          </div>
          <div className={`${isProfit ? 'bg-green-50' : 'bg-red-50'} rounded-lg p-4`}>
            <p className="text-sm text-gray-600">P&L Today</p>
            <p className={`text-xl font-bold ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
              {isProfit ? '+' : ''}{(account.pnlToday || 0).toFixed(2)}
            </p>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Drawdown</p>
            <p className="text-xl font-bold text-orange-600">{(account.drawdown || 0).toFixed(1)}%</p>
          </div>
        </div>

        <h3 className="text-xl font-semibold mb-4">Expert Advisors ({account.bots?.length || 0})</h3>
        <div className="space-y-4">
          {(account.bots || []).map(bot => (
            <div key={bot.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <Activity size={18} className={bot.status === 'active' ? 'text-green-500' : 'text-gray-400'} />
                  <h4 className="font-semibold ml-2">{bot.name}</h4>
                  <span className="ml-2 text-xs text-gray-500">Magic: {bot.magicNumber}</span>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  bot.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {bot.status}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                <div>
                  <p className="text-gray-600">Symbol</p>
                  <p className="font-semibold">{bot.symbol}</p>
                </div>
                <div>
                  <p className="text-gray-600">P&L Today</p>
                  <p className={`font-semibold ${(bot.pnlToday || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {(bot.pnlToday || 0) >= 0 ? '+' : ''}{(bot.pnlToday || 0).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Win Rate</p>
                  <p className="font-semibold">{bot.winRate}%</p>
                </div>
                <div>
                  <p className="text-gray-600">Trades</p>
                  <p className="font-semibold">{bot.tradesTotal}</p>
                </div>
                <div>
                  <p className="text-gray-600">W/L</p>
                  <p className="font-semibold">{bot.tradesWin}/{bot.tradesLoss}</p>
                </div>
              </div>

              {bot.positions && bot.positions.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs font-medium text-gray-600 mb-2">Open Positions:</p>
                  {bot.positions.map(pos => (
                    <div key={pos.ticket} className="text-xs bg-gray-50 rounded p-2 mb-1">
                      <span className={`font-medium ${pos.type === 'BUY' ? 'text-green-600' : 'text-red-600'}`}>
                        {pos.type}
                      </span>
                      {' '}{pos.lots} lots @ {pos.openPrice} → {pos.currentPrice}
                      <span className={`ml-2 ${pos.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {pos.pnl >= 0 ? '+' : ''}{pos.pnl.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Connecting to Firebase...</p>
        </div>
      </div>
    );
  }

  if (selectedAccount) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <AccountDetails account={selectedAccount} vpsName={selectedAccount.vpsName || 'VPS'} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold">MT5 Bot Trading Dashboard</h1>
          <p className="text-blue-100 mt-1">Real-time monitoring for {vpsData.length} VPS • {allAccounts.length} Accounts</p>
          {error && (
            <div className="mt-2 bg-yellow-500 text-white px-3 py-1 rounded text-sm">
              ⚠️ {error}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Total Equity"
            value={`$${totalStats.totalEquity}`}
            icon={DollarSign}
            color="#10b981"
          />
          <StatCard 
            title="P&L Today"
            value={`${parseFloat(totalStats.totalPnLToday) >= 0 ? '+' : ''}$${totalStats.totalPnLToday}`}
            subtitle={`Week: ${parseFloat(totalStats.totalPnLWeek) >= 0 ? '+' : ''}$${totalStats.totalPnLWeek}`}
            icon={TrendingUp}
            color={parseFloat(totalStats.totalPnLToday) >= 0 ? '#10b981' : '#ef4444'}
          />
          <StatCard 
            title="Avg Win Rate"
            value={`${totalStats.avgWinRate}%`}
            subtitle="Across all bots"
            icon={Target}
            color="#3b82f6"
          />
          <StatCard 
            title="Avg Drawdown"
            value={`${totalStats.avgDrawdown}%`}
            subtitle={`${totalStats.totalOpenPositions} open positions`}
            icon={AlertCircle}
            color="#f59e0b"
          />
        </div>

        {/* Filter & Sort Controls */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <label className="text-sm text-gray-600 mr-2">Filter by VPS:</label>
                <select 
                  value={filterVps}
                  onChange={(e) => setFilterVps(e.target.value)}
                  className="border rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All VPS ({vpsData.length})</option>
                  {vpsData.map(vps => (
                    <option key={vps.id} value={vps.id}>
                      {vps.name} ({vps.accounts.length})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-600 mr-2">Sort by:</label>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="equity">Equity (High to Low)</option>
                  <option value="pnl">P&L Today (High to Low)</option>
                  <option value="drawdown">Drawdown (Low to High)</option>
                </select>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              Showing <span className="font-semibold text-blue-600">{filteredAccounts.length}</span> accounts
            </div>
          </div>
        </div>

        {/* All Accounts Grid */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">All Trading Accounts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAccounts.map(account => {
              const isProfit = (account.pnlToday || 0) >= 0;
              const activeBots = (account.bots || []).filter(b => b.status === 'active').length;
              const totalBots = (account.bots || []).length;

              return (
                <div 
                  key={account.id}
                  className="bg-white rounded-lg shadow hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-blue-400"
                  onClick={() => setSelectedAccount(account)}
                >
                  {/* Header with VPS Badge */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-t-lg border-b">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-lg">#{account.accountNumber}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                        account.vpsStatus === 'online' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        <Server size={12} />
                        {account.vpsName}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{account.broker}</p>
                  </div>

                  {/* Main Stats */}
                  <div className="p-4">
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-1">EQUITY</p>
                      <p className="text-2xl font-bold text-blue-600">${(account.equity || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div>
                        <p className="text-xs text-gray-500">Today</p>
                        <p className={`font-bold text-sm ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                          {isProfit ? '+' : ''}{(account.pnlToday || 0).toFixed(0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Week</p>
                        <p className={`font-bold text-sm ${(account.pnlWeek || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {(account.pnlWeek || 0) >= 0 ? '+' : ''}{(account.pnlWeek || 0).toFixed(0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Drawdown</p>
                        <p className="font-bold text-sm text-orange-600">{(account.drawdown || 0).toFixed(1)}%</p>
                      </div>
                    </div>

                    {/* Bot & Position Info */}
                    <div className="pt-3 border-t space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 flex items-center gap-1">
                          <Activity size={14} />
                          Bots
                        </span>
                        <span className="font-semibold">
                          <span className="text-green-600">{activeBots}</span>
                          <span className="text-gray-400">/{totalBots}</span>
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Positions</span>
                        <span className="font-semibold text-purple-600">{account.openPositions || 0}</span>
                      </div>
                    </div>

                    {/* View Details Button */}
                    <button className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm">
                      View Details →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Compact VPS Overview */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">VPS Status</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {vpsData.map(vps => {
              const vpsEquity = vps.accounts.reduce((sum, acc) => sum + (acc.equity || 0), 0);
              const vpsPnl = vps.accounts.reduce((sum, acc) => sum + (acc.pnlToday || 0), 0);
              return (
                <div key={vps.id} className="border rounded-lg p-3 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm">{vps.name}</span>
                    <span className={`w-2 h-2 rounded-full ${vps.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  </div>
                  <p className="text-xs text-gray-600">{vps.accounts.length} accounts</p>
                  <p className="text-sm font-semibold mt-1">${vpsEquity.toFixed(0)}</p>
                  <p className={`text-xs font-medium ${vpsPnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {vpsPnl >= 0 ? '+' : ''}{vpsPnl.toFixed(0)} today
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Last updated: {new Date().toLocaleString('vi-VN')}</p>
          <p className="mt-1">Dashboard refreshes automatically when data changes</p>
        </div>
      </div>
    </div>
  );
};

export default MT5Dashboard;