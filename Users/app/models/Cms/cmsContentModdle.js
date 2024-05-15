const DB = require("../../../config/database/connection");
// const PG = require("../../../config/database/postgres");
const table = "cms_category as cc";
const stable = "cms_sub_category as scc";
exports.create = async (object) => await DB(table).insert(object);

exports.find = async (object) => await DB(table).where(object).select();
exports.findExistingUser = async (object) =>
  (await DB(table).where({ created_by: object.created_by }).select())[0];
exports.update = async (object, created_by) =>
  await DB(table).where("created_by", created_by).update(object);
exports.delete = async (object) => await DB(table).where(object).delete();

// sub modle.................................................
exports.create = async (object) => await DB(stable).insert(object);
