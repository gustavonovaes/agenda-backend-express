const { mockRequest, mockResponse } = require('../../util/interceptor');

const autenticacaoController = require('../../../src/controllers/autenticacao');
const mockUsuario = require('../../util/mocks/usuario');

describe('Controller Autenticacao', () => {
  it('login', async () => {
    let req = mockRequest();

    const token = 123;

    const exec = jest.fn().mockReturnValue(mockUsuario);
    req = Object.assign(req, {
      $models: {
        Usuario: {
          findOne: jest.fn().mockReturnValue({ exec }),
        },
      },
      $jwt: {
        sign: jest.fn().mockReturnValue(token),
      },
    });

    const res = mockResponse();

    await autenticacaoController.login(req, res);

    expect(req.$models.Usuario.findOne).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ token });
  });

  it('registrar', async () => {
    let req = mockRequest();

    const token = 123;

    const exec = jest.fn().mockReturnValue(mockUsuario);

    req = Object.assign(req, {
      $models: {
        Usuario: {
          create: jest.fn().mockReturnValue({ exec }),
        },
      },
      $jwt: {
        sign: jest.fn().mockReturnValue(token),
      },
    });

    const res = mockResponse();

    await autenticacaoController.registrar(req, res);

    expect(req.$models.Usuario.create).toHaveBeenCalledTimes(1);
    expect(req.$jwt.sign).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ token });
  });

  it('refresh', async () => {
    let req = mockRequest();

    const token = 123;

    req = Object.assign(req, {
      user: {
        id: mockUsuario.id,
        nome: mockUsuario.nome,
      },
      $jwt: {
        sign: jest.fn().mockReturnValue(token),
      },
    });

    const res = mockResponse();

    await autenticacaoController.refresh(req, res);

    expect(req.$jwt.sign).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ token });
  });
});
