
import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charger les variables d'environnement
const envPath = path.resolve(__dirname, '../../../.env');
dotenv.config({ path: envPath });

async function restoreDatabase() {
    const client = new Client({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'gadgetzone',
    });

    try {
        const dumpPath = path.resolve(__dirname, '../../../gadgetzone_data_dump.sql');

        console.log('📦 Démarrage de la restauration...');
        console.log(`📂 Fichier source : ${dumpPath}`);

        try {
            await fs.access(dumpPath);
        } catch {
            console.error('❌ Erreur : Le fichier gadgetzone_data_dump.sql est introuvable.');
            process.exit(1);
        }

        await client.connect();
        console.log('✅ Connecté à la base de données.');

        console.log('⏳ Lecture du fichier SQL...');
        let sqlContent = await fs.readFile(dumpPath, 'utf8');

        // Remove transaction blocks so a single error doesn't kill the whole process
        sqlContent = sqlContent.replace(/BEGIN;/g, '');
        sqlContent = sqlContent.replace(/COMMIT;/g, '');

        // Disable triggers globally for the session
        await client.query("SET session_replication_role = 'replica';");

        console.log('🚀 Exécution du script SQL par blocs...');

        // Split by semicolon but watch out for semicolons inside strings
        // This is a simple split for standard dumps.
        const statements = sqlContent.split(/;\s*$/m);

        let successCount = 0;
        let failCount = 0;

        for (let statement of statements) {
            const cmd = statement.trim();
            if (!cmd) continue;

            try {
                await client.query(cmd);
                successCount++;
            } catch (err) {
                if (err.code === '42P01') {
                    console.warn(`⚠️  Skip missing relation: ${err.message.split('«')[1]?.split('»')[0] || 'unknown'}`);
                } else {
                    console.error(`❌ Error in statement: ${cmd.substring(0, 50)}...`, err.message);
                }
                failCount++;
            }
        }

        console.log(`✅ Restauration terminée. Succès: ${successCount}, Échecs/Skipped: ${failCount}`);
        console.log('🎉 Vos données ont été importées (avec skips si nécessaire).');

    } catch (error) {
        console.error('❌ Erreur fatale lors de la restauration :', error);
    } finally {
        await client.end();
    }
}

restoreDatabase();
