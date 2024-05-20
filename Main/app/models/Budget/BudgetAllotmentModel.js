const DB = require("../../../config/database/connection");
const table = "budget_allotment as ba";
const statesTentativeProposal = "master_states_tentative_proposed as mstp";
exports.knx = () => DB;

exports.create = async (object) => await DB(table).insert(object);
exports.find = async (object) => await DB(table).where(object).select();
exports.update = async (object, id) =>
  await DB(table).where({ id: id }).update(object);

exports.findTotalAllotedBudgetForState = async (object) =>
  await DB(table)
    .select(
      DB.raw("SUM(ba.released_amount) as total_released_amount"),
      "ba.alloted_to"
    )
    .where("ba.state_id", object.state_id)
    .andWhere("plan_year", object.plan_year)
    .andWhere("ba.alloted_from", "State")
    .groupBy("ba.alloted_to")
    .orderBy("ba.alloted_to", "ASC");

exports.findTotalApprovedBudget = async () =>
  await DB(statesTentativeProposal).select(
    DB.raw("SUM(mstp.tentative_total_estimates) as total_approved"),
    DB.raw("SUM(mstp.tentative_central_share) as central_share"),
    DB.raw("SUM(mstp.tentative_state_share) as state_share")
  );

exports.findTotalApprovedBudgetForState = async (object) =>
  await DB(statesTentativeProposal)
    .select(
      DB.raw("SUM(mstp.tentative_total_estimates) as total_approved"),
      DB.raw("SUM(mstp.tentative_central_share) as central_share"),
      DB.raw("SUM(mstp.tentative_state_share) as state_share")
    )
    .where("state_id", +object.state_id)
    .andWhere("year_id", +object.year_id);

exports.createDietFund = async (object) =>
  await DB("diet_budget_received").insert(object);

//andWhere('ba.is_approved',true).
