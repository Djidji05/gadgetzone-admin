import { initDatabase } from './src/backend/config/database.js';
import { User } from './src/backend/models/index.js';
import bcrypt from 'bcrypt';

const testUsers = async () => {
  try {
    // Initialiser la base de données
    await initDatabase();
    console.log('✅ Base de données initialisée');

    // Vérifier si des utilisateurs existent
    const users = await User.findAll();
    console.log(`📊 Nombre d'utilisateurs trouvés: ${users.length}`);

    if (users.length > 0) {
      console.log('👥 Utilisateurs existants:');
      users.forEach(user => {
        console.log(`  - ID: ${user.id}, Email: ${user.email}, Name: ${user.name}`);
      });
    } else {
      console.log('⚠️ Aucun utilisateur trouvé. Création d\'un utilisateur de test...');

      // Créer un utilisateur de test
      const hashedPassword = await bcrypt.hash('test123', 12);
      const testUser = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: hashedPassword,
        role: 'user'
      });

      console.log('✅ Utilisateur de test créé:');
      console.log(`  - Email: test@example.com`);
      console.log(`  - Mot de passe: test123`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
};

testUsers();
