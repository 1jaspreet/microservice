const DB = require("../../../config/database/connection");

const table = "settings";

exports.query = () => DB(table);

exports.all = async () => await DB(table).select();

exports.find = async (object) => await DB(table).where(object).select();

exports.findOne = async (object) => (await DB(table).where(object).select())[0];

exports.delete = async (object) => await DB(table).where(object).delete();

exports.update = async (object, id) =>
  await DB(table).where("id", id).update(object);

exports.create = async (object) => await DB(table).insert(object);
