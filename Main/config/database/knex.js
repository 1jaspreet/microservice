const env = require("../env");
const knex = require("knex")({
  client: env.DB_CONNECTION,
  connection: {
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_DATABASE,
    host: env.DB_HOST,
  },
  debug: true,
});

module.exports = knex;
