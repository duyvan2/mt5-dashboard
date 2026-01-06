
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
  const [selectedVps, setSelectedVps] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
          // Convert object to array
          const vpsArray = Object.values(data);
          setVpsData(vpsArray);
          calculateTotalStats(vpsArray);
          setError(null);
        } else {
          // No data yet - show demo data
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

  const VpsCard = ({ vps }) => {
    const vpsEquity = vps.accounts.reduce((sum, acc) => sum + (acc.equity || 0), 0);
    const vpsPnl = vps.accounts.reduce((sum, acc) => sum + (acc.pnlToday || 0), 0);
    const isProfit = vpsPnl >= 0;

    return (
      <div 
        className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer p-4 border"
        onClick={() => setSelectedVps(vps)}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <Server size={20} className="text-blue-500 mr-2" />
            <h3 className="font-semibold text-lg">{vps.name}</h3>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            vps.status === 'online' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {vps.status}
          </span>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Equity:</span>
            <span className="font-semibold">${vpsEquity.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">P&L Today:</span>
            <span className={`font-semibold ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
              {isProfit ? '+' : ''}{vpsPnl.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Accounts:</span>
            <span className="font-semibold">{vps.accounts.length}</span>
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t">
          <p className="text-xs text-gray-500">
            Last update: {new Date(vps.lastUpdate).toLocaleTimeString('vi-VN')}
          </p>
        </div>
      </div>
    );
  };

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
            className="text-gray-500 hover:text-gray-700"
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
    const vps = vpsData.find(v => v.accounts.some(a => a.id === selectedAccount.id));
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <AccountDetails account={selectedAccount} vpsName={vps?.name || 'VPS'} />
      </div>
    );
  }

  if (selectedVps) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <button 
              onClick={() => setSelectedVps(null)}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Back to Overview
            </button>
            <h1 className="text-3xl font-bold mt-2">{selectedVps.name}</h1>
            <p className="text-gray-600">Managing {selectedVps.accounts.length} MT5 accounts</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {selectedVps.accounts.map(account => {
              const isProfit = (account.pnlToday || 0) >= 0;
              return (
                <div 
                  key={account.id}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer p-6"
                  onClick={() => setSelectedAccount(account)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">Account {account.accountNumber}</h3>
                    <DollarSign size={20} className="text-green-500" />
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Equity</p>
                      <p className="text-2xl font-bold text-blue-600">${(account.equity || 0).toFixed(2)}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-600">Today</p>
                        <p className={`font-semibold ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                          {isProfit ? '+' : ''}{(account.pnlToday || 0).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Week</p>
                        <p className={`font-semibold ${(account.pnlWeek || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {(account.pnlWeek || 0) >= 0 ? '+' : ''}{(account.pnlWeek || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Drawdown:</span>
                        <span className="font-semibold text-orange-600">{(account.drawdown || 0).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-gray-600">Open Positions:</span>
                        <span className="font-semibold">{account.openPositions || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-gray-600">Active Bots:</span>
                        <span className="font-semibold">{(account.bots || []).filter(b => b.status === 'active').length}/{(account.bots || []).length}</span>
                      </div>
                    </div>
                  </div>

                  <button className="w-full mt-4 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors">
                    View Details →
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold">MT5 Bot Trading Dashboard</h1>
          <p className="text-blue-100 mt-1">Real-time monitoring for {vpsData.length} VPS • {vpsData.reduce((sum, vps) => sum + vps.accounts.length, 0)} Accounts</p>
          {error && (
            <div className="mt-2 bg-yellow-500 text-white px-3 py-1 rounded text-sm">
              ⚠️ {error}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
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

        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">VPS Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {vpsData.map(vps => (
              <VpsCard key={vps.id} vps={vps} />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Performance Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-3">P&L by Period</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Today:</span>
                  <span className={`font-semibold ${parseFloat(totalStats.totalPnLToday) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${totalStats.totalPnLToday}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">This Week:</span>
                  <span className={`font-semibold ${parseFloat(totalStats.totalPnLWeek) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${totalStats.totalPnLWeek}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">This Month:</span>
                  <span className={`font-semibold ${parseFloat(totalStats.totalPnLMonth) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${totalStats.totalPnLMonth}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-3">Active Status</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">VPS Online:</span>
                  <span className="font-semibold text-green-600">
                    {vpsData.filter(v => v.status === 'online').length}/{vpsData.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Active Bots:</span>
                  <span className="font-semibold text-blue-600">
                    {vpsData.reduce((sum, vps) => 
                      sum + vps.accounts.reduce((accSum, acc) => 
                        accSum + (acc.bots || []).filter(b => b.status === 'active').length, 0), 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Open Positions:</span>
                  <span className="font-semibold text-purple-600">{totalStats.totalOpenPositions}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-3">Risk Metrics</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Avg Drawdown:</span>
                  <span className="font-semibold text-orange-600">{totalStats.avgDrawdown}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Win Rate:</span>
                  <span className="font-semibold text-green-600">{totalStats.avgWinRate}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Accounts:</span>
                  <span className="font-semibold text-blue-600">
                    {vpsData.reduce((sum, vps) => sum + vps.accounts.length, 0)}
                  </span>
                </div>
              </div>
            </div>
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