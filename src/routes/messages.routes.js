const express = require('express');
const path = require('path');
const { verifyToken } = require('../middleware/auth.middleware');
const { MessagesController } = require('../controllers/messagesController');
const notifier = require('node-notifier');
const { exec } = require('child_process');
const { Pool } = require('pg');
const { dbConnectionConfig } = require('../config');

const router = express.Router();
const soundPath = path.resolve(__dirname, '../assets', 'notification.wav');

// Create PostgreSQL connection pool once
const pool = new Pool({
  user: dbConnectionConfig.user,
  host: dbConnectionConfig.host,
  database: dbConnectionConfig.database,
  password: dbConnectionConfig.password,
  port: dbConnectionConfig.port,
  // add ssl or other options here if needed
});

router.post('/messages', verifyToken, async function (req, res) {
  console.log('Messages post backend reached');
  try {
    notifier.notify({
      title: 'New Message Received',
      message: req.body.ciphertext,
      sound: true
    });

    exec(
      `powershell -c "[System.Media.SoundPlayer]::new('${soundPath}').PlaySync()"`,
      function (err) {
        if (err) {
          console.error('Error playing sound:', err);
        }
      }
    );

    // Pass the pool to the controller if it needs to access the DB
    const controller = new MessagesController(pool);
    await controller.sendMessage(req, res);
  } catch (err) {
    console.error('Error handling /messages POST:', err);
    res.status(500).json({ message: 'Failed to process message' });
  }
});

router.get('/messages/:username', verifyToken, async function (req, res) {
  console.log('Messages get backend reached');
  try {
    const username = req.params.username;

    const controller = new MessagesController(pool);
    await controller.getMessages(req, res);
  } catch (err) {
    console.error('Error handling /messages/:username GET:', err);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
});

module.exports = router;