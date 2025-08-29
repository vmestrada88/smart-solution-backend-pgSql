/**
 * Script to hash user passwords in the database.
 * Useful for migrations or security upgrades.
 */

const bcrypt = require('bcrypt');
const sequelize = require('../models/db');
const User = require('../models/User');

/**
 * Main process:
 * - Finds all users in the database.
 * - Hashes any plaintext passwords.
 * - Saves the updated user records.
 * - Closes the database connection.
 */
(async () => {
  try {
    /**
     * Fetches all users from the database.
     * @type {Array<User>}
     */
    const users = await User.findAll();
    let updated = 0;
    for (const user of users) {
      /**
       * Checks if the password is already hashed.
       * If not, hashes the password and saves the user.
       */
      const pwd = user.password || '';
      const looksHashed = pwd.startsWith('$2a$') || pwd.startsWith('$2b$') || pwd.startsWith('$2y$');
      if (!looksHashed && pwd.length > 0) {
        const hash = await bcrypt.hash(pwd, 10);
        user.password = hash;
        await user.save();
        updated++;
        console.log(`Hashed password for user ${user.email}`);
      }
    }
    console.log(`Done. Updated ${updated} user(s).`);
  } catch (e) {
    console.error('Error hashing passwords:', e);
  } finally {
    await sequelize.close();
  }
})();
