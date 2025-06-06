const { Pool } = require('pg');

const db = new Pool({
  user: 'piuser',
  host: 'localhost',
  database: 'pidb',
  password: 'securepass',
  port: 5432,
});

module.exports = { db };