const DB = require("../../../config/database/connection");
const reports_table = "report_master as rm";
const report_permissions = "report_permissions as rp";
exports.query = () => DB(reports_table);
exports.knx = () => DB;

exports.listReports = async (object) =>
  await DB(reports_table)
    .join(`${report_permissions}`, "rp.report_id", "rm.id")
    .where("rp.user_role_id", object.user_role_id)
    .andWhere("rp.is_active", true)
    .andWhere("rm.is_active", true)
    .select("rm.*")
    .orderBy("rm.id", "ASC");
