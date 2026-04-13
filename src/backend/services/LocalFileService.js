import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Importation dynamique des moteurs de traitement d'image
let sharp = null;
let Jimp = null;

const initEngines = async () => {
    try {
        sharp = (await import('sharp')).default;
        console.log('🚀 [LocalFileService] Moteur Sharp activé (Performance maximale)');
    } catch (e) {
        try {
            Jimp = (await import('jimp')).default;
            console.log('🛡️ [LocalFileService] Moteur Jimp activé (Mode compatibilité)');
        } catch (e2) {
            console.warn('⚠️ [LocalFileService] Aucun moteur de traitement d\'image (sharp/jimp) trouvé. Les images ne seront pas compressées.');
        }
    }
};

class LocalFileService {
    constructor() {
        // Base path is public/uploads relative to the project root
        this.baseUploadPath = path.join(__dirname, '../../../public/uploads');
        this.ensureDirectory(this.baseUploadPath);
        initEngines();
    }

    ensureDirectory(dirPath) {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    }

    /**
     * Sauvegarde et optimise une image en Base64 sur le disque.
     */
    async saveBase64Image(base64String, subFolder = 'products', fileNamePrefix = 'img') {
        if (!base64String || typeof base64String !== 'string') return base64String;
        if (!base64String.startsWith('data:image/')) return base64String;

        try {
            const uploadDir = path.join(this.baseUploadPath, subFolder);
            this.ensureDirectory(uploadDir);

            const matches = base64String.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
            if (!matches || matches.length !== 3) return base64String;

            const extension = matches[1] === 'jpeg' ? 'jpg' : (matches[1] === 'png' ? 'png' : 'jpg');
            const imageData = Buffer.from(matches[2], 'base64');
            
            const hash = crypto.randomBytes(8).toString('hex');
            const fileName = `${fileNamePrefix}_${Date.now()}_${hash}.${extension}`;
            const filePath = path.join(uploadDir, fileName);

            // Tenter l'optimisation avec les moteurs disponibles
            if (sharp) {
                await sharp(imageData)
                    .resize(1200, null, { withoutEnlargement: true, fit: 'inside' })
                    .toFormat(extension === 'png' ? 'png' : 'jpeg', { quality: 75, progressive: true })
                    .toFile(filePath);
            } else if (Jimp) {
                const image = await Jimp.read(imageData);
                await image
                    .scaleToFit(1200, 1200)
                    .quality(75)
                    .writeAsync(filePath);
            } else {
                // Pas de moteur : enregistrement brut
                fs.writeFileSync(filePath, imageData);
            }

            return `/uploads/${subFolder}/${fileName}`;
        } catch (error) {
            console.error('❌ LocalFileService Error:', error.message);
            return base64String;
        }
    }
}

export default new LocalFileService();

