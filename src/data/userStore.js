const crypto = require('crypto');
const { db } = require('../db'); // Assumes db.js exports a configured pg.Pool

/**
 * @typedef {Object} User
 * @property {string} Name
 * @property {string} PasswordHash
 * @property {string} Role
 * @property {boolean} IsMfaEnabled
 * @property {string|null} [MfaSecret]
 * @property {string} DeviceHash
 */

/**
 * Trims all string fields in an object
 * @template T
 * @param {T} row
 * @returns {T}
 */
function trimStrings(row) {
  const trimmed = {};
  for (const [key, value] of Object.entries(row)) {
    trimmed[key] = typeof value === 'string' ? value.trim() : value;
  }
  return /** @type {any} */ (trimmed);
}

/**
 * Retrieves a user by username
 * @param {string} username
 * @returns {Promise<User | undefined>}
 */
async function getUserByUsername(username) {
  try {
    const result = await db.query(`SELECT * FROM "users" WHERE "name" = $1`, [username]);
    if (result.rows.length === 0) return undefined;

    return trimStrings(result.rows[0]);
  } catch (err) {
    console.error('Database error while fetching user:', err);
    return undefined;
  }
}

/**
 * Inserts a new user into the database
 * @param {User} user
 * @returns {Promise<void>}
 */
async function insertUser(user) {
  try {
    await db.query(
      `
      INSERT INTO "users" ("name", "passwordhash", "devicehash", "role", "ismfaenabled", "mfasecret")
      VALUES ($1, $2, $3, $4, $5, $6)
      `,
      [
        user.Name,
        user.PasswordHash,
        user.DeviceHash,
        user.Role,
        user.IsMfaEnabled,
        user.MfaSecret || null
      ]
    );
  } catch (err) {
    console.error('Error inserting user:', err);
    throw err;
  }
}

/**
 * Updates a user’s MFA settings
 * @param {User} updatedUser
 * @returns {Promise<void>}
 */
async function updateUser(updatedUser) {
  try {
    await db.query(
      `
      UPDATE "users"
      SET "passwordhash" = $1,
          "devicehash" = $2,
          "role" = $3,
          "ismfaenabled" = $4,
          "mfasecret" = $5
      WHERE "name" = $6
      `,
      [
        updatedUser.PasswordHash,
        updatedUser.DeviceHash,
        updatedUser.Role,
        updatedUser.IsMfaEnabled,
        updatedUser.MfaSecret || null,
        updatedUser.Name
      ]
    );
  } catch (err) {
    console.error('Error updating user:', err);
    throw err;
  }
}

module.exports = {
  getUserByUsername,
  insertUser,
  updateUser,
};