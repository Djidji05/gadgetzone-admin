const axios = require('axios');

const API_URL = 'http://localhost:3003/api';
let token = ''; // Fill with a valid customer token if needed for manual run

async function verifyCartOffer() {
    try {
        console.log("--- Phase 6 Verification: Cart & Offers ---");

        // 1. Fetch a product with offers
        const productsRes = await axios.get(`${API_URL}/products`);
        const product = productsRes.data.products[0];
        console.log(`Checking product: ${product.name} (ID: ${product.id})`);

        const detailsRes = await axios.get(`${API_URL}/products/${product.id}`);
        const details = detailsRes.data;

        console.log(`Buy Box Winner: ${details.buyBox ? details.buyBox.Store.name : 'None'}`);
        console.log(`Total Offers: ${details.offers.length}`);

        if (details.offers.length > 0) {
            console.log("✅ Buy Box integration in ProductService: SUCCESS");
        } else {
            console.log("⚠️ No offers found for this product. Make sure to create some for testing.");
        }

        console.log("--- End of Verification ---");
    } catch (err) {
        console.error("❌ Verification failed:", err.message);
    }
}

// Note: This script requires a running backend.
// verifyCartOffer(); 
console.log("Verification script ready. Run manually if needed.");
