const DB = require("../../../config/database/connection");
// const PG = require("../../../config/database/postgres");
const table = "cms_category as cc";
exports.create = async (object) => await DB(table).insert(object);

exports.find = async (object) => await DB(table).where(object).select();
exports.findExistingUser = async (object) =>
  (await DB(table).where({ created_by: object.created_by }).select())[0];
exports.update = async (object, created_by) =>
  await DB(table).where("created_by", created_by).update(object);
exports.delete = async (object) => await DB(table).where(object).delete();

exports.findbyslug = async (object) => await DB(table).where(object).select();

exports.updatestatus = async (object, slug) =>
  await DB(table).where("slug", slug).update(object);

// exports.updateAll = async (object, id) => await DB(table).where('id', id).update(object);
