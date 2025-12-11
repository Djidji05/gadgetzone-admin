import request from 'supertest';
import app from '../../../server.js';
import { User } from '../models/index.js';

describe('Auth API Tests', () => {
    describe('POST /api/auth/register', () => {
        it('should register a new user successfully', async () => {
            const userData = {
                firstName: 'Test',
                lastName: 'User',
                email: `test${Date.now()}@example.com`,
                password: 'password123'
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(userData)
                .expect(201);

            expect(response.body).toHaveProperty('token');
            expect(response.body).toHaveProperty('customer');
            expect(response.body.customer.email).toBe(userData.email);
        });

        it('should fail with invalid email', async () => {
            const userData = {
                firstName: 'Test',
                lastName: 'User',
                email: 'invalid-email',
                password: 'password123'
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(userData)
                .expect(400);

            expect(response.body).toHaveProperty('error');
        });

        it('should fail with short password', async () => {
            const userData = {
                firstName: 'Test',
                lastName: 'User',
                email: 'test@example.com',
                password: '123'
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(userData)
                .expect(400);

            expect(response.body.errors).toContain('Le mot de passe doit contenir au moins 6 caractères');
        });
    });

    describe('POST /api/auth/login', () => {
        let testUser;

        beforeAll(async () => {
            // Create a test user
            testUser = {
                email: `testlogin${Date.now()}@example.com`,
                password: 'password123'
            };

            await request(app)
                .post('/api/auth/register')
                .send({
                    firstName: 'Test',
                    lastName: 'Login',
                    ...testUser
                });
        });

        it('should login successfully with correct credentials', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send(testUser)
                .expect(200);

            expect(response.body).toHaveProperty('token');
            expect(response.body).toHaveProperty('customer');
        });

        it('should fail with incorrect password', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: 'wrongpassword'
                })
                .expect(401);

            expect(response.body).toHaveProperty('error');
        });

        it('should fail with non-existent email', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: 'password123'
                })
                .expect(401);

            expect(response.body).toHaveProperty('error');
        });
    });

    describe('Rate Limiting', () => {
        it('should block after 5 failed login attempts', async () => {
            const credentials = {
                email: 'test@example.com',
                password: 'wrongpassword'
            };

            // Make 5 failed attempts
            for (let i = 0; i < 5; i++) {
                await request(app)
                    .post('/api/auth/login')
                    .send(credentials);
            }

            // 6th attempt should be rate limited
            const response = await request(app)
                .post('/api/auth/login')
                .send(credentials)
                .expect(429);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('Trop de tentatives');
        });
    });
});
