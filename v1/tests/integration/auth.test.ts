import request from 'supertest';

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:8001';

describe('Auth Service Integration Tests', () => {
    describe('POST /api/auth/register', () => {
        it('should register a new user', async () => {
            const response = await request(AUTH_SERVICE_URL)
                .post('/api/auth/register')
                .send({
                    consumer_id: `TEST${Date.now()}`,
                    name: 'Test User',
                    email: `test${Date.now()}@example.com`,
                    password: 'Test@1234',
                    phone: '1234567890',
                });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('user');
            expect(response.body.data).toHaveProperty('token');
        });

        it('should not register user with existing consumer_id', async () => {
            const consumerId = `TEST${Date.now()}`;

            // Register first time
            await request(AUTH_SERVICE_URL)
                .post('/api/auth/register')
                .send({
                    consumer_id: consumerId,
                    name: 'Test User',
                    email: `test${Date.now()}@example.com`,
                    password: 'Test@1234',
                    phone: '1234567890',
                });

            // Try to register again
            const response = await request(AUTH_SERVICE_URL)
                .post('/api/auth/register')
                .send({
                    consumer_id: consumerId,
                    name: 'Another User',
                    email: `another${Date.now()}@example.com`,
                    password: 'Test@5678',
                    phone: '0987654321',
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
    });

    describe('POST /api/auth/login', () => {
        it('should login with valid credentials', async () => {
            const response = await request(AUTH_SERVICE_URL)
                .post('/api/auth/login')
                .send({
                    consumer_id: 'TEST001',
                    password: 'Test@1234',
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('token');
        });

        it('should not login with invalid credentials', async () => {
            const response = await request(AUTH_SERVICE_URL)
                .post('/api/auth/login')
                .send({
                    consumer_id: 'TEST001',
                    password: 'WrongPassword',
                });

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });
    });

    describe('GET /api/auth/verify', () => {
        it('should verify valid token', async () => {
            // First login to get token
            const loginResponse = await request(AUTH_SERVICE_URL)
                .post('/api/auth/login')
                .send({
                    consumer_id: 'TEST001',
                    password: 'Test@1234',
                });

            const token = loginResponse.body.data.token;

            // Verify token
            const response = await request(AUTH_SERVICE_URL)
                .get('/api/auth/verify')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        it('should reject invalid token', async () => {
            const response = await request(AUTH_SERVICE_URL)
                .get('/api/auth/verify')
                .set('Authorization', 'Bearer invalid_token');

            expect(response.status).toBe(401);
        });
    });
});
