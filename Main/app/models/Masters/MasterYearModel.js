const DB = require("../../../config/database/connection");

const table = "master_year";

exports.query = () => DB(table);

exports.list = async () =>
  await DB(table).select("id", "year_name", "year_code").orderBy("id");

exports.count = async (object) => (await DB(table).count("id"))[0].count;
