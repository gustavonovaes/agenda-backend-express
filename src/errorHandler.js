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

  return next(error);
}

module.exports = errorHandler;
