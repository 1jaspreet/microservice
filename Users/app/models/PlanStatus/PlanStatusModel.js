const DB = require("../../../config/database/connection");

const table = "plan_status as ps";

exports.create = async (object) => await DB(table).insert(object);

exports.find = async (object) => await DB(table).where(object).select();

exports.update = async (object, created_by) =>
  await DB(table).where("created_by", created_by).update(object);
exports.delete = async (object) => await DB(table).where(object).delete();
