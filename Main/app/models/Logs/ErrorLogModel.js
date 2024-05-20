const DB = require("../../../config/database/connection");

const table = "error_logs";

exports.query = () => DB(table);

exports.update = async (object, id) =>
  await DB(table).where("id", id).update(object);

exports.create = async (object) => await DB(table).insert(object);

exports.findOne = async (object) => (await DB(table).where(object).select())[0];

exports.count = async (object) => (await DB(table).count("id"))[0].count;
