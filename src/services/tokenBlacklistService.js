class TokenBlacklistService {
  constructor(pool) {
    this.pool = pool;
  }

  async isTokenBlacklisted(token) {
    try {
      const result = await this.pool.query(
        `SELECT COUNT(*) AS count FROM BlacklistedTokens WHERE Token = $1 AND ExpiryDate > NOW()`,
        [token]
      );
      return result.rows[0].count > 0;
    } catch (err) {
      console.error('Error checking blacklist:', err);
      throw err;
    }
  }

  async blacklistToken(token) {
    try {
      await this.pool.query(
        `INSERT INTO BlacklistedTokens (Token, ExpiryDate) VALUES ($1, NOW() + INTERVAL '30 minutes')`,
        [token]
      );
    } catch (err) {
      console.error('Error blacklisting token:', err);
      throw err;
    }
  }
}

module.exports = TokenBlacklistService;