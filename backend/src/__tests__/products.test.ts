import request from 'supertest';
import app from '../app';

describe('GET /api/products', () => {
  it('should return an array of products', async () => {
    const res = await request(app).get('/api/products');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
}); 