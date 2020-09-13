require('dotenv').config();

const server = require('./src/server');

server.listen(process.env.PORT || 3000);
