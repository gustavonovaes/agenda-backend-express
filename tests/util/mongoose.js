const mongoose = require('mongoose');

let conn = null;

async function connect() {
  if (conn) {
    return conn;
  }

  conn = await mongoose.createConnection(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    connectTimeoutMS: 5000,
    socketTimeoutMS: 5000,
  });

  return conn;
}

async function disconnect() {
  /* Não funciona! O jest reclama que ainda existe um processo
   async rodando */
  // conn.close()
  await mongoose.disconnect();
}

async function cleanCollection(collection) {
  // await conn.collection(collection).deleteMany(() => {});
  await conn.db.dropCollection(collection).catch(() => {});
}

module.exports = {
  connect,
  disconnect,
  cleanCollection,
};
