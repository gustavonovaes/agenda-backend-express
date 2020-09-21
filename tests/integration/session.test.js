const request = require('supertest');

const server = require('../../src/server');

const mockUser = require('../util/mocks/user');
const { connect, disconnect, cleanCollection } = require('../util/mongoose');

async function createUser(user) {
  const response = await request(server).post('/api/users').send(user);
  return response.body;
}

describe('/api/session', () => {
  beforeAll(async () => {
    await connect();
  });

  beforeEach(async () => {
    await cleanCollection('users');
  });

  afterAll(async () => {
    await cleanCollection('users');
    await disconnect();
  });

  it('store', async () => {
    await createUser(mockUser);

    const data = {
      email: mockUser.email,
      password: mockUser.password,
    };

    const res = await request(server).post('/api/session').send(data);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('refresh', async () => {
    const { token } = await createUser(mockUser);

    const res = await request(server)
      .post('/api/session/refresh')
      .set('x-access-token', token)
      .send();

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });
});
