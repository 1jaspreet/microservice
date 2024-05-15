const Model = require("../../models").Prabandh;
const ProgressModel = require("../../models").Progress;
const { stat } = require("fs-extra");
const Exception = require("../Assets/ExceptionHandler");
const Response = require("../Assets/ResponseHandler");
const DTime = require("node-datetime");

exports.stateList = async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  try {
    const object = await Model.knx().raw(`select "id", "state_name" as name 
      from master_states 
      where state_id not in (select distinct state  from prb_state_ann_wrk_pln_bdgt_data psawpbd where psawpbd.status = 4 ) order by state_name`);

    return Response.handle(req, res, "stateList", 200, {
      status: true,
      data: object.rows,
    });
  } catch (e) {
    return Exception.handle(e, res, req, "stateList");
  }
};

exports.majorComponents = async (req, res) => {
  const request = req.body;
  const { state_id } = request;
  const apiYear = req.headers?.api_year;
  try {
    const subQuery = Model.knx()
      .select("major_component_id")
      .distinct()
      .from("prb_state_ann_wrk_pln_bdgt_data")
      .where("state", state_id)
      .andWhere("plan_year", apiYear)
      .andWhere("physical_quantity", ">", 0)
      .andWhere("status", "<", 2);

    const object = await Model.knx()
      .select("*")
      .from("prb_major_component as pmc")
      .where("scheme_id", request.schemeid)
      .whereIn("prb_major_component_id", subQuery)
      .orderBy("serial_order");

    return Response.handle(req, res, "majorComponents", 200, {
      status: true,
      data: object,
    });
  } catch (e) {
    return Exception.handle(e, res, req, "majorComponents");
  }
};

exports.subComponents = async (req, res) => {
  try {
    const request = req.body;
    const { state_id } = request;
    const apiYear = req.headers?.api_year;

    const subQuery = Model.knx()
      .select("sub_component_id")
      .distinct()
      .from("prb_state_ann_wrk_pln_bdgt_data")
      .where("state", state_id)
      .andWhere("plan_year", apiYear)
      .andWhere("physical_quantity", ">", 0)
      .andWhere("status", "<", 2);

    const object = await Model.knx()
      .select([
        "*",
        "prb_sub_component.sub_component_id as subcomponentuniqueid",
        "prb_sub_component.title as sub_title",
        "prb_schemes.title as scheme_name",
        "prb_major_component.title as major_component_name",
      ])
      .from("prb_sub_component")
      .innerJoin("prb_schemes", "prb_schemes.id", "prb_sub_component.scheme_id")
      .innerJoin(
        "prb_major_component",
        "prb_major_component.prb_major_component_id",
        "prb_sub_component.major_component_id"
      )
      .where("prb_sub_component.scheme_id", request.schemeid)
      .where("prb_sub_component.major_component_id", request.majorcomponentid)
      .whereIn("sub_component_id", subQuery)
      .orderBy("prb_sub_component.serial_order", "ASC");

    return Response.handle(req, res, "subComponents", 200, {
      status: true,
      data: object,
    });
  } catch (e) {
    return Exception.handle(e, res, req, "subComponents");
  }
};

exports.activemasterlist = async (req, res) => {
  try {
    const { schemeid, major_component_id, sub_component_id, state_id } =
      req.body;
    const apiYear = req.headers?.api_year;
    let scheme_ids = "";
    let major_component_ids = "";
    let sub_component_ids = "";
    if (schemeid) {
      scheme_ids = `and scheme_id = '${schemeid}'`;
    }
    if (major_component_id) {
      major_component_ids = `and major_component_id = '${major_component_id}'`;
    }
    if (sub_component_id) {
      sub_component_ids = `and sub_component_id = '${sub_component_id}'`;
    }

    const object = await Model.knx().raw(
      `select * from prb_activity_master pam where 1=1 ${scheme_ids} ${major_component_ids} ${sub_component_ids} 
        and pam.id in 
        (select distinct psawpbd.activity_master_id 
          from prb_state_ann_wrk_pln_bdgt_data psawpbd 
          where state = ${state_id} and plan_year = '${apiYear}' and 
          physical_quantity > 0 and status < 2)`
    );

    return Response.handle(req, res, "activemasterlist", 200, {
      status: true,
      data: object.rows,
    });
  } catch (e) {
    return Exception.handle(e, res, req, "activemasterlist");
  }
};

exports.viewEditFormActivity_activemasterdetaillist = async (req, res) => {
  try {
    const {
      schemeid,
      major_component_id,
      sub_component_id,
      activity_master_id,
      state_id,
    } = req.body;
    const apiYear = req?.headers?.api_year;

    const object = await Model.knx().raw(
      `select * from prb_data pd where scheme_id = '${schemeid}' and major_component_id = '${major_component_id}' 
        and sub_component_id = '${sub_component_id}' and 
        activity_master_id = ${activity_master_id} and 
        pd.id in (
          select distinct activity_master_details_id 
          from prb_state_ann_wrk_pln_bdgt_data pawpbd 
          where state = ${state_id} and plan_year= '${apiYear}' 
            and activity_master_id = ${activity_master_id} 
            and status < 2
        ) order by activity_master_details_name asc`
    );

    return Response.handle(req, res, "activemasterdetaillist", 200, {
      status: true,
      data: object.rows,
    });
  } catch (e) {
    return Exception.handle(e, res, req, "activemasterdetaillist");
  }
};

exports.getSavedApprovedDataActivityByDist = async (req, res) => {
  try {
    const {
      user: { user_role_id },
      state_id,
      district_id,
      scheme_id,
      type,
      major_component_id: mcid,
      sub_component_id: scid,
      activity_master_id,
      activity_master_details_id,
    } = req.body;

    const apiYear = req.headers?.api_year;
    const apiVersion = req.headers?.api_version;

    let object = await Model.knx().raw(`select 
      pawpbd.id, 
      pawpbd.physical_quantity, 
      pawpbd.financial_amount,
      pawpbd.activity_master_details_id, 
      unit_cost,
      district_id, 
      district_name,  
      (select count( DISTINCT prb_ann_wrk_pln_bdgt_data_physical_asset_id) from 
        prb_ann_wrk_pln_bdgt_data_physical_asset 
        where state=pawpbd.state and district=pawpbd.district and activity_master_details_id=pawpbd.activity_master_details_id) as schoolcount

    from prb_ann_wrk_pln_bdgt_data pawpbd 
    left join allocation.view_state_district_combined vsdc 
      on vsdc.district_id = pawpbd.district and vsdc.district_state_id = pawpbd.state 
    where activity_master_details_id = ${activity_master_details_id} and state = ${state_id} and plan_year = '${apiYear}'`);

    return Response.handle(req, res, "getSavedData", 200, {
      status: true,
      data: object.rows,
      // is_approved: +object2.rows[0].approved_status > 5 ? true : false,
    });
  } catch (e) {
    return Exception.handle(e, res, req, "getSavedData");
  }
};

exports.updateApprovedPlan = async (req, res) => {
  try {
    const { data, state_id, activity_master_details_id } = req.body;
    const apiYear = req.headers?.api_year;
    const created_by = req.auth.user.id;
    for (let i = 0; i < data.length; i++) {
      // await Model.updateApprovedForm({physical_quantity: data[i]['physical_quantity'], financial_amount: data[i]['financial_amount']}, data[i]['id']);
      await Model.updateApprovedForm(
        {
          physical_quantity: data[i]["physical_quantity"],
          unit_cost: data[i]["unit_cost"],
          financial_amount: data[i]["financial_amount"],
        },
        data[i]["id"]
      );
    }

    await Model.knx().raw(`insert
        into
        prb_state_ann_wrk_pln_bdgt_data (state,
        activity_master_details_id,
        scheme_id,
        sub_component_id,
        major_component_id,
        activity_master_id,
        physical_quantity,
        financial_amount,
        unit_cost,
        plan_year,
        status,
        state_submission_status,
        created_by)
              select
        state,
        activity_master_details_id,
        scheme_id,
        sub_component_id,
        major_component_id,
        activity_master_id,
        physical_quantity,
        financial_amount,
        unit_cost,
        plan_year,
        1,
        state_submission_status,
        ${created_by}
      from
        view_state_cosolidated_plan
      where
        plan_year = '${apiYear}'
        and state = ${state_id}
      -- and activity_master_id = 17
        and activity_master_details_id in (${activity_master_details_id})
        on
        conflict (state, activity_master_details_id, scheme_id, plan_year) do
      update
      set
        physical_quantity = excluded.physical_quantity,
        financial_amount = excluded.financial_amount,
        unit_cost = excluded.unit_cost,
        state_submission_status = excluded.state_submission_status,
        updated_by= ${created_by}`);

    return Response.handle(req, res, "updateApprovedPlan", 200, {
      status: true,
      message: "Updated Successfully.",
    });
  } catch (e) {
    return Exception.handle(e, res, req, "updateApprovedPlan");
  }
};

exports.schoolList = async (req, res) => {
  try {
    const { data, state_id, district_id, diet } = req.body;
    const apiYear = req.headers?.api_year;

    let schoolData = await Model.knx()
      .raw(`select distinct psm.udise_sch_code , school_name 
      from allocation.prb_ann_wrk_pln_bdgt_data_allocation_asset pawpbdaa , prb_school_master psm  
      where pawpbdaa.state_id = ${state_id} and pawpbdaa.plan_year ='${apiYear}' ${diet === true ? "and sub_component_id = 222" : ""}
      and pawpbdaa.asset_code = psm.udise_sch_code 
      and psm.district_id = ${district_id} order by school_name`);

    return Response.handle(req, res, "schoolList", 200, {
      status: true,
      data: schoolData.rows,
    });
  } catch (e) {
    return Exception.handle(e, res, req, "schoolList");
  }
};

exports.schoolListOfBlock = async (req, res) => {
  try {
    const { data, state_id, block_cd, diet } = req.body;
    const apiYear = req.headers?.api_year;

    let schoolData = await Model.knx()
      .raw(`select distinct psm.udise_sch_code , school_name 
      from allocation.prb_ann_wrk_pln_bdgt_data_allocation_asset pawpbdaa , prb_school_master psm  
      where pawpbdaa.state_id = psm.state_id and pawpbdaa.plan_year ='${apiYear}'
      and pawpbdaa.asset_code = psm.udise_sch_code 
      and psm.block_cd = '${block_cd}' order by school_name`);

    return Response.handle(req, res, "schoolListOfBlock", 200, {
      status: true,
      data: schoolData.rows,
    });
  } catch (e) {
    return Exception.handle(e, res, req, "schoolListOfBlock");
  }
};

exports.schoolActivity = async (req, res) => {
  try {
    const { data, state_id, district_id, asset_code, month } = req.body;
    const apiYear = req.headers?.api_year;
    const activity_group_code = req.body.activity_group_code === 'null' || req.body.activity_group_code === null || req.body.activity_group_code === undefined ? null : `'${req.body.activity_group_code}'`;

    let activityCount = await Model.knx().raw(`select count(*) as no_of_record from progress.prb_ann_wrk_pln_bdgt_data_progress_asset pawpbdpa 
      where pawpbdpa.asset_code = '${asset_code}' and plan_year = '${apiYear}' and month_id = '${month}'`);

    let activityList;
    if (activityCount.rows[0]["no_of_record"] == 0) {
      /* activityList = await Model.knx()
        .raw(`select '${asset_code}' as asset_code, 5 as asset_type, 
            pd.scheme_id , pd.major_component_id, pd.sub_component_id , pd.activity_master_id , pawpbdaa.activity_master_details_id,
            pd.scheme_name , pd.major_component_name , pd.sub_component_name , pd.activity_master_name , pd.activity_master_details_name ,
                pawpbdaa.allocated_physical_quantity , pawpbdaa.allocated_financial_amount , 
                0 as physical_progress_yet_to_start, 0 as physical_progress_in_progress, 0 as physical_progress_completed,0 as financial_expenditure,
                state_id , district_id , plan_year, ${month} as month_id, 1 as status 
        from allocation.prb_ann_wrk_pln_bdgt_data_allocation_asset pawpbdaa , prb_data pd 
        where asset_code ='${asset_code}' and plan_year = '${apiYear}' 
        and pawpbdaa.activity_master_details_id = pd.id order by pd.scheme_id , pd.major_component_id, pd.sub_component_id , pd.activity_master_id , pawpbdaa.activity_master_details_id`); */
      activityList = await Model.knx().raw(`with cte as (
          select '${asset_code}' as asset_code, 5 as asset_type, 
              pd.scheme_id , pd.major_component_id, pd.sub_component_id , pd.activity_master_id , pawpbdaa.activity_master_details_id,
              pd.scheme_name , pd.major_component_name , pd.sub_component_name , pd.activity_master_name , pd.activity_master_details_name ,
                  pawpbdaa.allocated_physical_quantity , pawpbdaa.allocated_financial_amount , 
                  0 as physical_progress_yet_to_start, 0 as physical_progress_in_progress, 0 as physical_progress_completed,0 as financial_expenditure,
                  state_id , district_id , plan_year, ${month} as month_id, 1 as status 
          from allocation.prb_ann_wrk_pln_bdgt_data_allocation_asset pawpbdaa , prb_data pd 
          where asset_code ='${asset_code}' and plan_year = '${apiYear}' and state_id=${state_id} and district_id=${district_id}
          and pawpbdaa.activity_master_details_id = pd.id 
          and pawpbdaa.activity_master_details_id in (select activity_master_details_id from fetch_activity_master_details(${activity_group_code}))
          order by pd.scheme_id , pd.major_component_id, pd.sub_component_id , pd.activity_master_id , pawpbdaa.activity_master_details_id
          
          ),
          
           total_exp as (
          select coalesce (sum(financial_expenditure),0) as  total_financial_expenditure , asset_code , activity_master_details_id 
          from 
          progress.prb_ann_wrk_pln_bdgt_data_progress_asset pawpbdpa
          where 
          asset_code ='${asset_code}'  and plan_year = '${apiYear}'  
          group by asset_code , activity_master_details_id 
          )
          
          select cte.*, total_exp.total_financial_expenditure  from cte 
          left join total_exp 
          on (cte.asset_code = total_exp.asset_code and cte.activity_master_details_id =total_exp.activity_master_details_id  )`);
      console.log("first query");
    } else {
      console.log("second query");
      /*       activityList = await Model.knx()
        .raw(`select prb_ann_wrk_pln_bdgt_data_progress_asset_id, asset_code, asset_type, 
          pd.scheme_id , pd.major_component_id, pd.sub_component_id  , pd.activity_master_id , pawpbdpa.activity_master_details_id,
          pd.scheme_name , pd.major_component_name , pd.sub_component_name , pd.activity_master_name , pd.activity_master_details_name ,
              pawpbdpa.allocated_physical_quantity , pawpbdpa.allocated_financial_amount , 
              physical_progress_yet_to_start, physical_progress_in_progress, physical_progress_completed,financial_expenditure,
              state_id , district_id , plan_year, ${month} as month_id, 1 as status 
        from progress.prb_ann_wrk_pln_bdgt_data_progress_asset pawpbdpa , prb_data pd 
        where 
        asset_code ='${asset_code}' and plan_year = '${apiYear}' and
        pawpbdpa.activity_master_details_id = pd.id order by pd.scheme_id , pd.major_component_id, pd.sub_component_id , pd.activity_master_id , pawpbdpa.activity_master_details_id`); */
      activityList = await Model.knx().raw(`with cte as (
          select prb_ann_wrk_pln_bdgt_data_progress_asset_id, asset_code, asset_type, 
             pd.scheme_id , pd.major_component_id, pd.sub_component_id  , pd.activity_master_id , pawpbdpa.activity_master_details_id,
             pd.scheme_name , pd.major_component_name , pd.sub_component_name , pd.activity_master_name , pd.activity_master_details_name ,
                 pawpbdpa.allocated_physical_quantity , pawpbdpa.allocated_financial_amount , 
                 physical_progress_yet_to_start, physical_progress_in_progress, physical_progress_completed,financial_expenditure,
                 state_id , district_id , plan_year,month_id , 1 as status 
           from progress.prb_ann_wrk_pln_bdgt_data_progress_asset pawpbdpa , prb_data pd 
           where 
           asset_code ='${asset_code}' and plan_year = '${apiYear}' and month_id  = ${month}
           and pawpbdpa.activity_master_details_id = pd.id 
           and pawpbdpa.activity_master_details_id in (select activity_master_details_id from fetch_activity_master_details(${activity_group_code}))
           order by pd.scheme_id , pd.major_component_id, pd.sub_component_id , pd.activity_master_id , pawpbdpa.activity_master_details_id
           ),
           
            total_exp as (
           select coalesce (sum(financial_expenditure),0) as  total_financial_expenditure , asset_code , activity_master_details_id 
           from 
           progress.prb_ann_wrk_pln_bdgt_data_progress_asset pawpbdpa
           where 
           asset_code ='${asset_code}' and plan_year = '${apiYear}'
           group by asset_code , activity_master_details_id 
           )
           
           select cte.*, total_exp.total_financial_expenditure  from cte 
           left join total_exp 
           on (cte.asset_code = total_exp.asset_code and cte.activity_master_details_id =total_exp.activity_master_details_id  )`);
    }

    return Response.handle(req, res, "schoolList", 200, {
      status: true,
      data: activityList.rows,
      no_of_record: activityCount.rows[0]["no_of_record"],
    });
  } catch (e) {
    return Exception.handle(e, res, req, "schoolList");
  }
};

exports.dietConfigctivity = async (req, res) => {
  try {
    const { diet_id, state_id } = req.body;
    const apiYear = req.headers?.api_year;
    const created_by = req.auth.user.id;
    const updated_at = DTime.create().format("Y-m-d H:M:S");

    await Model.knx().raw(`INSERT INTO progress.diet_progress_plan
    (diet_id,state_id, district_id, plan_year, scheme_id, major_component_id, sub_component_id, activity_master_id, activity_master_details_id,   status, created_by)
    select md.diet_id ,md.district_state_id , md.district_id ,'${apiYear}',  pd.scheme_id , pd.major_component_id , pd.sub_component_id , pd.activity_master_id , pd.id,1 ,${created_by}
    from prb_data pd , master_diet md 
    where sub_component_id = 222 and  diet_id = ${diet_id} on conflict(diet_id,state_id,district_id ,activity_master_details_id,plan_year)
    do nothing`);

    await Model.knx().raw(`update progress.diet_progress_plan dpp 
    set allocated_physical_quantity =pawpbdaa.allocated_physical_quantity ,
        allocated_financial_amount = pawpbdaa.allocated_financial_amount , updated_by= ${created_by}, updated_at='${updated_at}'
    from allocation.prb_ann_wrk_pln_bdgt_data_allocation_asset pawpbdaa 
    where dpp.activity_master_details_id = pawpbdaa.activity_master_details_id 
    and dpp.plan_year = pawpbdaa.plan_year 
    and pawpbdaa.asset_code  in (select mdt.diet_code  from public.master_diet mdt where mdt.diet_id = ${diet_id} )
    and dpp.plan_year = '${apiYear}'`)

    let object = await Model.knx().raw(`select 
      pd.activity_master_name , pd.activity_master_details_name , dpp.*,
      TO_CHAR(dpp.dpr_date, 'YYYY-MM-DD') AS dpr_date,
      TO_CHAR(dpp.drawings_date,  'YYYY-MM-DD') AS drawings_date,
      TO_CHAR(dpp.agencies_date, 'YYYY-MM-DD') AS agencies_date,
      TO_CHAR(dpp.noc_date, 'YYYY-MM-DD') AS noc_date,
      TO_CHAR(dpp.construction_date, 'YYYY-MM-DD') AS construction_date,
      TO_CHAR(dpp.procurement_date, 'YYYY-MM-DD') AS procurement_date
      from progress.diet_progress_plan dpp 
      left join prb_data pd on pd.id=dpp.activity_master_details_id
      where diet_id = ${diet_id} and plan_year ='${apiYear}' and state_id=${state_id} 
      and coalesce (allocated_financial_amount,0) + coalesce (allocated_physical_quantity,0) > 0
      order by activity_master_name, activity_master_details_name`);

    return Response.handle(req, res, "dietConfigctivity", 200, {
      status: true,
      data: object.rows,
    });

  } catch (e) {
    return Exception.handle(e, res, req, "dietConfigctivity");
  }
};

exports.updateConfigDietPlanProgress = async (req, res) => {
  try {
    const data = req.body;

    const created_by = req.auth.user.id;
    const updated_at = DTime.create().format("Y-m-d H:M:S");

    let afterUpdate = await Model.diet_progress_plan().where("diet_progress_plan_id", data.diet_progress_plan_id)
      .update({
        dpr_yn: data.dpr_yn,
        dpr_date: data.dpr_date,
        drawings_yn: data.drawings_yn,
        drawings_date: data.drawings_date,
        agencies_yn: data.agencies_yn,
        agencies_date: data.agencies_date,
        noc_yn: data.noc_yn,
        noc_date: data.noc_date,
        construction_yn: data.construction_yn,
        construction_date: data.construction_date,
        procurement_yn: data.procurement_yn,
        procurement_date: data.procurement_date,
        remarks: data.remarks,
        updated_by: created_by,
        updated_at
      });

    return Response.handle(req, res, "updateConfigDietPlanProgress", 200, {
      status: true,
      data: afterUpdate,
      message: "Data Saved Successfully."
    });

  } catch (e) {
    return Exception.handle(e, res, req, "updateConfigDietPlanProgress");
  }
};

exports.dietActivityMasterDetailsList = async (req, res) => {

  try {
    const { data, state_id, district_id, asset_code, month } = req.body;
    const apiYear = req.headers?.api_year;
    const activity_group_code = req.body.activity_group_code === 'null' || req.body.activity_group_code === null || req.body.activity_group_code === undefined ? null : `'${req.body.activity_group_code}'`;

    let activityCount = await Model.knx().raw(`select count(*) as no_of_record from progress.prb_ann_wrk_pln_bdgt_data_progress_asset pawpbdpa 
      where pawpbdpa.asset_code = '${asset_code}' and plan_year = '${apiYear}' and month_id = '${month}'`);
    console.log("first query------");

    let activityList;
    if (activityCount.rows[0]["no_of_record"] == 0) {
      console.log("first query");
      activityList = await Model.knx().raw(`with cte as (
          select '${asset_code}' as asset_code, 5 as asset_type, 
              pd.scheme_id , pd.major_component_id, pd.sub_component_id , pd.activity_master_id , pawpbdaa.activity_master_details_id,
              pd.scheme_name , pd.major_component_name , pd.sub_component_name , pd.activity_master_name , pd.activity_master_details_name ,
                  pawpbdaa.allocated_physical_quantity , pawpbdaa.allocated_financial_amount , 
                  0 as physical_progress_yet_to_start, 0 as physical_progress_in_progress, 0 as physical_progress_completed,0 as financial_expenditure,
                  state_id , district_id , plan_year, ${month} as month_id, 1 as status 
          from allocation.prb_ann_wrk_pln_bdgt_data_allocation_asset pawpbdaa , prb_data pd 
          where asset_code ='${asset_code}' and plan_year = '${apiYear}' and state_id=${state_id} and district_id=${district_id}
          and pawpbdaa.activity_master_details_id = pd.id 
          and coalesce (pawpbdaa.allocated_physical_quantity,0)+ coalesce (allocated_financial_amount,0) > 0
          and pawpbdaa.activity_master_details_id in (select activity_master_details_id from fetch_activity_master_details(${activity_group_code}))
          order by pd.scheme_id , pd.major_component_id, pd.sub_component_id , pd.activity_master_id , pawpbdaa.activity_master_details_id
          
          ),
          
           total_exp as (
          select coalesce (sum(financial_expenditure),0) as  total_financial_expenditure , asset_code , activity_master_details_id 
          from 
          progress.prb_ann_wrk_pln_bdgt_data_progress_asset pawpbdpa
          where 
          asset_code ='${asset_code}'  and plan_year = '${apiYear}'  
          group by asset_code , activity_master_details_id 
          )
          
          select cte.*, total_exp.total_financial_expenditure , coalesce (dpp.construction_yn,0) as construction_yn from cte 
          left join total_exp 
          on (cte.asset_code = total_exp.asset_code and cte.activity_master_details_id =total_exp.activity_master_details_id  )
          LEFT JOIN 
            progress.diet_progress_plan dpp ON dpp.activity_master_details_id = cte.activity_master_details_id 
            AND dpp.diet_id in (select diet_id from public.master_diet mdt where mdt.diet_code  = '${asset_code}'  )
            and dpp.plan_year = cte.plan_year order by activity_master_details_name`);
    } else {
      console.log("second query");
      activityList = await Model.knx().raw(`with cte as (
          select prb_ann_wrk_pln_bdgt_data_progress_asset_id, asset_code, asset_type, 
             pd.scheme_id , pd.major_component_id, pd.sub_component_id  , pd.activity_master_id , pawpbdpa.activity_master_details_id,
             pd.scheme_name , pd.major_component_name , pd.sub_component_name , pd.activity_master_name , pd.activity_master_details_name ,
                 pawpbdpa.allocated_physical_quantity , pawpbdpa.allocated_financial_amount , 
                 physical_progress_yet_to_start, physical_progress_in_progress, physical_progress_completed,financial_expenditure,financial_year,
                 state_id , district_id , plan_year,month_id , 1 as status 
           from progress.prb_ann_wrk_pln_bdgt_data_progress_asset pawpbdpa , prb_data pd 
           where 
           asset_code ='${asset_code}' and plan_year = '${apiYear}' and month_id  = ${month}
           and pawpbdpa.activity_master_details_id = pd.id 
           and pawpbdpa.activity_master_details_id in (select activity_master_details_id from fetch_activity_master_details(${activity_group_code}))
           order by pd.scheme_id , pd.major_component_id, pd.sub_component_id , pd.activity_master_id , pawpbdpa.activity_master_details_id
           ),
           
            total_exp as (
           select coalesce (sum(financial_expenditure),0) as  total_financial_expenditure , asset_code , activity_master_details_id 
           from 
           progress.prb_ann_wrk_pln_bdgt_data_progress_asset pawpbdpa
           where 
           asset_code ='${asset_code}' and plan_year = '${apiYear}'
           group by asset_code , activity_master_details_id 
           )
           
           select cte.*, total_exp.total_financial_expenditure, dpp.construction_yn from cte 
           left join total_exp 
           on (cte.asset_code = total_exp.asset_code and cte.activity_master_details_id =total_exp.activity_master_details_id  ) 
           left join progress.diet_progress_plan dpp on dpp.activity_master_details_id = cte.activity_master_details_id 
           AND dpp.diet_id in (select diet_id from public.master_diet mdt where mdt.diet_code  = '${asset_code}'  )
           and dpp.plan_year = cte.plan_year order by activity_master_details_name`);
    }

    return Response.handle(req, res, "schoolList", 200, {
      status: true,
      data: activityList.rows,
      no_of_record: activityCount.rows[0]["no_of_record"],
    });
  } catch (e) {
    return Exception.handle(e, res, req, "schoolList");
  }
};

exports.saveActivity = async (req, res) => {
  try {
    const { data, type, user } = req.body;
    const { id } = user;
    let status = 0;
    const updated_by = req.auth.user.id;
    const updated_at = DTime.create().format("Y-m-d H:M:S");

    if (user?.udise_code !== null || user?.udise_code !== undefined) {
      status = 2;
    } else {
      if ([8, 9, 10, 11].includes(user?.user_role_id)) {
        status = 3;
      } else if ([4, 5, 6, 7, 13].includes(user?.user_role_id)) {
        status = 6;
      } else {
        status = 0;
      }
    }

    let afterInsert;
    if (
      data.length > 0 &&
      data[0].hasOwnProperty("prb_ann_wrk_pln_bdgt_data_progress_asset_id")
    ) {
      for (let i = 0; i < data.length; i++) {
        const item = data[i];
        item.updated_by = id;
        item.updated_at = "NOW()";
        item.status = String(status);
        delete item.school_name;
        delete item.scheme_name;
        delete item.major_component_name;
        delete item.sub_component_name;
        delete item.activity_master_name;
        delete item.activity_master_details_name;
        delete item.total_financial_expenditure;
        delete item.construction_yn;
        afterInsert = await ProgressModel.update(
          item,
          item.prb_ann_wrk_pln_bdgt_data_progress_asset_id,
          updated_by,
          updated_at
        );
      }
    } else {
      const dataToInsert = data.map((item) => {
        delete item.school_name;
        delete item.scheme_name;
        delete item.major_component_name;
        delete item.sub_component_name;
        delete item.activity_master_name;
        delete item.activity_master_details_name;
        delete item.construction_yn;
        delete item.total_financial_expenditure;
        return item;
      });
      dataToInsert.updated_by = id;
      dataToInsert.updated_at = "NOW()";
      dataToInsert.status = String(status);
      afterInsert = await ProgressModel.create(dataToInsert);
    }
    if (type === "school" && +afterInsert) {
      for (let i = 0; i < data.length; i++) {
        const a = await Model.knx().raw(`
      INSERT INTO progress.prb_ann_wrk_pln_bdgt_data_progress_district
     (district_id, district_type, 
     scheme_id, major_component_id, sub_component_id, activity_master_id, activity_master_details_id,
     state_id, plan_year, month_id,
     physical_progress_yet_to_start, 
     physical_progress_in_progress ,
     physical_progress_completed, 
     financial_expenditure,updated_by, updated_at)
  select district_id,'3' as district_type, 
  scheme_id, major_component_id ,sub_component_id,activity_master_id, activity_master_details_id,state_id,plan_year,month_id,
  sum (physical_progress_yet_to_start) as physical_progress_yet_to_start ,
  sum(physical_progress_in_progress) as physical_progress_in_progress ,
  sum (physical_progress_completed) as physical_progress_completed, 
  sum(financial_expenditure) as financial_expenditure, 
  '${id}', 
  NOW() 
  from 
  progress.prb_ann_wrk_pln_bdgt_data_progress_asset pawpbdpa where 
  state_id = ${data[i]["state_id"]} 
  and district_id= ${data[i]["district_id"]} 
  and pawpbdpa.asset_code = '${data[i]["asset_code"]}'
  group by district_id, 
  scheme_id, major_component_id ,sub_component_id,activity_master_id, activity_master_details_id,
         state_id,plan_year,month_id 
         on conflict (state_id, district_id, plan_year, month_id, activity_master_details_id)
    do  update set physical_progress_yet_to_start = excluded.physical_progress_yet_to_start,
           physical_progress_in_progress = excluded.physical_progress_in_progress,
           physical_progress_completed =  excluded.physical_progress_completed,
           financial_expenditure =  excluded.financial_expenditure,
           updated_by = ${id},
           updated_at = NOW()
    `);
      }
    } else if (type === "activity" && +afterInsert) {
      for (let i = 0; i < data.length; i++) {
        const a = await Model.knx().raw(`
      INSERT INTO progress.prb_ann_wrk_pln_bdgt_data_progress_district
     (district_id, district_type, 
     scheme_id, major_component_id, sub_component_id, activity_master_id, activity_master_details_id,
     state_id, plan_year, month_id,
     physical_progress_yet_to_start, 
     physical_progress_in_progress ,
     physical_progress_completed, 
     financial_expenditure, updated_by, updated_at)
  select district_id,'3' as district_type, 
  scheme_id, major_component_id ,sub_component_id,activity_master_id, activity_master_details_id,
         state_id,plan_year,month_id,
  sum (physical_progress_yet_to_start) as physical_progress_yet_to_start ,
  sum(physical_progress_in_progress) as physical_progress_in_progress ,
  sum (physical_progress_completed) as physical_progress_completed, 
  sum(financial_expenditure) as financial_expenditure, '${id}' as updated_by, NOW() as  updated_at
  from  progress.prb_ann_wrk_pln_bdgt_data_progress_asset pawpbdpa where state_id = ${req?.body?.state_id} and district_id= ${req?.body?.district_id} and pawpbdpa.activity_master_details_id = '${data[i]["activity_master_details_id"]}'
  group by district_id, 
  scheme_id, major_component_id ,sub_component_id,activity_master_id, activity_master_details_id,
         state_id,plan_year,month_id 
         on conflict (state_id, district_id, plan_year, month_id, activity_master_details_id)
    do  update set physical_progress_yet_to_start = excluded.physical_progress_yet_to_start,
           physical_progress_in_progress = excluded.physical_progress_in_progress,
           physical_progress_completed =  excluded.physical_progress_completed,
           financial_expenditure =  excluded.financial_expenditure,
           updated_by = ${id},
           updated_at = NOW()
    `);
      }
    }
    return Response.handle(req, res, "saveActivity", 200, {
      status: true,
      data: afterInsert,
      message: "Data Saved Successfully.",
    });
  } catch (e) {
    return Exception.handle(e, res, req, "saveActivity");
  }
};

// progress  Edit By Activity
exports.activityMajorComponents = async (req, res) => {
  const request = req.body;
  const { state_id, scheme_id, district_id } = request;
  const apiYear = req.headers?.api_year;
  try {
    const data = await Model.knx().raw(`select
        *
      from
        "prb_major_component" as "pmc"
      where
        "scheme_id" = ${scheme_id}
        and "prb_major_component_id" in (
        select
          distinct "major_component_id"
        from
          allocation.prb_ann_wrk_pln_bdgt_data_allocation_asset pawpbdaa
        where
          state_id = ${state_id}
          and district_id = ${district_id}
          and "plan_year" = '${apiYear}')
      order by
        "serial_order" asc`);

    return Response.handle(req, res, "majorComponents", 200, {
      status: true,
      data: data.rows,
    });
  } catch (e) {
    return Exception.handle(e, res, req, "majorComponents");
  }
};

exports.activitySubComponents = async (req, res) => {
  try {
    const request = req.body;
    const { state_id, scheme_id, major_component_id, district_id } = request;
    const apiYear = req.headers?.api_year;

    const data = await Model.knx().raw(`	
      select
        *
      from
        "prb_sub_component" as "pmc"
      where
        "scheme_id" = ${scheme_id}
        and sub_component_id  in (
        select
          distinct sub_component_id 
        from
          allocation.prb_ann_wrk_pln_bdgt_data_allocation_asset pawpbdaa
        where
          state_id = ${state_id}
          and district_id = ${district_id}
          and "plan_year" = '${apiYear}'
          and major_component_id = ${major_component_id})
      order by
        "serial_order" asc`);

    return Response.handle(req, res, "subComponents", 200, {
      status: true,
      data: data.rows,
    });
  } catch (e) {
    return Exception.handle(e, res, req, "subComponents");
  }
};

exports.alloActivemasterlist = async (req, res) => {
  try {
    const {
      schemeid,
      major_component_id,
      sub_component_id,
      state_id,
      district_id,
    } = req.body;
    const apiYear = req.headers?.api_year;
    let scheme_ids = "";
    let major_component_ids = "";
    let sub_component_ids = "";
    if (schemeid) {
      scheme_ids = `and scheme_id = '${schemeid}'`;
    }
    if (major_component_id) {
      major_component_ids = `and major_component_id = '${major_component_id}'`;
    }
    if (sub_component_id) {
      sub_component_ids = `and sub_component_id = '${sub_component_id}'`;
    }

    const object = await Model.knx().raw(
      `select * from prb_activity_master pam where 1=1 ${scheme_ids} ${major_component_ids} ${sub_component_ids} 
        and pam.id in 
        (select distinct pawpbdaa.activity_master_id 
          from allocation.prb_ann_wrk_pln_bdgt_data_allocation_asset pawpbdaa 
          where state_id = ${state_id} 
          and district_id = ${district_id}
          and plan_year = '${apiYear}')`
    );

    return Response.handle(req, res, "activemasterlist", 200, {
      status: true,
      data: object.rows,
    });
  } catch (e) {
    return Exception.handle(e, res, req, "activemasterlist");
  }
};

exports.activityMasterDetailList = async (req, res) => {
  try {
    const {
      schemeid,
      major_component_id,
      sub_component_id,
      activity_master_id,
      state_id,
      district_id,
    } = req.body;
    const apiYear = req?.headers?.api_year;

    const object = await Model.knx().raw(
      `select * from prb_data pd where scheme_id = '${schemeid}' and major_component_id = '${major_component_id}' 
        and sub_component_id = '${sub_component_id}' and 
        activity_master_id = ${activity_master_id} and 
        pd.id in (
          select distinct activity_master_details_id 
          from allocation.prb_ann_wrk_pln_bdgt_data_allocation_asset pawpbdaa 
          where state_id = ${state_id} and district_id = ${district_id} and plan_year= '${apiYear}' 
            and activity_master_id = ${activity_master_id} 
        ) order by activity_master_details_name asc`
    );

    return Response.handle(req, res, "activemasterdetaillist", 200, {
      status: true,
      data: object.rows,
    });
  } catch (e) {
    return Exception.handle(e, res, req, "activemasterdetaillist");
  }
};

exports.activitySchool = async (req, res) => {
  try {
    const { state_id, district_id, activity_master_details_id, month } = req.body;
    const apiYear = req.headers?.api_year;
    const activity_group_code = req.body.activity_group_code === 'null' || req.body.activity_group_code === null || req.body.activity_group_code === undefined ? null : `'${req.body.activity_group_code}'`;

    let afterInnsert = await Model.knx()
      .raw(`INSERT INTO progress.prb_ann_wrk_pln_bdgt_data_progress_asset
    ( asset_code, asset_type, scheme_id, major_component_id, sub_component_id, activity_master_id, activity_master_details_id, allocated_physical_quantity, allocated_financial_amount,state_id, district_id, plan_year, month_id, status)
    SELECT  asset_code, asset_type, scheme_id, major_component_id, sub_component_id, activity_master_id, activity_master_details_id, allocated_physical_quantity, allocated_financial_amount,state_id,district_id, plan_year, ${month}, 1 
    FROM allocation.prb_ann_wrk_pln_bdgt_data_allocation_asset
    where state_id = ${state_id} and district_id = ${district_id} and activity_master_details_id = ${activity_master_details_id} 
    on conflict do nothing`);

    /*    let data = await Model.knx().raw(`select 
      prb_ann_wrk_pln_bdgt_data_progress_asset_id, school_name , allocated_physical_quantity, allocated_financial_amount, 
      COALESCE(pawpbdpa.physical_progress_yet_to_start, 0) physical_progress_yet_to_start,
      COALESCE(pawpbdpa.physical_progress_in_progress, 0) physical_progress_in_progress, 
      COALESCE(pawpbdpa.physical_progress_completed, 0) physical_progress_completed,
      COALESCE(pawpbdpa.financial_expenditure, 0) financial_expenditure,
      pawpbdpa.asset_code
    from  progress.prb_ann_wrk_pln_bdgt_data_progress_asset pawpbdpa,prb_school_master psm  
    where activity_master_details_id = ${activity_master_details_id} and plan_year = '${apiYear}'  and pawpbdpa.state_id = ${state_id} and 
    pawpbdpa.district_id = ${district_id} and psm.udise_sch_code = asset_code order by school_name`); */

    let data = await Model.knx().raw(`with cte as (
      select 
            prb_ann_wrk_pln_bdgt_data_progress_asset_id, school_name , allocated_physical_quantity, allocated_financial_amount, 
            COALESCE(pawpbdpa.physical_progress_yet_to_start, 0) physical_progress_yet_to_start,
            COALESCE(pawpbdpa.physical_progress_in_progress, 0) physical_progress_in_progress, 
            COALESCE(pawpbdpa.physical_progress_completed, 0) physical_progress_completed,
            COALESCE(pawpbdpa.financial_expenditure, 0) financial_expenditure,
            pawpbdpa.asset_code , activity_master_details_id
          from  progress.prb_ann_wrk_pln_bdgt_data_progress_asset pawpbdpa,prb_school_master psm  
          where   psm.udise_sch_code = asset_code  
          and pawpbdpa.activity_master_details_id in (select activity_master_details_id from fetch_activity_master_details(${activity_group_code}))          
          and activity_master_details_id = ${activity_master_details_id} and plan_year = '${apiYear}'  and pawpbdpa.state_id = ${state_id} and month_id = ${month}
          and pawpbdpa.district_id = ${district_id}  
          ) ,
          
         total as  (
          select COALESCE(sum(pawpbdpa.physical_progress_completed), 0) as cumulative_physical_progress_completed,
                COALESCE(sum(pawpbdpa.financial_expenditure), 0) cumulative_financial_expenditure,
                 pawpbdpa.asset_code , activity_master_details_id
          from progress.prb_ann_wrk_pln_bdgt_data_progress_asset pawpbdpa
          where activity_master_details_id = ${activity_master_details_id} and plan_year = '${apiYear}'
          and pawpbdpa.state_id = ${state_id}
          and pawpbdpa.district_id = ${district_id}  
          group  by  pawpbdpa.asset_code , activity_master_details_id
          ) 
          select cte.* ,total.cumulative_physical_progress_completed,total.cumulative_financial_expenditure
          from cte left join total on (cte.asset_code= total.asset_code and cte.activity_master_details_id = total.activity_master_details_id ) order by school_name`);

    return Response.handle(req, res, "activityAchool", 200, {
      status: true,
      data: data.rows,
    });
  } catch (e) {
    return Exception.handle(e, res, req, "activityAchool");
  }
};
