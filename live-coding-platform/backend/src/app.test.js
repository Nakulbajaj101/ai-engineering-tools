const request = require('supertest');
const app = require('./app');

describe('API Endpoints', () => {
  let sessionId;

  it('should create a new session', async () => {
    const res = await request(app)
      .post('/sessions')
      .expect(201);
    expect(res.body).toHaveProperty('sessionId');
    sessionId = res.body.sessionId;
  });

  it('should get session details', async () => {
    const res = await request(app)
      .get(`/sessions/${sessionId}`)
      .expect(200);
    expect(res.body).toHaveProperty('sessionId', sessionId);
  });

  it('should return 404 for non-existent session', async () => {
    await request(app)
      .get('/sessions/non-existent-id')
      .expect(404);
  });
  
  it('should serve Swagger UI', async () => {
    await request(app)
      .get('/api-docs/') // Note the trailing slash is often important for static files
      .expect(200)
      .expect('Content-Type', /text\/html/);
  });
});
