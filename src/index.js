const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const https = require('https');
const path = require('path');

const authRoutes = require('./routes/auth.routes');
const messageRoutes = require('./routes/messages.routes');
const deviceRoutes = require('./routes/device.routes');
const youtubeRoutes = require('./routes/youtube.routes');
const { connectToDatabase } = require('./config');

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = parseInt(process.env.PORT || '3000', 10);

// Read SSL certificate and key files
const sslKeyPath = path.resolve(__dirname, '../certs/key.pem');
const sslCertPath = path.resolve(__dirname, '../certs/cert.pem');

const httpsOptions = {
  key: fs.readFileSync(sslKeyPath),
  cert: fs.readFileSync(sslCertPath)
};

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, './public')));

app.get('/', function (_req, res) {
  res.sendFile(path.join(__dirname, './public/index.html'));
});

// Routes
app.use(authRoutes);
app.use(messageRoutes);
app.use(deviceRoutes);
app.use(youtubeRoutes);

// Start HTTPS server
https.createServer(httpsOptions, app).listen(PORT, '0.0.0.0', function () {
  console.log('✅ HTTPS server running on port ' + PORT);
  connectToDatabase();
});