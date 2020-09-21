const mongoose = require('mongoose');
const mockdate = require('mockdate');
const { format, addDays } = require('date-fns');

const Schemas = require('../../../src/schemas');

const MOCKED_DATE = '2020-09-13';
describe('Schema Atividade', () => {
  let Atividade;

  const atividadeValida = {
    titulo: 'Titulo',
    descricao: 'Descrição',
    dataInicio: new Date(),
  };

  beforeEach(() => {
    Atividade = mongoose.model('Atividade', Schemas.Atividade);
  });

  afterEach(() => {
    mockdate.reset();
  });

  it('Deve ser inválido se vazio', async () => {
    const error = new Atividade({}).validateSync();

    expect(error).not.toBeUndefined();
    expect(error.errors).toHaveProperty(
      'titulo.message',
      'Título é obrigatório!',
    );
    expect(error.errors).toHaveProperty(
      'dataInicio.message',
      'Data inicio é obrigatória!',
    );
  });

  it('Deve ser inválido com titulo abaixo de 3 caractéres', async () => {
    const error = new Atividade({
      ...atividadeValida,
      titulo: 'AB',
    }).validateSync();

    expect(error).not.toBeUndefined();
    expect(error.errors).toHaveProperty(
      'titulo.message',
      'Título muito curto!',
    );
  });

  it('Deve ser inválido com titulo acima de 255 caractéres', async () => {
    const error = new Atividade({
      ...atividadeValida,
      titulo: 'a'.repeat(256),
    }).validateSync();

    expect(error).not.toBeUndefined();
    expect(error.errors).toHaveProperty(
      'titulo.message',
      'Título muito longo!',
    );
  });

  it('Deve ser inválido com descrição acima de 2048 caractéres', async () => {
    const error = new Atividade({
      ...atividadeValida,
      descricao: 'a'.repeat(2049),
    }).validateSync();

    expect(error).not.toBeUndefined();
    expect(error.errors).toHaveProperty(
      'descricao.message',
      'Descrição muito longa!',
    );
  });

  it('Deve ser inválido se dataPrazo < dataInicio', async () => {
    const error = new Atividade({
      ...atividadeValida,
      dataPrazo: '2020-09-10',
    }).validateSync();

    expect(error).not.toBeUndefined();
    expect(error.errors).toHaveProperty(
      'dataPrazo.message',
      'Data prazo deve ser maior ou igual que data inicio!',
    );
  });

  it('Deve ser válido se dataPrazo >= dataInicio', async () => {
    mockdate.set(MOCKED_DATE);

    const atividadeComDataPrazoIgual = {
      ...atividadeValida,
      dataPrazo: atividadeValida.dataInicio,
    };

    const atividadeComDataPrazoMaior = {
      ...atividadeValida,
      dataPrazo: addDays(atividadeValida.dataInicio, 1),
    };

    const dataPrazoIgual = new Atividade(atividadeComDataPrazoIgual).validateSync();
    expect(dataPrazoIgual).toBeUndefined();

    const dataPrazoMaior = new Atividade(atividadeComDataPrazoMaior).validateSync();
    expect(dataPrazoMaior).toBeUndefined();
  });

  it('Deve ser inválido se status for diferente de aberto e concluído', async () => {
    const error = new Atividade({
      ...atividadeValida,
      status: 'invalid',
    }).validateSync();

    expect(error.errors).toHaveProperty(
      'status.message',
      "Status deve ser 'aberta' ou 'concluída'. O valor 'invalid' é inválido!",
    );
  });

  it('Deve preencher data de criação e atualização ao ser criado', async () => {
    const atividade = new Atividade(atividadeValida);

    const now = format(new Date(), 'yyyy-MM-dd');
    const createdAt = format(atividade.createdAt, 'yyyy-MM-dd');
    const updatedAt = format(atividade.updatedAt, 'yyyy-MM-dd');

    expect(createdAt).toEqual(now);
    expect(updatedAt).toEqual(now);
  });
});
