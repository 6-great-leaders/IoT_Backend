const { Pool } = require('pg');

const dbConfig = {
  user: '6gl',
  host: 'db', // Use the service name defined in docker-compose
  database: 'iot',
  password: '6gl',
  port: 5432,
};

const pool = new Pool(dbConfig);

module.exports = {
  query: (text, params) => pool.query(text, params)
};
