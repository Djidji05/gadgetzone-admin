// Script de démarrage backend alternatif pour Windows
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Démarrage du backend HTFasil...');

// Démarrer le serveur backend
const backendProcess = spawn('node', ['server.js'], {
  stdio: 'inherit',
  cwd: __dirname,
  env: { ...process.env }
});

backendProcess.on('close', (code) => {
  console.log(`Backend process exited with code ${code}`);
});

backendProcess.on('error', (err) => {
  console.error('Failed to start backend:', err);
});

// Gérer l'arrêt propre
process.on('SIGINT', () => {
  console.log('\n🛑 Arrêt du backend...');
  backendProcess.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Arrêt du backend...');
  backendProcess.kill('SIGTERM');
  process.exit(0);
});
