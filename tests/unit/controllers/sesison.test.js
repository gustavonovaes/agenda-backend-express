const { mockRequest, mockResponse } = require('../../util/express');

const sessionController = require('../../../src/controllers/session');
const mockUser = require('../../util/mocks/user');

describe('Controller Session', () => {
  it('store', async () => {
    const req = mockRequest();
    req.body = {
      email: mockUser.email,
      password: mockUser.password,
    };

    const exec = jest.fn().mockReturnValue(mockUser);
    req.$models = {
      User: {
        findOne: jest.fn().mockReturnValue({ exec }),
      },
    };

    const token = 123;
    req.$jwt = {
      sign: jest.fn().mockReturnValue(token),
    };

    const res = mockResponse();

    await sessionController.store(req, res);

    expect(req.$models.User.findOne).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ token });
  });

  it('refresh', async () => {
    let req = mockRequest();

    const token = 123;

    req = Object.assign(req, {
      user: {
        id: mockUser.id,
        nome: mockUser.nome,
      },
      $jwt: {
        sign: jest.fn().mockReturnValue(token),
      },
    });

    const res = mockResponse();

    await sessionController.refresh(req, res);

    expect(req.$jwt.sign).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ token });
  });
});
