const { sequelize } = require('./models');

(async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('Modelos sincronizados correctamente con la base de datos.');
    process.exit(0);
  } catch (error) {
    console.error('Error al sincronizar modelos:', error);
    process.exit(1);
  }
})();
