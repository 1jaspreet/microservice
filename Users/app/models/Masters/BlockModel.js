const DB = require("../../../config/database/connection");

const table = "master_blocks as mb";

exports.query = () => DB(table);

exports.all = async () => await DB(table).select().orderBy("block_name");

exports.list = async () =>
  await DB(table)
    .select("id", "block_state_id", "block_district_id", "block_name as name")
    .orderBy("block_name");

exports.find = async (object) =>
  await DB(table)
    .where(object)
    .select(
      "id",
      "block_state_id",
      "block_district_id",
      "udise_block_code",
      "block_name as name"
    );

exports.update = async (object, id) =>
  await DB(table).where("id", id).update(object);

exports.create = async (object) => await DB(table).insert(object);

exports.findOne = async (object) => (await DB(table).where(object).select())[0];

exports.delete = async (object) => await DB(table).where(object).delete();

exports.count = async (object) => (await DB(table).count("id"))[0].count;
