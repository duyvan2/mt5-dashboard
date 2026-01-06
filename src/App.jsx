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
    return <div style={{padding: "20px"}}>Loading...</div>;
  }

  return (
    <div style={{padding: "20px", fontFamily: "Arial, sans-serif"}}>
      <h1>MT5 Dashboard</h1>
      <p>VPS Count: {vpsData.length}</p>
      
      {vpsData.length === 0 ? (
        <div>
          <h2>No Data Yet</h2>
          <p>Waiting for Python script to send data...</p>
        </div>
      ) : (
        <div>
          {vpsData.map(vps => (
            <div key={vps.id} style={{border: "1px solid #ccc", padding: "15px", marginBottom: "15px", borderRadius: "5px"}}>
              <h2>{vps.name}</h2>
              <p>Status: {vps.status}</p>
              <p>Accounts: {vps.accounts ? vps.accounts.length : 0}</p>
              
              {vps.accounts && vps.accounts.map(acc => (
                <div key={acc.id} style={{marginLeft: "20px", marginTop: "10px", padding: "10px", backgroundColor: "#f5f5f5", borderRadius: "3px"}}>
                  <h3>Account: {acc.accountNumber}</h3>
                  <p>Broker: {acc.broker}</p>
                  <p>Equity: ${acc.equity ? acc.equity.toFixed(2) : "0.00"}</p>
                  <p>P&L Today: ${acc.pnlToday ? acc.pnlToday.toFixed(2) : "0.00"}</p>
                  <p>Bots: {acc.bots ? acc.bots.length : 0}</p>
                  
                  {acc.bots && acc.bots.map(bot => (
                    <div key={bot.id} style={{marginLeft: "20px", marginTop: "8px", fontSize: "14px"}}>
                      <strong>{bot.name}</strong> - Magic: {bot.magicNumber} - Status: {bot.status}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
      
      <p style={{marginTop: "30px", fontSize: "12px", color: "#666"}}>
        Last update: {new Date().toLocaleString()}
      </p>
    </div>
  );
}

export default App;