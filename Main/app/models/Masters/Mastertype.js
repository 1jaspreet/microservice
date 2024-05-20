const DB = require("../../../config/database/connection");

const table = "master_type as mb";

exports.query = () => DB(table);

exports.typecode = async () =>
  await DB(table).select("type_code", "title", "id");

// exports.list = async () => await DB(table).select('id', 'type_code', 'title', 'description,status,').orderBy('title');

// exports.find = async object => await DB(table).where(object).select('id', 'title', 'description', 'status');

exports.update = async (object, id) =>
  await DB(table).where("id", id).update(object);

exports.updateAll = async (object, id) =>
  await DB(table).where("id", id).update(object);

exports.create = async (object) => await DB(table).insert(object);

exports.findOne = async (object) => (await DB(table).where(object).select())[0];
// exports.finds = async (object) => {
//     let data = await DB.raw(`SELECT "mb".* WHERE "type_code" SIMILAR TO '(${object.type_code}|${object.id})%'`)
//     return data.rows;
// }
exports.findOnes = async (object) => await DB(table).where(object).select();

// exports.delete = async object => await DB(table).where(object).delete();

exports.count = async (object) => (await DB(table).count("id"))[0].count;
