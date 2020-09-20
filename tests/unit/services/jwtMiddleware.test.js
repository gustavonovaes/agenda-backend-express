const jwt = require('jsonwebtoken');
const { jwtMiddleware } = require('../../../src/services/jwt');

const { mockRequest, mockResponse } = require('../../util/interceptor');

describe('Service JWT Middleware', () => {
  it('Falha token não for passado no cabeçalho', async () => {
    const req = mockRequest();
    const res = mockResponse();

    req.headers = {
      'x-access-token': null,
    };

    await jwtMiddleware(req, res, jest.fn());

    expect(res.status).toBeCalledWith(401);
    expect(res.json).toBeCalledWith({ message: 'No token provided.' });
  });

  it('Falha se token expirado for passado no cabeçalho', async () => {
    const req = mockRequest();
    const res = mockResponse();

    const tokenExpirado = jwt.sign({
      id: 1,
      nome: 'A',
    }, process.env.JWT_SECRET, {
      expiresIn: '-10h',
    });

    req.headers = {
      'x-access-token': tokenExpirado,
    };

    await jwtMiddleware(req, res, jest.fn());

    expect(res.status).toBeCalledWith(400);
    expect(res.json).toBeCalledWith({ message: 'Token expired.' });
  });

  it('Falha se token inválido for passado no cabeçalho', async () => {
    const req = mockRequest();
    const res = mockResponse();

    req.headers = {
      'x-access-token': 'A'.repeat(256),
    };

    await jwtMiddleware(req, res, jest.fn());

    expect(res.status).toBeCalledWith(403);
    expect(res.json).toBeCalledWith({ message: 'Failed to autenticate token.' });
  });
});
