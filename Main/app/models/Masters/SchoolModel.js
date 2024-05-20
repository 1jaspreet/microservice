const DB = require("../../../config/database/connection");

const table = "prb_school_master as psm";

exports.query = () => DB(table);

exports.bdgt = () => DB("prb_ann_wrk_pln_bdgt_data_physical_asset");

exports.knx = () => DB;

exports.all = async () => await DB(table).select();

exports.list = async () =>
  await DB(table).select("udise_sch_code", "school_name");

/* exports.find = async (object) => {
  const generateWhereClause = (queryBuilder, conditions) => {
    Object.entries(conditions).forEach(([key, value]) => {
      console.log("cond------>", conditions);
      queryBuilder = queryBuilder.where(key, value);
    });
    queryBuilder = queryBuilder.orderBy("udise_sch_code", "asc");
    return queryBuilder;
  };

  const filteredQuery = generateWhereClause(
    DB(table).select("school_id", "udise_sch_code", "school_name", "block_cd"),
    object
  );

  return await filteredQuery;
}; */

exports.find = async (object) => {
  const generateWhereClause = (queryBuilder, conditions) => {
    Object.entries(conditions).forEach(([key, value]) => {
      queryBuilder = queryBuilder.where(key, value);
    });
    queryBuilder = queryBuilder.orderBy("udise_sch_code", "asc");
    return queryBuilder;
  };

  const filteredQuery = generateWhereClause(
    DB(table).select("school_id", "udise_sch_code", "school_name", "block_id"),
    object
  );

  return await filteredQuery;
};

exports.prbFind = async (obj) => {
  const object = obj.body;
  const apiYear = obj.headers?.api_year;
  const apiVersion = obj.headers?.api_version;
  const join_type = object.join_type;
  const state_id = object.where.state_id;
  const district_id = object.where.district_id;
  const amdid = object?.activity_master_details.activity_master_details_id || 0;

  const filteredQuery = DB.raw(
    `select sm.*, d.* from public.get_schools_in_state('${state_id}', '${district_id}', ${amdid}) as sm ${join_type} join prb_ann_wrk_pln_bdgt_data_physical_asset d on ( d.asset_code = sm.udise_sch_code and d.activity_master_details_id = ${amdid} and d.plan_year = '${apiYear}') order by sm.udise_sch_code asc`
  );

  /*   const generateWhereClause = (queryBuilder, conditions) => {
    Object.entries(conditions).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        if (value.length > 0) {
          queryBuilder = queryBuilder.whereIn(`psm.${key}`, value);
        }
      } else {
        queryBuilder = queryBuilder.where(`psm.${key}`, value);
      }
    });
    queryBuilder = queryBuilder.orderBy("udise_sch_code", "asc");
    return queryBuilder;
  };

  const filteredQuery = generateWhereClause(
    DB(table)
      .select([
        "psm.*",
        "master_states.state_name as statename",
        "master_districts.district_name as districtname",
      ])
      .join("master_states", function () {
        this.on(
          DB.raw("master_states.state_id::numeric = psm.state_id::numeric")
        );
      })
      .join("master_districts", function () {
        this.on(
          DB.raw(
            "master_districts.district_id::numeric = psm.district_id::numeric"
          )
        );
      }),
    object
  ); */

  return await filteredQuery.then((r) => {
    return r.rows;
  });

  //return await filteredQuery.rows;
};

exports.update = async (object, id) =>
  await DB(table).where("udise_sch_code", id).update(object);

exports.updateAll = async (object, school_id) =>
  await DB(table).where("school_id", school_id).update(object);

exports.create = async (object) => await DB(table).insert(object);

exports.findOne = async (object) => (await DB(table).where(object).select())[0];

exports.delete = async (object) => await DB(table).where(object).delete();

exports.count = async (object) =>
  (await DB(table).where(object).count("udise_sch_code"))[0].count;

exports.ReportDatas = async () => {
  let data = await DB.raw(`select * from (
    select sum(physical_quantity) as physical_quantity , sum(financial_amount) as financial_amount, activity_master_details_id
    from public.prb_ann_wrk_pln_bdgt_data pawpbd group by activity_master_details_id
    ) aa  inner join prb_data pd on( pd.id = aa.activity_master_details_id ) order by pd.serial_order`);
  //  limit ${limit} offset ${limit * (page - 1)}`
  return data.rows;
};
exports.ReportDtstate = async (state_id) => {
  let data = await DB.raw(`select * from (
    select sum(physical_quantity) as physical_quantity , sum(financial_amount) as financial_amount, activity_master_details_id
    from public.prb_ann_wrk_pln_bdgt_data pawpbd where  pawpbd.state = ${state_id} group by activity_master_details_id
    ) aa  inner join prb_data pd on( pd.id = aa.activity_master_details_id ) order by pd.serial_order`);
  //  limit ${limit} offset ${limit * (page - 1)}`
  return data.rows;
};
exports.ReportDt = async (state_id, district_id) => {
  let data = await DB.raw(`select * from (
    select sum(physical_quantity) as physical_quantity , sum(financial_amount) as financial_amount, activity_master_details_id
    from public.prb_ann_wrk_pln_bdgt_data pawpbd where  pawpbd.district = ${district_id} and  pawpbd.state = ${state_id} group by activity_master_details_id
    ) aa  inner join prb_data pd on( pd.id = aa.activity_master_details_id ) order by pd.serial_order`);
  //  limit ${limit} offset ${limit * (page - 1)}`
  return data.rows;
};
exports.NewReportData = async (dt) => {
  if (+dt?.state_id === 0) {
    return [];
  } else {
    let state = "";
    let district = "";
    if (+dt?.state_id > 0) {
      state = `and md.district_state_id=${dt?.state_id}`;
      district = `and pawpbd.state = ${dt?.state_id}`;
    }
    if (+dt?.state_id) {
      // district = `and md.district_state_id=${district_id}`
    }
    const state_dt = await DB.raw(`SELECT STRING_AGG(
      'MAX(CASE WHEN district = ' || district_id ||
      ' THEN physical_quantity END) AS "' || district_name || '_physical_quantity", ' ||
      'MAX(CASE WHEN district = ' || district_id ||
      ' THEN unit_cost END) AS "' || district_name || '_unit_cost", ' ||
      'MAX(CASE WHEN district = ' || district_id ||
      ' THEN financial_amount END) AS "' || district_name || '_financial_amount"',
      ', ')FROM master_districts md WHERE 1=1 ${state}`);
    let data = await DB.raw(`SELECT
                                pd.id,
                                pd.scheme_name ,
                                pd.major_component_name ,
                                pd.sub_component_name ,
                                pd.activity_master_details_name ,
                                pd.recuring_nonrecuring ,
                                pd.activity_master_details_name,
                                ${state_dt?.rows[0]?.string_agg}
                              FROM
                                public.prb_data pd
                                JOIN public.prb_ann_wrk_pln_bdgt_data pawpbd ON pawpbd.activity_master_details_id = pd.id
                              WHERE 1=1 ${district} and district >0 and pawpbd.plan_year = '${dt.year}'
                              GROUP BY
                                pd.id,
                                pd.scheme_name ,
                                pd.major_component_name ,
                                pd.sub_component_name ,
                                pd.activity_master_details_name ,
                                pd.recuring_nonrecuring ,
                                pd.activity_master_details_name`);
    return data.rows;
  }
};
