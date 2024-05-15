const DB = require("../../../config/database/connection");

const table = "master_roles";

exports.query = () => DB(table);

exports.all = async () => await DB(table).select().orderBy("role_name");

exports.list = async () =>
  await DB(table)
    .select(
      "id",
      "role_name as name",
      "role_region_id",
      "available_for",
      "can_create_users"
    )
    .orderBy("role_name");

exports.find = async (object) => await DB(table).where(object).select();

exports.update = async (object, id) =>
  await DB(table).where("id", id).update(object);

exports.create = async (object) => await DB(table).insert(object);

exports.findOne = async (object) => await DB(table).where(object).select();

exports.delete = async (object) => await DB(table).where(object).delete();

exports.count = async (object) => (await DB(table).count("id"))[0].count;
