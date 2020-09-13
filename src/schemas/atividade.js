const { Schema } = require('mongoose');

const atividadeSchema = new Schema({
  titulo: {
    type: String,
    required: [true, 'Título é obrigatório!'],
    trim: true,
    minlength: [3, 'Título muito curto!'],
    maxlength: [255, 'Título muito longo!'],
  },
  descricao: {
    type: String,
    trim: true,
    default: '',
    maxlength: [2048, 'Descrição muito longa!'],
  },
  dataInicio: {
    type: Date,
    required: [true, 'Data inicio é obrigatória!'],
  },
  dataPrazo: {
    type: Date,
    default: '',
    validate:
    {
      validator(value) {
        if (!value) {
          return true;
        }

        return value >= this.dataInicio;
      },
      message: () => 'Data prazo deve ser maior ou igual que data inicio!',
    },
  },
  status: {
    type: String,
    default: 'aberta',
    enum: {
      values: ['aberta', 'concluída'],
      message: (props) => `Status deve ser 'aberta' ou 'concluída'. O valor '${props.value}' é inválido!`,
    },
  },
  dataConclusao: Date,
  updatedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

module.exports = atividadeSchema;
