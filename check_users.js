import { initDatabase } from './src/backend/config/database.js';
import { User } from './src/backend/models/index.js';

const checkUsers = async () => {
  try {
    await initDatabase();
    
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'created_at']
    });
    
    console.log('📋 Utilisateurs dans la base de données:');
    console.log('=====================================');
    
    if (users.length === 0) {
      console.log('❌ Aucun utilisateur trouvé');
    } else {
      users.forEach(user => {
        console.log(`👤 ID: ${user.id}`);
        console.log(`   Nom: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Rôle: ${user.role}`);
        console.log(`   Créé le: ${user.created_at}`);
        console.log('---');
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
};

checkUsers();
