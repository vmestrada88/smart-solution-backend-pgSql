/**
 * Script to synchronize the Sequelize model with the PostgreSQL database.
 * Creates tables and adds sample data.
 * Run this script to initialize the database in development.
 */

const { sequelize } = require('./models');

(async () => {
  try {
    console.log('🔌 Connecting to Aurora RDS...');
    await sequelize.authenticate();
    console.log('✅ Connected successfully');
    
    console.log('🏗️ Creating tables with Sequelize...');
    await sequelize.sync({ force: true });
    console.log('✅ Tables created');
    
    // Check created tables
    const [tables] = await sequelize.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"); // eslint-disable-line quotes
    console.log('📋 Created tables:', tables.map(t => t.table_name));
    
    // Now insert sample data
    const Product = require('./models/Product');
    
    console.log('📦 Creating sample products...');
    const products = await Product.bulkCreate([
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
        name: 'NVR 4 Channels',
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
    
    console.log(`✅ Created ${products.length} sample products`);
    console.log('🎉 Database configured successfully');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
})();
