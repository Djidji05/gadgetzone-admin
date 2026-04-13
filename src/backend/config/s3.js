import { S3Client } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

const region = process.env.AWS_REGION || 'us-east-1';
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

let s3Client = null;

if (accessKeyId && secretAccessKey) {
    try {
        s3Client = new S3Client({
            region,
            credentials: {
                accessKeyId,
                secretAccessKey,
            },
        });
        console.log('☁️ S3 client initialized');
    } catch (error) {
        console.error('❌ S3 configuration error:', error.message);
    }
} else {
    console.warn('⚠️ AWS S3 credentials missing. Falling back to local storage.');
}

export default s3Client;
