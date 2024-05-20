const DB = require("../../../config/database/connection");
const PG = require("../../../config/database/postgres");
const table = "admin_users as u";

exports.query = () => DB(table);

exports.knx = () => DB;

exports.all = async (object) => await DB(table).select().limit(object.limit);

exports.count = async (object) => await DB(table).count("id as count");

exports.list = async () => await DB(table).select("id", "name");

exports.find = async (object) => await DB(table).where(object).select();

exports.findOneUser = async (object) =>
  (await DB(table).where(object).select())[0];

exports.findExistingUser = async (object) =>
  (
    await DB(table)
      .where({ user_email: object.email })
      .orWhere({ user_mobile: object.mobile })
      .select()
  )[0];

exports.update = async (object, id) =>
  await DB(table)
    .where("id", id)
    .update({ ...object, updated_at: DB.fn.now() });

exports.create = async (object) => await DB(table).insert(object);

/* exports.findOne = async object => (await DB(table).join('master_districts as md', 'md.district_id', 'u.user_district_id').join('master_states as ms', 'ms.state_id', 'u.user_state_id').where(object).select('u.*', 'md.district_name','ms.state_name'))[0]; */

// exports.findOne = async object => {
//     let resObj =(await DB(table).where(object).select())[0];

//     let user_state_id = resObj?.user_state_id || 0;
//     let user_district_id = resObj?.user_district_id || 0;

//     if (user_state_id !== 0) {
//         const stateResult = await DB("master_states").where("state_id", user_state_id).select('state_name');
//         resObj.state_name = stateResult[0].state_name;
//     } else {
//         resObj.state_name = "";
//     }

//     if(user_district_id !== 0){
//         const districtResult = await DB("master_districts").where("district_id",user_district_id).select('district_name');
//         resObj.district_name = districtResult[0].district_name;
//     }else{
//         resObj.district_name = "";
//     }
//     return resObj;
// };

exports.findAllRelated = async (obj) => {
  const apiYear = obj.headers?.api_year;
  const apiVersion = obj.headers?.api_version;
  const object = obj.body;
  let role = object.role;
  delete object.role;
  // if(role!=1){
  //   return await DB(table)
  //     .join("master_districts as md", "md.district_id", "u.user_district_id")
  //     .join("master_states as ms", "ms.state_id", "u.user_state_id")
  //     .where(object)
  //     .select("u.*", "md.district_name", "ms.state_name");
  // }else{
  let where = "";
  if (object.user_state_id) {
    where = `where state_id = ${object.user_state_id}`;
  }
  // let states = await PG.query(
  //   `SELECT ms.state_id, ms.state_name FROM master_states AS ms ${where} Order by ms.state_name asc`
  // );

  let states = await PG.query(
    `select * from (select  min(status) , ms.state_id  , ms.state_name  
from prb_ann_wrk_pln_bdgt_data pawpbd , master_states ms 
where state = ms.state_id and pawpbd.plan_year = '${apiYear}'
group by ms.state_id  ,  ms.state_name ) aa ${where} Order by state_name asc`
  );
  states = states.rows;

  await Promise.all(
    states.map(async (state) => {
      let district = await PG.query(
        `select
        vds.district_state_id,
        vds.district_id,
        vds.district_name,
        vds.district_order,
        coalesce ( vds.status,
        1) status,
        coalesce(vds.plan_year ,'${apiYear}') plan_year,
        du.*
      from
        view_district_status vds
      left join view_district_wise_data_entry_operator du on
        (vds.district_id = du.user_district_id)
      where
        1 = 1
        and vds.district_state_id = ${state.state_id}
        and coalesce(vds.plan_year ,'${apiYear}') = '${apiYear}'
      order by
        vds.district_name asc`
      );

      /* await PG.query(
              `select vds.district_state_id, vds.district_id, vds.district_name, vds.district_order, coalesce ( vds.status,1) status, du.* from view_district_status vds left join  view_district_wise_data_entry_operator du on (vds.district_id = du.user_district_id) where 1 = 1 and vds.district_state_id = '${state.state_id}' order by vds.district_name asc`
            ); */

      state.districts = district.rows;
      return state;
    })
  );

  return states;
  // }
};

// exports.findOne = async object => (await DB(table).leftJoin('master_districts as md', 'md.id', 'u.user_district_id').leftJoin('master_states as ms', 'ms.id', 'u.user_state_id').where(object).select('u.*', 'md.district_name','ms.state_name'))[0];
exports.findOne = async (object) =>
  (
    await DB(table)
      .leftJoin("master_districts as md", "md.id", "u.user_district_id")
      .leftJoin("master_states as ms", "ms.id", "u.user_state_id")
      .leftJoin("consultant_mapping as cm", "cm.user_id", "u.id")
      .where(object)
      .select(
        "u.*",
        "md.district_name",
        "ms.state_name",
        "state_ids",
        "component",
        "major_component_ids",
        "sub_component_ids"
      )
  )[0];
exports.findOneuser = async (object) =>
  (
    await DB(table)
      .leftJoin("master_districts as md", "md.id", "u.user_district_id")
      .leftJoin("master_states as ms", "ms.id", "u.user_state_id")
      .leftJoin("consultant_mapping as cm", "cm.user_id", "u.id")
      .where({ "u.user_mobile": object })
      .select(
        "u.*",
        "md.district_name",
        "ms.state_name",
        "state_ids",
        "component",
        "major_component_ids",
        "sub_component_ids"
      )
  )[0];
// exports.findOne = async (object) => {
//   return  await DB(table).leftJoin('master_districts as md', 'md.id', 'u.user_district_id')
//             .leftJoin('master_states as ms', 'ms.id', 'u.user_state_id')
//             .leftJoin('consultant_mapping as cm', 'cm.user_id', 'u.id')
//             .where(object)
//             .select('u.*', 'md.district_name','ms.state_name', 'state_ids', 'component', 'major_component_ids', 'sub_component_ids')[0]
// }
//exports.findOne = async object => (await DB(table).where(object).select())[0];

exports.isMobileExist = async (object) => {
  var Query = DB(table);
  var Query = object.flag
    ? Query.where({ role_id: object.role })
    : Query.whereNot({ id: object.id });
  return (await Query.where({ mobile: object.mobile }).count("id"))[0].count > 0
    ? true
    : false;
};
