const DB = require("../../../config/database/connection");
const table = "pmshri_school_validation";
exports.knx = () => DB;
exports.query = () => DB(table);

exports.create = async (object) => await DB(table).insert(object);

exports.update = async (id, object) =>
  await DB(table).where("id", id).update(object);
