const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const mongoose = require('./services/mongoose');
const schemas = require('./schemas');

const { jwtServiceFactory } = require('./services/jwt');

const server = express();
server.disable('x-powered-by');
server.use(express.json());
server.use(cors());
server.use(helmet());

server.use(
  mongoose({
    uri: process.env.MONGO_URL,
    timeout: process.env.MONGO_TIMEOUT,
    schemas,
  }),
);

server.use(jwtServiceFactory());

server.use(require('./routes'));
server.use(require('./errorHandler'));

module.exports = server;
