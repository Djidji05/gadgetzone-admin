import { MeiliSearch } from 'meilisearch';
import dotenv from 'dotenv';

dotenv.config();

const config = {
    host: process.env.MEILISEARCH_HOST || 'http://localhost:7700',
    apiKey: process.env.MEILISEARCH_KEY || undefined,
};

let client = null;

try {
    client = new MeiliSearch(config);
    console.log('🔍 Meilisearch client initialized');
} catch (error) {
    console.error('❌ Meilisearch error:', error.message);
}

export default client;
