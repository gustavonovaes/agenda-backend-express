const mongoose = require('mongoose');

// Retorna o documento com o update aplicado
mongoose.set('returnOriginal', false);

// Habilita validação nas api's de update
mongoose.plugin((schema) => {
  function setRunValidators() {
    this.setOptions({ runValidators: true });
  }

  schema.pre('findOneAndUpdate', setRunValidators);
  schema.pre('updateMany', setRunValidators);
  schema.pre('updateOne', setRunValidators);
  schema.pre('update', setRunValidators);
});

function defineSchemaModels(conn, schemas) {
  return Object.keys(schemas).reduce((acc, name) => {
    acc[name] = conn.model(name, schemas[name]);
    return acc;
  }, {});
}

const mongooseServiceFactory = ({ uri, timeout, schemas }) => (req, _, next) => {
  let $cache;

  Object.defineProperty(req, '$models', {
    get() {
      if ($cache) {
        return $cache;
      }

      const conn = mongoose.createConnection(uri, {
        useCreateIndex: true,
        useNewUrlParser: true,
        useUnifiedTopology: true,
        connectTimeoutMS: timeout,
        socketTimeoutMS: timeout,
      });

      $cache = defineSchemaModels(conn, schemas);

      return $cache;
    },
  });

  next();
};

module.exports = mongooseServiceFactory;
