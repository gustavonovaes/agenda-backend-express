require('dotenv').config();

process.env.MONGO_URL = 'mongodb://mongo:27017/test';

module.exports = {
  testEnvironment: 'node',
  bail: true,
  coveragePathIgnorePatterns: [
    '/node_modules/',
  ],
};
