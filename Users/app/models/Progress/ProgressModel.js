const DB = require("../../../config/database/connection");

const table = "progress.prb_ann_wrk_pln_bdgt_data_progress_asset as pawpbdpa";

exports.query = () => DB(table);

exports.all = async () => await DB(table).select();

exports.list = async () => await DB(table).select("*");

exports.find = async (object) => await DB(table).where(object).select();

exports.update = async (object, id) =>
  await DB(table)
    .where("prb_ann_wrk_pln_bdgt_data_progress_asset_id", id)
    .update(object);

exports.create = async (object) => await DB(table).insert(object);

exports.findOne = async (object) => (await DB(table).where(object).select())[0];

exports.delete = async (object) => await DB(table).where(object).delete();
