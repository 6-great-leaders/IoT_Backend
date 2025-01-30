const { Pool } = require('pg');

const dbConfig = {
  user: '6gl',
  host: 'localhost', // Use the service name defined in docker-compose, to test in local, use localhost
  database: 'iot',
  password: '6gl',
  port: 5432,
};

const pool = new Pool(dbConfig);

module.exports = {
  query: (text, params) => pool.query(text, params)
};
