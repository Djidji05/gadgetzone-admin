import request from 'supertest';
import { sequelize } from '../config/database.js';
import app from '../../server.js';

// Import des modèles
import { User, Product, Category, Order, OrderItem } from '../models/index.js';

describe('API Tests', () => {
  let authToken;
  let testUser;
  let testProduct;
  let testCategory;

  beforeAll(async () => {
    // Synchroniser la base de données pour les tests
    await sequelize.sync({ force: true });
    
    // Créer une catégorie de test
    testCategory = await Category.create({
      name: 'Test Category',
      description: 'Category for testing'
    });
    
    // Créer un utilisateur de test
    testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', // hashed 'password123'
      role: 'admin'
    });
  });

  afterAll(async () => {
    // Nettoyer la base de données
    await sequelize.close();
  });

  describe('Auth Routes', () => {
    test('POST /api/auth/login - should authenticate user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('email', 'test@example.com');
      
      authToken = response.body.token;
    });

    test('POST /api/auth/login - should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Identifiants invalides');
    });

    test('GET /api/auth/profile - should get user profile', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.user).toHaveProperty('email', 'test@example.com');
    });

    test('GET /api/auth/profile - should reject without token', async () => {
      const response = await request(app)
        .get('/api/auth/profile');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Accès refusé');
    });
  });

  describe('Product Routes', () => {
    beforeEach(async () => {
      // Créer un produit de test
      testProduct = await Product.create({
        name: 'Test Product',
        description: 'Product for testing',
        price: 99.99,
        stock: 10,
        category_id: testCategory.id
      });
    });

    afterEach(async () => {
      // Nettoyer le produit de test
      if (testProduct) {
        await testProduct.destroy();
      }
    });

    test('GET /api/products - should get products list', async () => {
      const response = await request(app)
        .get('/api/products')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.products)).toBe(true);
    });

    test('POST /api/products - should create new product', async () => {
      const productData = {
        name: 'New Test Product',
        description: 'New product description',
        price: 149.99,
        stock: 25,
        category_id: testCategory.id
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(productData);

      expect(response.status).toBe(201);
      expect(response.body.product).toHaveProperty('name', 'New Test Product');
      
      // Nettoyer
      await Product.destroy({ where: { id: response.body.product.id } });
    });

    test('PUT /api/products/:id - should update product', async () => {
      const updateData = {
        name: 'Updated Product Name',
        price: 199.99
      };

      const response = await request(app)
        .put(`/api/products/${testProduct.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.product).toHaveProperty('name', 'Updated Product Name');
    });

    test('DELETE /api/products/:id - should delete product', async () => {
      const response = await request(app)
        .delete(`/api/products/${testProduct.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Produit supprimé avec succès');
    });
  });

  describe('Stats Routes', () => {
    test('GET /api/stats/overview - should get overview stats', async () => {
      const response = await request(app)
        .get('/api/stats/overview')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('counts');
      expect(response.body.data.counts).toHaveProperty('products');
      expect(response.body.data.counts).toHaveProperty('orders');
      expect(response.body.data.counts).toHaveProperty('users');
    });

    test('GET /api/stats/top-products - should get top products', async () => {
      const response = await request(app)
        .get('/api/stats/top-products')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('GET /api/stats/inventory-alerts - should get inventory alerts', async () => {
      const response = await request(app)
        .get('/api/stats/inventory-alerts')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('count');
    });
  });

  describe('Validation Tests', () => {
    test('POST /api/auth/register - should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: '123' // too short
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Erreur de validation');
      expect(Array.isArray(response.body.errors)).toBe(true);
    });

    test('POST /api/products - should validate product data', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: '', // empty name
          price: -10 // negative price
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Erreur de validation');
      expect(Array.isArray(response.body.errors)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('GET /api/products/99999 - should handle not found', async () => {
      const response = await request(app)
        .get('/api/products/99999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    test('POST /api/invalid-route - should handle 404', async () => {
      const response = await request(app)
        .post('/api/invalid-route')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('Health Check', () => {
    test('GET /health - should return health status', async () => {
      const response = await request(app)
        .get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
    });
  });
});
