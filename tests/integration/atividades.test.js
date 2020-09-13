const request = require('supertest');
const mongoose = require('mongoose');
const { format } = require('date-fns');

const server = require('../../src/server');
const mockAtividades = require('../util/mocks/atividades');

const MOCK_DATE = '2020-09-13';

async function cleanAllCollections() {
  mongoose.connections.forEach((connection) => {
    Object.keys(connection.collections).forEach(async (collectionName) => {
      await connection.collections[collectionName].deleteMany(() => { });
    });
  });
}

async function criaAtividade(props = {}) {
  const atividade = {
    titulo: 'Test apenas com titulo e dataInicio',
    dataInicio: MOCK_DATE,
    ...props,
  };

  const response = await request(server)
    .post('/api/atividades')
    .send(atividade);

  return response.body;
}

describe('/api/atividades', () => {
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

  it('Não lista nenhuma atividade', async () => {
    const responseEmpty = await request(server).get('/api/atividades');
    expect(responseEmpty.statusCode).toBe(200);
    expect(responseEmpty.body).toEqual([]);
  });

  it('Lista atividades cadastradas', async () => {
    await mongoose.connection.collection('atividades').insertMany(mockAtividades);

    const response = await request(server).get('/api/atividades');

    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(mockAtividades.length);
  });

  it('Lista atividades na ordem correta', async () => {
    await mongoose.connection.collection('atividades').insertMany(mockAtividades);

    const response = await request(server).get('/api/atividades');

    const responsePrimeiraAtividade = response.body.shift();
    const mockPrimeiraAtividade = mockAtividades.shift();
    expect(responsePrimeiraAtividade).toHaveProperty('titulo', mockPrimeiraAtividade.titulo);

    const responseUltimaAtividade = response.body.pop();
    const mockUltimaAtividade = mockAtividades.pop();
    expect(responseUltimaAtividade).toHaveProperty('titulo', mockUltimaAtividade.titulo);
  });

  it('Lista atividades com os campos esperados', async () => {
    await mongoose.connection.collection('atividades').insertMany(mockAtividades);
    const response = await request(server).get('/api/atividades');

    const responseAtividadeKeys = Object.keys(response.body.shift());

    const expectedKeys = ['titulo', 'descricao', 'status', 'dataInicio', 'dataPrazo', 'createdAt', 'updatedAt'];
    expect(responseAtividadeKeys).toEqual(expect.arrayContaining(expectedKeys));
  });

  it('Falha ao criar atividade vazia', async () => {
    const response = await request(server)
      .post('/api/atividades')
      .send({});

    expect(response.statusCode).toBe(400);

    expect(response.body).toHaveProperty('message', 'Erros de validação!');
    expect(response.body).toHaveProperty('errors.titulo', 'Título é obrigatório!');
    expect(response.body).toHaveProperty('errors.dataInicio', 'Data inicio é obrigatória!');
  });

  it('Cria atividade com apenas titulo e dataInicio', async () => {
    const atividade = {
      titulo: 'Test apenas com titulo e dataInicio',
      dataInicio: MOCK_DATE,
    };

    const response = await request(server)
      .post('/api/atividades')
      .send(atividade);

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('titulo', atividade.titulo);

    const dataInicio = format(new Date(response.body.dataInicio), 'yyyy-MM-dd');
    expect(dataInicio).toBe(atividade.dataInicio);

    const createdAt = format(new Date(response.body.createdAt), 'yyyy-MM-dd');
    expect(createdAt).toBe(MOCK_DATE);

    const updatedAt = format(new Date(response.body.updatedAt), 'yyyy-MM-dd');
    expect(updatedAt).toBe(MOCK_DATE);
  });

  it('Atualiza atividade', async () => {
    const atividade = await criaAtividade();
    const id = atividade._id;

    const novaDescricao = 'Nova descrição';

    const response = await request(server)
      .put(`/api/atividades/${id}`)
      .send({ descricao: novaDescricao });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('descricao', novaDescricao);
  });

  it('Falha ao tentar atualizar atividade que não existe', async () => {
    const idInexistente = 43;
    const response = await request(server).put(`/api/atividades/${idInexistente}`).send({});

    expect(response.statusCode).toBe(404);
    expect(response.body.message).toEqual('Atividade não encontrada para o id informado');
  });

  it('Marca atividade como concluída', async () => {
    const atividade = await criaAtividade({ status: 'aberta' });
    const id = atividade._id;

    const response = await request(server).patch(`/api/atividades/${id}/concluir`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('status', 'concluída');

    const dataConclusao = format(new Date(response.body.dataConclusao), 'yyyy-MM-dd');
    expect(dataConclusao).toBe(MOCK_DATE);
  });

  it('Falha ao tentar marcar atividade que não existe como concluída', async () => {
    const idInexistente = 43;
    const response = await request(server).patch(`/api/atividades/${idInexistente}`);

    expect(response.statusCode).toBe(404);
    expect(response.body.message).toEqual('Atividade não encontrada para o id informado');
  });
});
