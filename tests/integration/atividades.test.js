const request = require('supertest');
const { format, parseISO } = require('date-fns');

const server = require('../../src/server');

const mockAtividades = require('../util/mocks/atividades');
const mockUser = require('../util/mocks/user');
const { connect, disconnect, cleanCollection } = require('../util/mongoose');

const MOCK_DATE = '2020-09-13';

async function createAtividade(props = {}, token = null) {
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

async function createUser() {
  const response = await request(server).post('/api/users').send(mockUser);
  return response.body;
}

describe('/api/atividades', () => {
  let conn;
  let token;

  beforeAll(async () => {
    conn = await connect();

    await cleanCollection('users');
    await cleanCollection('atividades');

    const res = await createUser();
    token = res.token;
  });

  afterEach(async () => {
    await cleanCollection('atividades');
  });

  afterAll(async () => {
    await cleanCollection('users');
    await cleanCollection('atividades');
    await disconnect();
  });

  it('Não lista nenhuma atividade', async () => {
    const responseEmpty = await request(server)
      .get('/api/atividades')
      .set('x-access-token', token);

    expect(responseEmpty.statusCode).toBe(200);
    expect(responseEmpty.body).toEqual([]);
  });

  it('Lista atividades cadastradas', async () => {
    await conn.db.collection('atividades').insertMany(mockAtividades);
    const response = await request(server)
      .get('/api/atividades')
      .set('x-access-token', token);

    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(mockAtividades.length);
  });

  it('Lista atividades na ordem correta', async () => {
    await conn.collection('atividades').insertMany(mockAtividades);
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
    await conn.collection('atividades').insertMany(mockAtividades);

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

    expect(response.statusCode).toBe(422);

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
    const atividade = await createAtividade({}, token);
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
    expect(response.body.message).toEqual('Dados não encontrados');
  });

  it('Marca atividade como concluída', async () => {
    const atividade = await createAtividade({ status: 'aberta' }, token);
    const id = atividade._id;

    const response = await request(server)
      .patch(`/api/atividades/${id}/concluir`)
      .set('x-access-token', token);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('status', 'concluída');

    const today = format(new Date(), 'yyyy-MM-dd');
    const dataConclusao = format(
      parseISO(response.body.dataConclusao),
      'yyyy-MM-dd',
    );
    expect(dataConclusao).toBe(today);
  });

  it('Falha ao tentar marcar atividade que não existe como concluída', async () => {
    const idInexistente = 43;
    const response = await request(server)
      .patch(`/api/atividades/${idInexistente}/concluir`)
      .set('x-access-token', token);

    expect(response.statusCode).toBe(404);
    expect(response.body.message).toEqual('Dados não encontrados');
  });
});
