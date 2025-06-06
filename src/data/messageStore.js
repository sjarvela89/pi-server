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
    INSERT INTO "Messages" ("FromUserId", "ToUserId", "CipherText", "Timestamp")
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
    SELECT "FromUserId", "ToUserId", "CipherText", "Timestamp"
    FROM "Messages"
    WHERE "FromUserId" = $1
    ORDER BY "Timestamp" DESC
  `;

  const result = await db.query(query, [userId]);

  return result.rows.map(row => ({
    FromUserId: row.FromUserId,
    ToUserId: row.ToUserId,
    CipherText: row.CipherText,
    Timestamp: row.Timestamp
  }));
}

module.exports = {
  insertMessage,
  getMessagesForUser
};