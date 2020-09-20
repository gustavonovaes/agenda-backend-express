const request = require('supertest');
const mongoose = require('mongoose');
const { format, parseISO } = require('date-fns');

const server = require('../../src/server');
const mockAtividades = require('../util/mocks/atividades');
const mockUsuario = require('../util/mocks/usuario');

const MOCK_DATE = '2020-09-13';

async function cleanAllCollections() {
  mongoose.connections.forEach((connection) => {
    Object.keys(connection.collections).forEach(async (collectionName) => {
      await connection.collections[collectionName].deleteMany(() => {});
    });
  });
}

async function criaAtividade(props = {}, token = null) {
  const atividade = {
    titulo: 'Test apenas com titulo e dataInicio',
    dataInicio: MOCK_DATE,
    ...props,
  };

  const response = await request(server)
    .post('/api/atividades')
    .set('x-access-token', token)
    .send(atividade);

  return response.body;
}

async function criaUsuario() {
  const response = await request(server)
    .post('/api/autenticacao/registrar')
    .send(mockUsuario);

  return response.body;
}

describe('/api/atividades', () => {
  let token;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      connectTimeoutMS: 1000,
      socketTimeoutMS: 1000,
    });

    await cleanAllCollections();

    const res = await criaUsuario();
    token = res.token;
  });

  afterEach(async () => {
    await cleanAllCollections();
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it('Não lista nenhuma atividade', async () => {
    const responseEmpty = await request(server)
      .get('/api/atividades')
      .set('x-access-token', token);

    expect(responseEmpty.statusCode).toBe(200);
    expect(responseEmpty.body).toEqual([]);
  });

  it('Lista atividades cadastradas', async () => {
    await mongoose.connection
      .collection('atividades')
      .insertMany(mockAtividades);

    const response = await request(server)
      .get('/api/atividades')
      .set('x-access-token', token);

    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(mockAtividades.length);
  });

  it('Lista atividades na ordem correta', async () => {
    await mongoose.connection
      .collection('atividades')
      .insertMany(mockAtividades);

    const response = await request(server)
      .get('/api/atividades')
      .set('x-access-token', token);

    const responsePrimeiraAtividade = response.body.shift();
    const mockPrimeiraAtividade = mockAtividades.shift();
    expect(responsePrimeiraAtividade).toHaveProperty(
      'titulo',
      mockPrimeiraAtividade.titulo,
    );

    const responseUltimaAtividade = response.body.pop();
    const mockUltimaAtividade = mockAtividades.pop();
    expect(responseUltimaAtividade).toHaveProperty(
      'titulo',
      mockUltimaAtividade.titulo,
    );
  });

  it('Lista atividades com os campos esperados', async () => {
    await mongoose.connection
      .collection('atividades')
      .insertMany(mockAtividades);

    const response = await request(server)
      .get('/api/atividades')
      .set('x-access-token', token);

    const responseAtividadeKeys = Object.keys(response.body.shift());

    const expectedKeys = [
      'titulo',
      'descricao',
      'status',
      'dataInicio',
      'dataPrazo',
      'createdAt',
      'updatedAt',
    ];
    expect(responseAtividadeKeys).toEqual(expect.arrayContaining(expectedKeys));
  });

  it('Falha ao criar atividade vazia', async () => {
    const response = await request(server)
      .post('/api/atividades')
      .set('x-access-token', token)
      .send({});

    expect(response.statusCode).toBe(400);

    expect(response.body).toHaveProperty('message', 'Erros de validação!');
    expect(response.body).toHaveProperty(
      'errors.titulo',
      'Título é obrigatório!',
    );
    expect(response.body).toHaveProperty(
      'errors.dataInicio',
      'Data inicio é obrigatória!',
    );
  });

  it('Cria atividade com apenas titulo e dataInicio', async () => {
    const atividade = {
      titulo: 'Test apenas com titulo e dataInicio',
      dataInicio: MOCK_DATE,
    };

    const response = await request(server)
      .post('/api/atividades')
      .set('x-access-token', token)
      .send(atividade);

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('titulo', atividade.titulo);

    const dataInicio = format(new Date(response.body.dataInicio), 'yyyy-MM-dd');
    expect(dataInicio).toBe(atividade.dataInicio);

    const today = format(new Date(), 'yyyy-MM-dd');
    const createdAt = format(parseISO(response.body.createdAt), 'yyyy-MM-dd');
    const updatedAt = format(parseISO(response.body.updatedAt), 'yyyy-MM-dd');

    expect(createdAt).toBe(today);
    expect(updatedAt).toBe(today);
  });

  it('Atualiza atividade', async () => {
    const atividade = await criaAtividade({}, token);
    const id = atividade._id;

    const novaDescricao = 'Nova descrição';

    const response = await request(server)
      .put(`/api/atividades/${id}`)
      .set('x-access-token', token)
      .send({ descricao: novaDescricao });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('descricao', novaDescricao);
  });

  it('Falha ao tentar atualizar atividade que não existe', async () => {
    const idInexistente = 43;
    const response = await request(server)
      .put(`/api/atividades/${idInexistente}`)
      .set('x-access-token', token)
      .send({});

    expect(response.statusCode).toBe(404);
    expect(response.body.message).toEqual(
      'Dados não encontrados',
    );
  });

  it('Marca atividade como concluída', async () => {
    const atividade = await criaAtividade({ status: 'aberta' }, token);
    const id = atividade._id;

    const response = await request(server)
      .patch(`/api/atividades/${id}/concluir`)
      .set('x-access-token', token);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('status', 'concluída');

    const today = format(new Date(), 'yyyy-MM-dd');
    const dataConclusao = format(parseISO(response.body.dataConclusao), 'yyyy-MM-dd');
    expect(dataConclusao).toBe(today);
  });

  it('Falha ao tentar marcar atividade que não existe como concluída', async () => {
    const idInexistente = 43;
    const response = await request(server)
      .patch(`/api/atividades/${idInexistente}/concluir`)
      .set('x-access-token', token);

    expect(response.statusCode).toBe(404);
    expect(response.body.message).toEqual(
      'Dados não encontrados',
    );
  });
});
