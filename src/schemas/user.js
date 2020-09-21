const { Schema } = require('mongoose');
const isEmail = require('validator/lib/isEmail');

const userSchema = new Schema({
  name: {
    type: String,
    trim: true,
    required: [true, 'Nome é obrigatório!'],
    minlength: [3, 'Nome muito curto!'],
    maxlength: [255, 'Nome muito longo!'],
  },
  email: {
    type: String,
    unique: true,
    trim: true,
    lowercase: true,
    required: [true, 'Email é obrigatório!'],
    minlength: [3, 'Email muito curto!'],
    maxlength: [255, 'Email muito longo!'],
    validate: [isEmail, 'Email inválido!'],
  },
  password: {
    type: String,
    trim: true,
    required: [true, 'Senha é obrigatória!'],
    minlength: [6, 'Senha muito curta!'],
    maxlength: [255, 'Senha muito longa!'],
  },
  updatedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

module.exports = userSchema;
