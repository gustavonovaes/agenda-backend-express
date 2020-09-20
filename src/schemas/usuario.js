const { Schema } = require('mongoose');
const isEmail = require('validator/lib/isEmail');

const usuarioSchema = new Schema({
  nome: {
    type: String,
    required: [true, 'Nome é obrigatório!'],
    trim: true,
    minlength: [3, 'Nome muito curto!'],
    maxlength: [255, 'Nome muito longo!'],
  },
  email: {
    type: String,
    required: [true, 'Email é obrigatório!'],
    trim: true,
    lowercase: true,
    unique: true,
    minlength: [3, 'Email muito curto!'],
    maxlength: [255, 'Email muito longo!'],
    validate: [isEmail, 'Email inválido!'],
  },
  senha: {
    type: String,
    required: [true, 'Senha é obrigatória!'],
    trim: true,
    minlength: [6, 'Senha muito curta!'],
    maxlength: [255, 'Senha muito longa!'],
  },
  updatedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

module.exports = usuarioSchema;
