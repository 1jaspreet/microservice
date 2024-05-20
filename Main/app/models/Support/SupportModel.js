const DB = require("../../../config/database/connection");
const table = "tickets as tt";

exports.knx = () => DB;
exports.create = async (object) => await DB(table).insert(object);
exports.find = async (object) => await DB(table).where(object).select();
exports.findExisting = async (object) =>
  (await DB(table).where({ id: object.id }).select())[0];
exports.update = async (object, id) =>
  await DB(table).where({ id: id }).update(object);
exports.delete = async (object) => await DB(table).where(object).delete();
exports.findbyslug = async (object) => await DB(table).where(object).select();
exports.updatestatus = async (object, slug) =>
  await DB(table).where("slug", slug).update(object);
