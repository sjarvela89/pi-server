const { Client } = require('pg');
const { Bulb } = require('tplink-smarthome-api');

let lightBulb = null; // Keep your Bulb instance reference

// PostgreSQL connection config (adjust as needed)
const dbConnectionConfig = {
  user: 'piuser',          // e.g., 'piuser'
  host: 'localhost',
  database: 'pidb',    // e.g., 'pi_db'
  password: 'securepass',      // your password
  port: 5432,
  // Add SSL options here if needed
  // ssl: { rejectUnauthorized: false }
  Jwt: {
    Key: '325048692756308568452139762581235A',
    Issuer: 'NodeServerTypeScript',
    Audience: 'testapp',
    ExpireMinutes: 60
  }
};

// Function to connect to PostgreSQL
async function connectToDatabase() {
  const client = new Client(dbConnectionConfig);
  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL database');
    // You can perform queries here or export client for reuse
    // Example: const res = await client.query('SELECT NOW()');
    // console.log(res.rows[0]);
  } catch (err) {
    console.error('PostgreSQL connection error:', err);
  }
  // Note: don't call client.end() here if you want to keep connection alive.
  // Manage client lifecycle as per your app architecture.
}

module.exports = {
  dbConnectionConfig,
  connectToDatabase,
  lightBulb
};