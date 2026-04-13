import cloudinary from '../config/cloudinary.js';
import fs from 'fs';

class CloudinaryService {
    /**
     * Upload a file to Cloudinary
     * @param {string} filePath - Local path of the file
     * @param {string} folder - Destination folder in Cloudinary
     * @returns {Promise<string|null>} The secure URL or null
     */
    async uploadFile(filePath, folder = 'products') {
        if (!process.env.CLOUDINARY_CLOUD_NAME) return null;

        try {
            const result = await cloudinary.uploader.upload(filePath, {
                folder: folder,
                resource_type: 'auto',
            });

            console.log(`✅ File uploaded to Cloudinary: ${result.secure_url}`);
            return result.secure_url;
        } catch (error) {
            console.error('❌ Cloudinary Upload Error:', error.message);
            return null;
        }
    }

    /**
     * Delete a file from Cloudinary
     * @param {string} publicId - The public ID of the image
     */
    async deleteFile(publicId) {
        if (!process.env.CLOUDINARY_CLOUD_NAME) return;

        try {
            const result = await cloudinary.uploader.destroy(publicId);
            if (result.result === 'ok') {
                console.log(`✅ File deleted from Cloudinary: ${publicId}`);
            } else {
                console.error(`❌ Cloudinary Delete Failed: ${publicId}`, result);
            }
        } catch (error) {
            console.error('❌ Cloudinary Service Delete Error:', error.message);
        }
    }
}

export default new CloudinaryService();
