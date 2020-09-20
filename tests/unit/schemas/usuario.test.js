const mongoose = require('mongoose');
const Schemas = require('../../../src/schemas');

const usuarioMock = require('../../util/mocks/usuario');

describe('Schema Usuario', () => {
  let Usuario;

  beforeEach(() => {
    Usuario = mongoose.model('Usuario', Schemas.Usuario);
  });

  it('Deve ser inválido se vazio', async () => {
    const error = new Usuario({}).validateSync();

    expect(error).not.toBeUndefined();
    expect(error.errors).toHaveProperty('nome.message', 'Nome é obrigatório!');
    expect(error.errors).toHaveProperty(
      'email.message',
      'Email é obrigatório!',
    );
    expect(error.errors).toHaveProperty(
      'senha.message',
      'Senha é obrigatória!',
    );
  });

  it('Deve ser inválido com nome abaixo de 3 caractéres', async () => {
    const error = new Usuario({
      ...usuarioMock,
      nome: 'AB',
    }).validateSync();

    expect(error).not.toBeUndefined();
    expect(error.errors).toHaveProperty('nome.message', 'Nome muito curto!');
  });

  it('Deve ser inválido com nome acima de 255 caractéres', async () => {
    const error = new Usuario({
      ...usuarioMock,
      nome: 'a'.repeat(256),
    }).validateSync();

    expect(error).not.toBeUndefined();
    expect(error.errors).toHaveProperty('nome.message', 'Nome muito longo!');
  });

  it('Deve ser inválido se email é inválido', async () => {
    const error = new Usuario({
      ...usuarioMock,
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
    const error = new Usuario({
      ...usuarioMock,
      senha: 'AB',
    }).validateSync();

    expect(error).not.toBeUndefined();
    expect(error.errors).toHaveProperty('senha.message', 'Senha muito curta!');
  });

  it('Deve ser inválido com senha acima de 255 caractéres', async () => {
    const error = new Usuario({
      ...usuarioMock,
      senha: 'a'.repeat(256),
    }).validateSync();

    expect(error).not.toBeUndefined();
    expect(error.errors).toHaveProperty('senha.message', 'Senha muito longa!');
  });
});
