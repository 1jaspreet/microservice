const Pool = require("pg").Pool;
const env = require("../env");
const pool = new Pool({
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_DATABASE,
  host: env.DB_HOST,
});

module.exports = pool;
