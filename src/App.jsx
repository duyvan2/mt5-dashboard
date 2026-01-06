import { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyADDFHKPVP2znTDSZVhcRBYG-1sjxG5XvA",
  authDomain: "mt5-dashboard-6b7a3.firebaseapp.com",
  databaseURL: "https://mt5-dashboard-6b7a3-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "mt5-dashboard-6b7a3",
  storageBucket: "mt5-dashboard-6b7a3.firebasestorage.app",
  messagingSenderId: "673396325962",
  appId: "1:673396325962:web:433d5cec01c041f6eef0b3"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

function App() {
  const [vpsData, setVpsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const vpsRef = ref(database, 'vps');
    
    const unsubscribe = onValue(vpsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setVpsData(Object.values(data));
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
          <p className="mt-4 text-white text-lg">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-black/30 backdrop-blur-lg border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <span className="text-4xl">📊</span>
                MT5 Dashboard
              </h1>
              <p className="text-purple-300 mt-1">Real-time Trading Monitor</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-purple-300">VPS Count</div>
              <div className="text-3xl font-bold text-white">{vpsData.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {vpsData.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-purple-500/20 p-12 text-center">
            <div className="text-6xl mb-4">⏳</div>
            <h2 className="text-2xl font-bold text-white mb-2">No Data Yet</h2>
            <p className="text-purple-300">Waiting for Python script to send data...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {vpsData.map(vps => (
              <div 
                key={vps.id} 
                className="bg-white/10 backdrop-blur-lg rounded-2xl border border-purple-500/20 overflow-hidden hover:border-purple-500/40 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20"
              >
                {/* VPS Header */}
                <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 px-6 py-4 border-b border-purple-500/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🖥️</span>
                      <div>
                        <h2 className="text-xl font-bold text-white">{vps.name}</h2>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            vps.status === 'online' 
                              ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                              : 'bg-red-500/20 text-red-300 border border-red-500/30'
                          }`}>
                            <span className={`w-2 h-2 rounded-full ${
                              vps.status === 'online' ? 'bg-green-400' : 'bg-red-400'
                            } animate-pulse`}></span>
                            {vps.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-purple-300">Accounts</div>
                      <div className="text-2xl font-bold text-white">{vps.accounts ? vps.accounts.length : 0}</div>
                    </div>
                  </div>
                </div>

                {/* Accounts */}
                <div className="p-6 space-y-4">
                  {vps.accounts && vps.accounts.map(acc => (
                    <div 
                      key={acc.id} 
                      className="bg-white/5 rounded-xl border border-purple-500/10 p-5 hover:bg-white/10 transition-all duration-200"
                    >
                      {/* Account Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">💼</span>
                            <h3 className="text-lg font-semibold text-white">Account: {acc.accountNumber}</h3>
                          </div>
                          <p className="text-purple-300 text-sm">🏦 {acc.broker}</p>
                        </div>
                      </div>

                      {/* Account Stats */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                        <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/20">
                          <div className="text-xs text-blue-300 mb-1">Equity</div>
                          <div className="text-xl font-bold text-white">
                            ${acc.equity ? acc.equity.toFixed(2) : '0.00'}
                          </div>
                        </div>
                        <div className={`rounded-lg p-3 border ${
                          (acc.pnlToday || 0) >= 0 
                            ? 'bg-green-500/10 border-green-500/20' 
                            : 'bg-red-500/10 border-red-500/20'
                        }`}>
                          <div className={`text-xs mb-1 ${
                            (acc.pnlToday || 0) >= 0 ? 'text-green-300' : 'text-red-300'
                          }`}>P&L Today</div>
                          <div className={`text-xl font-bold ${
                            (acc.pnlToday || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {(acc.pnlToday || 0) >= 0 ? '+' : ''}${acc.pnlToday ? acc.pnlToday.toFixed(2) : '0.00'}
                          </div>
                        </div>
                        <div className="bg-purple-500/10 rounded-lg p-3 border border-purple-500/20">
                          <div className="text-xs text-purple-300 mb-1">Active Bots</div>
                          <div className="text-xl font-bold text-white">
                            {acc.bots ? acc.bots.length : 0}
                          </div>
                        </div>
                      </div>

                      {/* Bots */}
                      {acc.bots && acc.bots.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-sm font-medium text-purple-300 mb-2">🤖 Trading Bots</div>
                          {acc.bots.map(bot => (
                            <div 
                              key={bot.id} 
                              className="bg-white/5 rounded-lg px-4 py-3 flex items-center justify-between hover:bg-white/10 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-xl">🤖</span>
                                <div>
                                  <div className="font-medium text-white">{bot.name}</div>
                                  <div className="text-xs text-purple-300">Magic: {bot.magicNumber}</div>
                                </div>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                bot.status === 'running' 
                                  ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                                  : bot.status === 'idle'
                                  ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                                  : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                              }`}>
                                {bot.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-purple-300 text-sm">
            🕐 Last update: {new Date().toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;