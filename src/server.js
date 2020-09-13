const express = require('express');
const cors = require('cors');

const mongoose = require('./services/mongoose');
const schemas = require('./schemas');

const server = express();
server.disable('x-powered-by');
server.use(cors());
server.use(express.json());

server.use(mongoose(({
  uri: process.env.MONGO_URL,
  timeout: process.env.MONGO_TIMEOUT,
  schemas,
})));

server.use(require('./routes'));
server.use(require('./errorHandler'));

module.exports = server;
