const request = require('supertest');
const mongoose = require('mongoose');

const server = require('../../src/server');
const mockUsuario = require('../util/mocks/usuario');

async function cleanAllCollections() {
  mongoose.connections.forEach((connection) => {
    Object.keys(connection.collections).forEach(async (collectionName) => {
      await connection.collections[collectionName].deleteMany(() => {});
    });
  });
}

async function criaUsuario() {
  const response = await request(server)
    .post('/api/autenticacao/registrar')
    .send(mockUsuario);

  return response.body;
}

describe('/api/autenticacao', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      connectTimeoutMS: 1000,
      socketTimeoutMS: 1000,
    });

    await cleanAllCollections();
  });

  afterEach(async () => {
    await cleanAllCollections();
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it('login', async () => {
    await criaUsuario();

    const res = await request(server).post('/api/autenticacao/login').send({
      email: mockUsuario.email,
      senha: mockUsuario.senha,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('registrar', async () => {
    const res = await request(server)
      .post('/api/autenticacao/registrar')
      .send(mockUsuario);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
  });

  it('refresh', async () => {
    const { token } = await criaUsuario();

    const res = await request(server)
      .post('/api/autenticacao/refresh')
      .set('x-access-token', token)
      .send();

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });
});
