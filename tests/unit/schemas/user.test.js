const mongoose = require('mongoose');
const Schemas = require('../../../src/schemas');

const userMock = require('../../util/mocks/user');

describe('Schema User', () => {
  let User;

  beforeEach(() => {
    User = mongoose.model('User', Schemas.User);
  });

  it('Deve ser inválido se vazio', async () => {
    const error = new User({}).validateSync();

    expect(error).not.toBeUndefined();
    expect(error.errors).toHaveProperty('name.message', 'Nome é obrigatório!');
    expect(error.errors).toHaveProperty(
      'email.message',
      'Email é obrigatório!',
    );
    expect(error.errors).toHaveProperty(
      'password.message',
      'Senha é obrigatória!',
    );
  });

  it('Deve ser inválido com nome abaixo de 3 caractéres', async () => {
    const error = new User({
      ...userMock,
      name: 'AB',
    }).validateSync();

    expect(error).not.toBeUndefined();
    expect(error.errors).toHaveProperty('name.message', 'Nome muito curto!');
  });

  it('Deve ser inválido com nome acima de 255 caractéres', async () => {
    const error = new User({
      ...userMock,
      name: 'a'.repeat(256),
    }).validateSync();

    expect(error).not.toBeUndefined();
    expect(error.errors).toHaveProperty('name.message', 'Nome muito longo!');
  });

  it('Deve ser inválido se email é inválido', async () => {
    const error = new User({
      ...userMock,
      email: 'notemail@',
    }).validateSync();

    expect(error).not.toBeUndefined();
    expect(error.errors).toHaveProperty('email.message', 'Email inválido!');
  });

  it('Deve ser inválido se já existir usuário com mesmo email', async () => {
    // TODO:FIXME: Criar um registro antes para testar o unique
    expect(1).toBe(1);
  });

  it('Deve ser inválido com senha abaixo de 3 caractéres', async () => {
    const error = new User({
      ...userMock,
      password: 'AB',
    }).validateSync();

    expect(error).not.toBeUndefined();
    expect(error.errors).toHaveProperty('password.message', 'Senha muito curta!');
  });

  it('Deve ser inválido com senha acima de 255 caractéres', async () => {
    const error = new User({
      ...userMock,
      password: 'a'.repeat(256),
    }).validateSync();

    expect(error).not.toBeUndefined();
    expect(error.errors).toHaveProperty('password.message', 'Senha muito longa!');
  });
});
