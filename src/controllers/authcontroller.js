const crypto = require('crypto');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const { TokenBlacklistService } = require('../services/tokenBlacklistService');
const { TokenService } = require('../services/tokenservice');
const { getUserByUsername, updateUser, insertUser } = require('../data/userStore'); // Replace with your own implementation
const { banIp, isIpBanned } = require('../data/ipStore.js');

class AuthController {
  constructor(tokenService, tokenBlacklistService) {
    this.tokenService = tokenService;
    this.tokenBlacklistService = tokenBlacklistService;

    // bind methods to `this` so they can be used as callbacks if needed
    this.register = this.register.bind(this);
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.enableMfa = this.enableMfa.bind(this);
    this.verifyMfa = this.verifyMfa.bind(this);
  }

  async register(req, res) {
    const { username, password, deviceId, role = 'User' } = req.body;

    const existingUser = await getUserByUsername(username);
    if (existingUser) {
      console.log('User exists');
      return res.status(400).json({ message: 'Username already taken' });
    }

    const passwordHash = this.hashPassword(password);
    const deviceHash = this.hashPassword(deviceId);

    const newUser = {
      Name: username,
      PasswordHash: passwordHash,
      DeviceHash: deviceHash,
      Role: role,
      IsMfaEnabled: false,
      MfaSecret: null
    };

    await insertUser(newUser);
    console.log('user inserted');
    return res.status(201).json({ message: 'User registered successfully' });
  }

  async login(req, res) {
    const ip = req.ip;
    console.log('Login hit in backend.');
    if (await isIpBanned(ip || '')) {
      return res.status(403).json({ message: 'Access denied from this IP address' });
    }

    const { username, password, deviceId } = req.body;
    const user = await getUserByUsername(username);
    console.log('user was: ', user);
    const invalid = !user ||
                    !this.verifyPassword(password, user.passwordhash) ||
                    !this.verifyPassword(deviceId, user.devicehash);

    if (invalid) {
      await banIp(ip || '');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.ismfaenabled) {
        
      return res.status(200).json({ requiresMfa: true });
    }
    console.log('Next is tokenservice.');
    const token = this.tokenService.generateToken(user.name, user.role);
    return res.status(200).json({ token });
  }

  async logout(req, res) {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(400).json({ message: 'Invalid token' });
    }

    const token = authHeader.slice(7);
    await this.tokenBlacklistService.blacklistToken(token);
    return res.status(200).json({ message: 'Logged out successfully' });
  }

  async enableMfa(req, res) {
    const { username } = req.body;
    const user = await getUserByUsername(username);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const secret = speakeasy.generateSecret({ name: `YourApp:${username}` });
    user.MfaSecret = secret.base32;
    user.IsMfaEnabled = true;
    await updateUser(user);

    const qrCodeDataURL = await qrcode.toDataURL(secret.otpauth_url);
    const img = Buffer.from(qrCodeDataURL.split(',')[1], 'base64');

    res.setHeader('Content-Type', 'image/png');
    return res.send(img);
  }

  async verifyMfa(req, res) {
    const { username, code } = req.body;
    const user = await getUserByUsername(username);
    if (!user || !user.MfaSecret) {
      return res.status(401).json({ message: 'MFA not configured for user' });
    }

    const verified = speakeasy.totp.verify({
      secret: user.MfaSecret,
      encoding: 'base32',
      token: code,
    });

    if (!verified) {
      return res.status(401).json({ message: 'Invalid MFA code' });
    }

    const token = this.tokenService.generateToken(user.Name, user.Role);
    return res.status(200).json({ token });
  }

  hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('base64');
  }

  verifyPassword(input, hash) {
    console.log('hash: ' + hash);
    return this.hashPassword(input) === hash;
  }
}

module.exports = { AuthController };