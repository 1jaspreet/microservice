const DB = require("../../../config/database/connection");
const table = "master_diet";

exports.query = () => DB(table);
exports.list = async (object) =>
  await DB(table)
    .select(
      "district_id",
      "district_state_id",
      "diet_name as name",
      "diet_id as id"
    )
    .orderBy("diet_name")
    .where(object);
