import request from 'supertest';
import app from '../../../server.js';

describe('Logout API Test', () => {
    it('should return 200 OK on logout', async () => {
        const response = await request(app)
            .post('/api/auth/logout')
            .expect(200);

        expect(response.body).toHaveProperty('message', 'Déconnexion réussie');
    });
});
