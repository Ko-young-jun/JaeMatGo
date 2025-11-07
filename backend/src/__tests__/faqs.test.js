const request = require('supertest');
const app = require('../server');

describe('GET /api/faqs', () => {
  it('should return a list of FAQs', async () => {
    const response = await request(app).get('/api/faqs');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    if (response.body.length > 0) {
      expect(response.body[0]).toHaveProperty('question');
      expect(typeof response.body[0].question).toBe('string');
      expect(response.body[0]).toHaveProperty('answers');
      expect(Array.isArray(response.body[0].answers)).toBe(true);
    }
  });
});
