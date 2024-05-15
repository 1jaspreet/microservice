const DB = require("../../../config/database/connection");

const table = "old_passwords";

exports.db = DB;

exports.query = () => DB(table);

exports.findOne = async (object) => (await DB(table).where(object).select())[0];

exports.create = async (object) => await DB(table).insert(object);

exports.count = async (object) =>
  (await DB(table).where(object).count("id"))[0].count;

exports.delete = async (object) => await DB(table).where(object).delete();
