const { Pool } = require('pg');

const dbConfig = {
    user: '6gl',
    host: '127.0.0.1',
    database: 'iot',
    password: '6gl',
    port: 5432, // Port par défaut de PostgreSQL
};

const pool = new Pool(dbConfig);

module.exports = {
  query: (text, params) => pool.query(text, params)
};
