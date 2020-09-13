const { mockRequest, mockResponse } = require('../../util/interceptor');
const mockAtividades = require('../../util/mocks/atividades');

const atividadeController = require('../../../src/controllers/atividade');

describe('Controller Atividade', () => {
  it('index', async () => {
    const req = mockRequest();
    req.$models = {
      Atividade: {
        find: jest.fn().mockReturnValue(mockAtividades),
      },
    };

    const res = mockResponse();

    await atividadeController.index(req, res);

    expect(req.$models.Atividade.find).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockAtividades);
  });

  it('store', async () => {
    const atividade = {
      title: 'Titulo',
      dataInicio: '2020-09-13',
    };

    const req = mockRequest();
    req.$models = {
      Atividade: {
        create: jest.fn().mockReturnValue(atividade),
      },
    };

    const res = mockResponse();

    await atividadeController.store(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining(atividade));
  });

  it('update', async () => {
    const req = mockRequest();
    req.params.id = 123;
    req.body = {
      titulo: 'Titulo',
      dataInicio: '2020-09-13',
      descricao: 'Descrição atualizada',
    };
    req.$models = {
      Atividade: {
        findByIdAndUpdate: jest.fn().mockReturnValue(req.body),
      },
    };

    const res = mockResponse();

    await atividadeController.update(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining(req.body));
  });

  it('delete', async () => {
    const req = mockRequest();
    req.params.id = 123;
    req.$models = {
      Atividade: {
        findByIdAndDelete: jest.fn(),
      },
    };

    const res = mockResponse();

    await atividadeController.delete(req, res);

    expect(req.$models.Atividade.findByIdAndDelete).toHaveBeenCalledWith(req.params.id);
    expect(res.status).toHaveBeenCalledWith(204);
  });

  it('concluir', async () => {
    const req = mockRequest();
    req.params.id = 123;
    req.$models = {
      Atividade: {
        findByIdAndUpdate: jest.fn(),
      },
    };

    const res = mockResponse();

    await atividadeController.concluir(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(req.$models.Atividade.findByIdAndUpdate).toHaveBeenCalledTimes(1);
  });
});
