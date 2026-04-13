import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import s3Client from '../config/s3.js';
import dotenv from 'dotenv';

dotenv.config();

const BUCKET_NAME = process.env.AWS_S3_BUCKET;

class S3Service {
    constructor() {
        this.client = s3Client;
    }

    /**
     * Upload a file to S3
     * @param {Buffer} fileBuffer - The file content
     * @param {string} fileName - The name for the file in S3
     * @param {string} mimeType - The mime type of the file
     * @returns {Promise<string|null>} The public URL or null
     */
    async uploadFile(fileBuffer, fileName, mimeType) {
        if (!this.client || !BUCKET_NAME) return null;

        try {
            const command = new PutObjectCommand({
                Bucket: BUCKET_NAME,
                Key: fileName,
                Body: fileBuffer,
                ContentType: mimeType,
                ACL: 'public-read', // Assumes public access is allowed
            });

            await this.client.send(command);
            const url = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${fileName}`;
            console.log(`✅ File uploaded to S3: ${url}`);
            return url;
        } catch (error) {
            console.error('❌ S3 Upload Error:', error.message);
            return null;
        }
    }

    /**
     * Delete a file from S3
     * @param {string} fileName - The key of the file to delete
     */
    async deleteFile(fileName) {
        if (!this.client || !BUCKET_NAME) return;

        try {
            const command = new DeleteObjectCommand({
                Bucket: BUCKET_NAME,
                Key: fileName,
            });
            await this.client.send(command);
            console.log(`✅ File deleted from S3: ${fileName}`);
        } catch (error) {
            console.error('❌ S3 Delete Error:', error.message);
        }
    }
}

export default new S3Service();
