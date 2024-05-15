const DB = require("../../../config/database/connection");

const table = "consultant_mapping as cu";

exports.query = () => DB(table);

exports.all = async (request) =>
  await DB(table)
    .select()
    .orderBy("id")
    .limit(request.limit)
    .offset(request.limit * (request.page - 1));

exports.list = async () =>
  await DB(table)
    .select(
      "id",
      "role_code as role",
      "state_ids as state",
      "consultant_task_ids as tasks",
      "user_id"
    )
    .orderBy("id");

exports.find = async (object) => await DB(table).where(object).select();

exports.update = async (object, id) =>
  await DB(table).where("id", id).update(object);

exports.create = async (object) => await DB(table).insert(object);

exports.findOne = async (object) => (await DB(table).where(object).select())[0];

exports.delete = async (object) => await DB(table).where(object).delete();

exports.count = async (object) => (await DB(table).count("id"))[0].count;

exports.raw = async (object) => await DB.raw(object);

exports.getStates = async (object) =>
  await DB(table).select("state_ids").where("cu.role_code", object);
