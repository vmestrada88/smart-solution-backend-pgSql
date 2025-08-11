const bcrypt = require('bcrypt');
const sequelize = require('../models/db');
const User = require('../models/User');

(async () => {
  try {
    const users = await User.findAll();
    let updated = 0;
    for (const user of users) {
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
