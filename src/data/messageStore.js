const { db } = require('../db'); // Make sure your db.js exports a configured pg Pool

/**
 * Message structure
 * @typedef {Object} Message
 * @property {string} FromUserId
 * @property {string} ToUserId
 * @property {string} CipherText
 * @property {Date} Timestamp
 */

/**
 * Inserts a new message into the database
 * @param {Message} message
 * @returns {Promise<void>}
 */
async function insertMessage(message) {
  const query = `
    INSERT INTO "messages" ("fromuserid", "touserid", "ciphertext", "timestamp")
    VALUES ($1, $2, $3, $4)
  `;

  const values = [
    message.FromUserId,
    message.ToUserId,
    message.CipherText,
    message.Timestamp
  ];

  await db.query(query, values);
}

/**
 * Retrieves messages for a given user
 * @param {string} userId
 * @returns {Promise<Message[]>}
 */
async function getMessagesForUser(userId) {
  const query = `
    SELECT "fromuserid", "touserid", "ciphertext", "timestamp"
    FROM "messages"
    WHERE "fromuserid" = $1
    ORDER BY "timestamp" DESC
  `;

  const result = await db.query(query, [userId]);

  return result.rows.map(row => ({
    FromUserId: row.fromuserid,
    ToUserId: row.touserid,
    CipherText: row.ciphertext,
    Timestamp: row.timestamp
  }));
}

module.exports = {
  insertMessage,
  getMessagesForUser
};