const request = require('supertest');

const server = require('../../src/server');
const mockUser = require('../util/mocks/user');
const { connect, disconnect, cleanCollection } = require('../util/mongoose');

describe('/api/users', () => {
  beforeAll(async () => {
    await connect();
  });

  beforeEach(async () => {
    await cleanCollection('users');
  });

  afterAll(async () => {
    await disconnect();
  });

  it('store', async () => {
    const res = await request(server).post('/api/users').send(mockUser);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
  });
});
