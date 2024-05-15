const DB = require("../../../config/database/connection");

const table = "master_activity_sub_categories as masc";

exports.query = () => DB(table);

exports.all = async () =>
  await DB(table).select().orderBy("activity_sub_category_name");

exports.list = async () =>
  await DB(table)
    .select("id", "activity_category_id", "activity_sub_category_name as name")
    .orderBy("activity_sub_category_name");

exports.find = async (object) => await DB(table).where(object).select();

exports.update = async (object, id) =>
  await DB(table).where("id", id).update(object);

exports.create = async (object) => await DB(table).insert(object);

exports.findOne = async (object) => (await DB(table).where(object).select())[0];

exports.delete = async (object) => await DB(table).where(object).delete();

exports.count = async (object) => (await DB(table).count("id"))[0].count;
