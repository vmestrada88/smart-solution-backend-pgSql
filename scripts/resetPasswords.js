const bcrypt = require('bcrypt');
const sequelize = require('../models/db');
const User = require('../models/User');

(async () => {
  const NEW_PASSWORD = process.env.RESET_PWD || 'Passw0rd!';
  try {
    const hash = await bcrypt.hash(NEW_PASSWORD, 10);
    const [count] = await User.update(
      { password: hash },
      { where: {}, hooks: false }
    );
    console.log(`Reset password for ${count} user(s) to a known value.`);
  } catch (e) {
    console.error('Error resetting passwords:', e);
  } finally {
    await sequelize.close();
  }
})();
