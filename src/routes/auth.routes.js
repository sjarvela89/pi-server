const express = require('express');
const path = require('path');
const { Pool } = require('pg');

const { AuthController } = require('../controllers/authcontroller');
const { TokenService } = require('../services/tokenservice');
const TokenBlacklistService = require('../services/tokenBlacklistService');
const { dbConnectionConfig } = require('../config');

const router = express.Router();

// Create a PostgreSQL connection pool
const pool = new Pool({
  user: dbConnectionConfig.user,          // from your config
  host: dbConnectionConfig.host,
  database: dbConnectionConfig.database,
  password: dbConnectionConfig.password,
  port: dbConnectionConfig.port,
  // add ssl or other options if needed
});

router.get('/login', function (req, res) {
  res.sendFile(path.join(__dirname, '../public/login.html'));
});

router.post('/login', async function (req, res) {
  try {
    // Pass the pool instead of mssql connection
    const controller = new AuthController(
      new TokenService(dbConnectionConfig),
      new TokenBlacklistService(pool)
    );
    await controller.login(req, res);
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error });
  }
});

router.get('/register', function (_req, res) {
  res.sendFile(path.join(__dirname, '../public/register.html'));
});

router.post('/register', async function (req, res) {
  try {
    const controller = new AuthController(
      new TokenService(dbConnectionConfig),
      new TokenBlacklistService(pool)
    );
    await controller.register(req, res);
  } catch (error) {
    console.error('Error: ', error);
    res.status(500).json({ message: 'Registration failed', error });
  }
});

module.exports = router;