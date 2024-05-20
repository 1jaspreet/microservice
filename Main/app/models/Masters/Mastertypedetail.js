const DB = require("../../../config/database/connection");

const table = "master_type_detail as mt";

exports.query = () => DB(table);

// exports.typecode = async () => await DB(table).select("type_code", "title");

// exports.list = async () => await DB(table).select('id', 'type_code', 'title', 'description,status,').orderBy('title');

exports.find = async (object) =>
  await DB(table)
    .where(object)
    .select(
      "master_type_detail_id",
      "master_type_id",
      "atribute_name",
      "attribute_code"
    );

// exports.update = async (object, id) =>
//   await DB(table).where("id", id).update(object);

// exports.updateAll = async (object, id) =>
//   await DB(table).where("id", id).update(object);

// exports.create = async (object) => await DB(table).insert(object);

// exports.findOne = async (object) => (await DB(table).where(object).select())[0];

// exports.delete = async object => await DB(table).where(object).delete();

exports.count = async (object) => (await DB(table).count("id"))[0].count;
