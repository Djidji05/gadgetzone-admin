import bcrypt from 'bcrypt';
import { initDatabase } from './src/backend/config/database.js';
import { User } from './src/backend/models/index.js';

const fixPassword = async () => {
  try {
    await initDatabase();
    
    // Hasher le mot de passe "password123" avec le même sel que dans l'auth
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    console.log('🔧 Mise à jour des mots de passe...');
    
    // Mettre à jour tous les utilisateurs avec le même hash
    await User.update(
      { password: hashedPassword },
      { where: {} }
    );
    
    console.log('✅ Tous les mots de passe ont été mis à jour');
    console.log('📋 Vous pouvez maintenant vous connecter avec:');
    console.log('   - admin@gadgetzone.com / password123');
    console.log('   - john@example.com / password123');
    console.log('   - jane@example.com / password123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
};

fixPassword();
