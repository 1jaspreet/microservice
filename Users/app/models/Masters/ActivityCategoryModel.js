const DB = require("../../../config/database/connection");

const table = "master_activity_categories as mac";

exports.query = () => DB(table);

exports.all = async () =>
  await DB(table).select().orderBy("activity_category_name");

exports.list = async () =>
  await DB(table)
    .select("id", "activity_category_name as name", "sub_cat_count as count")
    .where({ activity_category_status: 1 })
    .orderBy("activity_category_name");

exports.find = async (object) => await DB(table).where(object).select();

exports.update = async (object, id) =>
  await DB(table).where("id", id).update(object);

exports.create = async (object) => await DB(table).insert(object);

exports.findOne = async (object) => (await DB(table).where(object).select())[0];

exports.delete = async (object) => await DB(table).where(object).delete();

exports.count = async (object) => (await DB(table).count("id"))[0].count;
