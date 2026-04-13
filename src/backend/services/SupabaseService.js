import supabase from '../config/supabase.js';
import fs from 'fs';

const BUCKET_NAME = process.env.SUPABASE_BUCKET || 'product-images';

class SupabaseService {
    constructor() {
        this.client = supabase;
    }

    /**
     * Upload a file to Supabase Storage
     * @param {Buffer | string} file - The file content or local path
     * @param {string} fileName - The name for the file in Supabase
     * @param {string} mimeType - The mime type of the file
     * @returns {Promise<string|null>} The public URL or null
     */
    async uploadFile(file, fileName, mimeType) {
        if (!this.client) return null;

        try {
            let fileContent = file;
            if (typeof file === 'string') {
                fileContent = fs.readFileSync(file);
            }

            const { data, error } = await this.client
                .storage
                .from(BUCKET_NAME)
                .upload(fileName, fileContent, {
                    contentType: mimeType,
                    cacheControl: '3600',
                    upsert: true
                });

            if (error) {
                console.error('❌ Supabase Upload Error:', error.message);
                return null;
            }

            const { data: publicUrlData } = this.client
                .storage
                .from(BUCKET_NAME)
                .getPublicUrl(fileName);

            const url = publicUrlData.publicUrl;
            console.log(`✅ File uploaded to Supabase: ${url}`);
            return url;
        } catch (error) {
            console.error('❌ Supabase Service Error:', error.message);
            return null;
        }
    }

    /**
     * Delete a file from Supabase Storage
     * @param {string} fileName - The path of the file to delete
     */
    async deleteFile(fileName) {
        if (!this.client) return;

        try {
            const { error } = await this.client
                .storage
                .from(BUCKET_NAME)
                .remove([fileName]);

            if (error) {
                console.error('❌ Supabase Delete Error:', error.message);
            } else {
                console.log(`✅ File deleted from Supabase: ${fileName}`);
            }
        } catch (error) {
            console.error('❌ Supabase Service Delete Error:', error.message);
        }
    }
}

export default new SupabaseService();
