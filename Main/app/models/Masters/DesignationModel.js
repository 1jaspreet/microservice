const DB = require("../../../config/database/connection");

const table = "master_designations as md";

exports.query = () => DB(table);

exports.all = async () => await DB(table).select().orderBy("name");

// <<<<<<< HEAD
// exports.list    = async () => await DB(table).orderBy('name');
// =======
exports.list = async () =>
  await DB(table)
    .select("id", "designation_title as name", "role_id")
    .orderBy("name");
// >>>>>>> 8285ab8da8410e0d8afabb3729472d4f8d065e83

exports.find = async (object) => await DB(table).where(object).select();

exports.update = async (object, id) =>
  await DB(table).where("id", id).update(object);

exports.create = async (object) => await DB(table).insert(object);

exports.findOne = async (object) => (await DB(table).where(object).select())[0];

exports.delete = async (object) => await DB(table).where(object).delete();
