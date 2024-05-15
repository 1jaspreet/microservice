const DB = require("../../../config/database/connection");

const table = "master_districts as md";

exports.query = () => DB(table);

exports.all = async (request) =>
  await DB(table)
    .select()
    .orderBy("district_name", "asc")
    .limit(request.limit)
    .offset(request.limit * (request.page - 1));

exports.list = async () => await DB(table).orderBy("district_name");

exports.selectlist = async (object) =>
  await DB(table)
    .innerJoin("master_states as ms", "ms.state_id", "md.district_state_id")
    .where(object)
    .select(
      "md.id as id",
      "md.district_name as name",
      "ms.state_id as state_id",
      "ms.state_name as state_name"
    )
    .orderBy("md.district_name", "asc");

exports.find = async (object) =>
  await DB(table).where(object).select().orderBy("district_name", "asc");

exports.update = async (object, id) =>
  await DB(table).where("id", id).update(object);

exports.create = async (object) => await DB(table).insert(object);

exports.findOne = async (object) => (await DB(table).where(object).select())[0];

exports.delete = async (object) => await DB(table).where(object).delete();

exports.count = async (object) => (await DB(table).count("id"))[0].count;
