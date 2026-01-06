import { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue } from 'firebase/database';

// ============================================================
// FIREBASE CONFIG - THAY ĐỔI PHẦN NÀY
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
const app = initializeApp(FIREBASE_CONFIG);
const database = getDatabase(app);

function App() {
  const [vpsData, setVpsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const vpsRef = ref(database, 'vps');
    
    const unsubscribe = onValue(vpsRef, (snapshot) => {
      try {
        const data = snapshot.val();
        if (data) {
          const vpsArray = Object.values(data);
          setVpsData(vpsArray);
          setError(null);
        } else {
          setError("No data from VPS yet. Waiting for Python script...");
        }
        setLoading(false);
      } catch (err) {
        setError('Error: ' + err.message);
        setLoading(false);
      }
    }, (err) => {
      setError('Firebase error: ' + err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', border: '4px solid #e5e7eb', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
          <p style={{ marginTop: '16px', color: '#6b7280' }}>Connecting to Firebase...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <div style={{ background: 'linear-gradient(to right, #2563eb, #1e40af)', color: 'white', padding: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '30px', fontWeight: 'bold', margin: 0 }}>MT5 Bot Trading Dashboard</h1>
          <p style={{ color: '#bfdbfe', marginTop: '4px', marginBottom: 0 }}>
            Real-time monitoring • {vpsData.length} VPS • {vpsData.reduce((sum, vps) => sum + (vps.accounts?.length || 0), 0)} Accounts
          </p>
          {error && (
            <div style={{ marginTop: '8px', backgroundColor: '#fbbf24', color: 'white', padding: '8px 12px', borderRadius: '4px', fontSize: '14px' }}>
              ⚠️ {error}
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px' }}>
        {vpsData.length === 0 ? (
          <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '48px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>No Data Yet</h2>
            <p style={{ color: '#6b7280', marginBottom: '16px' }}>Waiting for Python script to send data from VPS...</p>
            <p style={{ fontSize: '14px', color: '#9ca3af' }}>
              Make sure mt5_collector.py is running on your VPS and sending data to Firebase.
            </p>
          </div>
        ) : (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: '#1f2937' }}>VPS Overview</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
              {vpsData.map(vps => {
                const vpsEquity = vps.accounts?.reduce((sum, acc) => sum + (acc.equity || 0), 0) || 0;
                const vpsPnl = vps.accounts?.reduce((sum, acc) => sum + (acc.pnlToday || 0), 0) || 0;
                const isProfit = vpsPnl >= 0;

                return (
                  <div key={vps.id} style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '20px', border: '1px solid #e5e7eb', transition: 'box-shadow 0.3s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ fontSize: '20px', marginRight: '8px' }}>🖥️</span>
                        <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>{vps.name}</h3>
                      </div>
                      <span style={{ 
                        padding: '4px 8px', 
                        borderRadius: '12px', 
                        fontSize: '12px', 
                        fontWeight: '500',
                        backgroundColor: vps.status === 'online' ? '#d1fae5' : '#fee2e2',
                        color: vps.status === 'online' ? '#065f46' : '#991b1b'
                      }}>
                        {vps.status}
                      </span>
                    </div>
                    
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '14px', color: '#6b7280' }}>Total Equity:</span>
                        <span style={{ fontWeight: '600', fontSize: '16px' }}>${vpsEquity.toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '14px', color: '#6b7280' }}>P&L Today:</span>
                        <span style={{ fontWeight: '600', color: isProfit ? '#059669' : '#dc2626' }}>
                          {isProfit ? '+' : ''}{vpsPnl.toFixed(2)}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px', color: '#6b7280' }}>Accounts:</span>
                        <span style={{ fontWeight: '600' }}>{vps.accounts?.length || 0}</span>
                      </div>
                    </div>
                    
                    <div style={{ paddingTop: '12px', borderTop: '1px solid #e5e7eb' }}>
                      <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>
                        Updated: {new Date(vps.lastUpdate).toLocaleTimeString('vi-VN')}
                      </p>
                    </div>

                    {vps.accounts && vps.accounts.length > 0 && (
                      <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
                        <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#374151' }}>Accounts:</h4>
                        {vps.accounts.map(acc => (
                          <div key={acc.id} style={{ backgroundColor: '#f9fafb', padding: '12px', borderRadius: '6px', marginBottom: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span style={{ fontSize: '13px', fontWeight: '500' }}>#{acc.accountNumber}</span>
                              <span style={{ fontSize: '13px', color: '#6b7280' }}>{acc.broker}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                              <span style={{ color: '#6b7280' }}>Equity:</span>
                              <span style={{ fontWeight: '500' }}>${(acc.equity || 0).toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                              <span style={{ color: '#6b7280' }}>P&L:</span>
                              <span style={{ fontWeight: '500', color: (acc.pnlToday || 0) >= 0 ? '#059669' : '#dc2626' }}>
                                {(acc.pnlToday || 0) >= 0 ? '+' : ''}{(acc.pnlToday || 0).toFixed(2)}
                              </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                              <span style={{ color: '#6b7280' }}>Bots:</span>
                              <span style={{ fontWeight: '500' }}>
                                {acc.bots?.filter(b => b.status === 'active').length || 0}/{acc.bots?.length || 0} active
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '14px', color: '#9ca3af' }}>
          <p>Dashboard updates automatically when data changes</p>
          <p style={{ marginTop: '4px' }}>Last refresh: {new Date().toLocaleString('vi-VN')}</p>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default App;
