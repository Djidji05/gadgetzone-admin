import { Review, User } from '../models/index.js';

const debugReviews = async () => {
    try {
        console.log('🔍 Fetching reviews...');
        const reviews = await Review.findAll({
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'email']
                }
            ],
            limit: 5
        });

        console.log(`✅ Found ${reviews.length} reviews`);
        reviews.forEach(r => {
            console.log(`Review ${r.id}: User=${r.user ? r.user.name : 'NULL'} (ID: ${r.user_id})`);
            if (r.user) {
                console.log('   - User obj:', JSON.stringify(r.user.toJSON()));
            }
        });

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

debugReviews();
