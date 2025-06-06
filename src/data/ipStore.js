const { db } = require('../db'); // Make sure you have a db.js that exports the PostgreSQL pool

/**
 * Check if an IP is banned
 * @param {string} ip
 * @returns {Promise<boolean>}
 */
const isIpBanned = async (ip) => {
  const result = await db.query(
    'SELECT 1 FROM "bannedips" WHERE "ipaddress" = $1',
    [ip]
  );
  return result.rows.length > 0;
};

/**
 * Ban an IP by inserting into the BannedIPs table
 * @param {string} ip
 * @returns {Promise<void>}
 */
const banIp = async (ip) => {
  await db.query(
    'INSERT INTO "bannedips" ("ipaddress") VALUES ($1)',
    [ip]
  );
};

module.exports = {
  isIpBanned,
  banIp,
};