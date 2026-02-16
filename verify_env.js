import dotenv from 'dotenv';
dotenv.config();

console.log("--- ENV DEBUG REPORT ---");
const id = process.env.MONCASH_CLIENT_ID;
const secret = process.env.MONCASH_CLIENT_SECRET;

if (!id) {
    console.log("❌ MONCASH_CLIENT_ID is MISSING/UNDEFINED");
} else {
    console.log(`✅ MONCASH_CLIENT_ID found. Length: ${id.length}`);
    if (id.includes("your_client_id")) {
        console.log("⚠️  WARNING: It looks like a placeholder ('your_client_id...')");
    } else {
        console.log("ℹ️  Value starts with: " + id.substring(0, 4) + "...");
    }
}

if (!secret) {
    console.log("❌ MONCASH_CLIENT_SECRET is MISSING/UNDEFINED");
} else {
    console.log(`✅ MONCASH_CLIENT_SECRET found. Length: ${secret.length}`);
    if (secret.includes("your_client_secret")) {
        console.log("⚠️  WARNING: It looks like a placeholder");
    }
}
console.log("------------------------");
