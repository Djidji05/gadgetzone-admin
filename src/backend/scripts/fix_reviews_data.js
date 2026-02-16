
import { Review, User } from '../models/index.js';
import sequelize from '../config/database.js';

const fixReviews = async () => {
    try {
        console.log('🔍 Checking users...');

        let user = await User.findOne();

        if (!user) {
            console.log('⚠️ No users found. Creating a test user...');
            // Create a dummy user if none exists
            user = await User.create({
                name: 'Robert Dupont',
                email: 'robert@test.com',
                password: 'password123', // Dummy password
                role: 'client'
            });
            console.log('✅ Created test user:', user.name);
        } else {
            console.log('✅ Found user:', user.name);
        }

        console.log('🔍 Fetching reviews with missing user_id...');
        const orphanedReviews = await Review.findAll({
            where: {
                user_id: null
            }
        });

        console.log(`found ${orphanedReviews.length} orphaned reviews.`);

        if (orphanedReviews.length > 0) {
            console.log('🛠️ Updating reviews to point to user ID:', user.id);

            // Update all orphaned reviews
            const [updatedCount] = await Review.update(
                { user_id: user.id },
                {
                    where: { user_id: null }
                }
            );

            console.log(`✅ Successfully updated ${updatedCount} reviews.`);
        } else {
            console.log('✅ No reviews need fixing.');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await sequelize.close();
    }
}

fixReviews();
