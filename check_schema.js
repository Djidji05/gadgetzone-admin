import sequelize from './src/backend/config/database.js';

async function checkSchema() {
  try {
    const [results] = await sequelize.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'orders'");
    console.log('Columns in orders table:', JSON.stringify(results.map(r => r.column_name), null, 2));
    process.exit(0);
  } catch (error) {
    console.error('Error checking schema:', error);
    process.exit(1);
  }
}

checkSchema();
