import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

let supabase = null;

if (supabaseUrl && supabaseKey && supabaseUrl !== 'your_supabase_url') {
    try {
        supabase = createClient(supabaseUrl, supabaseKey);
        console.log('⚡ Supabase client initialized');
    } catch (error) {
        console.error('❌ Supabase configuration error:', error.message);
    }
} else {
    console.warn('⚠️ Supabase credentials missing or invalid. Falling back to other storage options.');
}

export default supabase;
