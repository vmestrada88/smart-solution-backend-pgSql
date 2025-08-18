const { sequelize } = require('./models');

(async () => {
  try {
    console.log('🔌 Conectando a Aurora RDS...');
    await sequelize.authenticate();
    console.log('✅ Conectado exitosamente');
    
    console.log('🏗️ Creando tablas con Sequelize...');
    await sequelize.sync({ force: true });
    console.log('✅ Tablas creadas');
    
    // Verificar tablas creadas
    const [tables] = await sequelize.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log('📋 Tablas creadas:', tables.map(t => t.table_name));
    
    // Ahora vamos a insertar datos de ejemplo
    const Product = require('./models/Product');
    
    console.log('📦 Creando productos de ejemplo...');
    const productos = await Product.bulkCreate([
      {
        name: 'IP Camera Hikvision',
        brand: 'Hikvision',
        model: 'DS-2CD1043G2-LIUF',
        description: '4MP Fixed Turret Network Camera',
        quantity: 25,
        priceSell: 120.00,
        priceBuy: 90.00,
        category: 'IP Camera'
      },
      {
        name: 'NVR 4 Canales',
        brand: 'Hikvision',
        model: 'DS-7104NI-Q1/M',
        description: 'Network Video Recorder 4CH',
        quantity: 10,
        priceSell: 180.00,
        priceBuy: 140.00,
        category: 'NVR'
      },
      {
        name: 'Hard Drive WD Purple',
        brand: 'Western Digital',
        model: 'WD20PURX',
        description: 'Surveillance Hard Drive 2TB',
        quantity: 15,
        priceSell: 85.00,
        priceBuy: 65.00,
        category: 'Hard Drive'
      }
    ]);
    
    console.log(`✅ Creados ${productos.length} productos de ejemplo`);
    console.log('🎉 Base de datos configurada exitosamente');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
})();
