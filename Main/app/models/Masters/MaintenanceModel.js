const DB = require("../../../config/database/connection");

const table = "master_asset_maintenance";

exports.query = () => DB(table);

exports.all = async () => await DB(table).select().orderBy("maintenance_year");

exports.list = async () =>
  await DB(table)
    .select("id", "maintenance_year as name")
    .orderBy("maintenance_year");

exports.find = async (object) => await DB(table).where(object).select();

exports.update = async (object, id) =>
  await DB(table).where("id", id).update(object);

exports.create = async (object) => await DB(table).insert(object);

exports.findOne = async (object) => await DB(table).where(object).select();

exports.delete = async (object) => await DB(table).where(object).delete();

exports.count = async (object) => (await DB(table).count("id"))[0].count;
