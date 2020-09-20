const { ValidationError, CastError } = require('mongoose').Error;

function parseValidationError(error) {
  const errors = Object.keys(error.errors).reduce((acc, key) => {
    acc[key] = error.errors[key].message;
    return acc;
  }, {});

  return {
    message: 'Erros de validação!',
    errors,
  };
}

function parseDuplicateKeyError(error) {
  const keys = Object.keys(error.keyPattern).join(', ');
  return {
    message: `Já existe um registro com o mesmo valor para os campos: ${keys}`,
  };
}

function errorHandler(error, req, res, next) {
  if (error instanceof ValidationError) {
    return res.status(400)
      .json(parseValidationError(error));
  }

  if (error instanceof CastError) {
    return res.status(404).json({
      message: 'Dados não encontrados',
    });
  }

  // Duplicate key error code 11000
  if (error.code === 11000) {
    return res.status(400).json(parseDuplicateKeyError(error));
  }

  res.status(500).json({
    message: error.message,
  });

  return next(error);
}

module.exports = errorHandler;
