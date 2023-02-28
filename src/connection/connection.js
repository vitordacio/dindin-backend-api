const { Pool } = require('pg');

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    user: postgres,
    password: 122448,
    database: 'biblioteca'
});

module.exports = pool;