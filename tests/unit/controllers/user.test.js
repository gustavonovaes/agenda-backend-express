const { mockRequest, mockResponse } = require('../../util/express');

const userController = require('../../../src/controllers/user');
const mockUser = require('../../util/mocks/user');

describe('Controller User', () => {
  it('store', async () => {
    const req = mockRequest();

    req.body = {
      password: 'hardpass',
    };

    const exec = jest.fn().mockReturnValue(mockUser);

    req.$models = {
      User: {
        create: jest.fn().mockReturnValue({ exec }),
      },
    };

    const token = 123;

    req.$jwt = {
      sign: jest.fn().mockReturnValue(token),
    };

    const res = mockResponse();

    await userController.store(req, res);

    expect(req.$models.User.create).toHaveBeenCalledTimes(1);
    expect(req.$jwt.sign).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ token });
  });
});
