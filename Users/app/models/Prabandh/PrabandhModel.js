const DB = require("../../../config/database/connection");
const PG = require("../../../config/database/postgres");
const table = "prb_data";
// exports.db = DB;

exports.knx = () => DB;
exports.diet_progress_plan = () => DB("progress.diet_progress_plan");
exports.component = () => DB("prb_major_component");
exports.planbdgtspillover = () => DB("prb_ann_wrk_pln_bdgt_spill_over");
exports.planbdgtExpend = () => DB("prb_ann_wrk_pln_bdgt_prev_progress");
exports.query = () => DB(table);
exports.reverseQuery = () => DB(table).orderBy("id", "desc");
exports.queryState = () => DB("prb_data_state");
exports.schemes = () => DB("prb_schemes");
exports.configurator = () => DB("prb_plan_configurator");
exports.data = () => DB("prb_plan_data");
exports.planChecked = () => DB("prb_plan_configurator");
exports.spillover = () => DB("prb_spillover_data");
exports.attribute = () => DB("prb_plan_data_attributes");
exports.form = () => DB("prb_ann_wrk_pln_bdgt_data");
exports.assetForm = () => DB("prb_ann_wrk_pln_bdgt_data_physical_asset");
exports.stateAssetForm = () =>
  DB("prb_state_ann_wrk_pln_bdgt_data_physical_asset");
exports.school = () => DB("prb_school_master");
exports.udisetemp = () => DB("udisetemp");
exports.stateBudget = () => DB("prb_state_ann_wrk_pln_bdgt_data");
// exports.all = async (object) => await DB(table).select().limit(object.limit);

exports.updateApprovedForm = async (object, id) =>
  await DB("prb_ann_wrk_pln_bdgt_data").where("id", id).update(object);

exports.list = async () => await DB("prb_schemes").select("id", "name");

// exports.find = async (object) => await DB(table).where(object).select();

// exports.update = async (object, id) =>
//   await DB(table).where("id", id).update(object);

// exports.create = async (object) => await DB(table).insert(object);

// exports.findOne = async (object) => (await DB(table).where(object).select())[0];

exports.count = async (object) => (await DB(table).count("id"))[0].count;
// exports.delete = async (object) => await DB(table).where(object).delete();

// exports.isEmailExist = async (object) => {
//   var Query = DB(table);
//   var Query = object.flag
//     ? Query.where({ role_id: object.role })
//     : Query.whereNot({ id: object.id });
//   return (await Query.where({ email: object.email }).count("id"))[0].count > 0
//     ? true
//     : false;
// };

// exports.isMobileExist = async (object) => {
//   var Query = DB(table);
//   var Query = object.flag
//     ? Query.where({ role_id: object.role })
//     : Query.whereNot({ id: object.id });
//   return (await Query.where({ mobile: object.mobile }).count("id"))[0].count > 0
//     ? true
//     : false;
// };

exports.getStateReportStatus = async (object) => {
  const obj = object.body;
  const apiYear = object.headers.api_year;
  // let data = await PG.query(`select count(*) from (
  //                                select  status , district , state
  //                                from
  //                                prb_ann_wrk_pln_bdgt_data pawpbd , prb_data pd
  //                                where pawpbd.activity_master_details_id = pd.id
  //                                and pawpbd.state = 37
  //                                and component_type = '3'
  //                                group by state , district , status ) inn
  //                                where inn.status not in ('6', '3')`);

  let data = await PG.query(
    `select * from get_district_status_count(${obj.user_state_id}, '${apiYear}')`
  );

  return data.rows;
};

exports.getAllYears = async (object) => {
  let data = await PG.query(`select * from master_year order by id`);

  return data.rows;
};

exports.createprogresslevel = async (object) =>
  DB("progress.prb_activity_detail_execution_level").insert(object);
exports.findLeveldata = async () =>
  DB("progress.prb_activity_detail_execution_level");
