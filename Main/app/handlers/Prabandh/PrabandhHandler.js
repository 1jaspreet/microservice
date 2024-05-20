const Model = require("../../models").Prabandh;
const AdminUser = require("../../models").AdminUser;
const State = require("../../models").State;
const District = require("../../models").District;
const Hash = require("../../libraries/hash");
const Exception = require("../Assets/ExceptionHandler");
const Response = require("../Assets/ResponseHandler");
const GLT = require("../../helpers/Helper").getLatestTime;
const { createObjectCsvWriter } = require("csv-writer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PlanStatusModel = require("../../models").planStatusModel;
const csv = require("csv-parser");
const ApiLog = require("../Logs/ApiLogHandler");
const MailerHandler = require("../../mails");
const { activityImage } = require("../Activities/ActivitiesHandler");
const DTime = require("node-datetime");

exports.schemes = async (req, res) => {
  try {
    const object = await Model.knx()
      .select(["title as scheme_name", "unique_code", "id"])
      .from("prb_schemes");

    return Response.handle(req, res, "schemes", 200, {
      status: true,
      data: object,
    });
  } catch (e) {
    return Exception.handle(e, res, req, "schemes");
  }
};

exports.majorComponents = async (req, res) => {
  const request = req.body;
  try {
    const object = await Model.knx()
      .select("*")
      .from("prb_major_component as pmc")
      .where("scheme_id", request.schemeid)
      .orderBy("serial_order");

    return Response.handle(req, res, "majorComponents", 200, {
      status: true,
      data: object,
    });
  } catch (e) {
    return Exception.handle(e, res, req, "majorComponents");
  }
};

exports.subcomponentslist = async (req, res) => {
  try {
    const { schemeid, major_component_id } = req.body;
    const object = await Model.knx().raw(
      `select * from prb_sub_component psc where scheme_id = ${schemeid} and major_component_id = ${major_component_id}`
    );

    return Response.handle(req, res, "subcomponentslist", 200, {
      status: true,
      data: object,
    });
  } catch (e) {
    return Exception.handle(e, res, req, "subcomponentslist");
  }
};

exports.activemasterlist = async (req, res) => {
  try {
    const { schemeid, major_component_id, sub_component_id } = req.body;
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
    // const object = await Model.knx().raw(
    //   `select * from prb_activity_master pam where scheme_id = '${schemeid}' and major_component_id = '${major_component_id}' and sub_component_id = '${sub_component_id}'`
    // );

    const object = await Model.knx().raw(
      `select * from prb_activity_master pam where 1=1 ${scheme_ids} ${major_component_ids} ${sub_component_ids}`
    );

    return Response.handle(req, res, "activemasterlist", 200, {
      status: true,
      data: object.rows,
    });
  } catch (e) {
    return Exception.handle(e, res, req, "activemasterlist");
  }
};

exports.activemasterdetaillist = async (req, res) => {
  try {
    const {
      schemeid,
      major_component_id,
      sub_component_id,
      activity_master_id,
    } = req.body;
    const object = await Model.knx().raw(
      `select * from prb_data pd where scheme_id = '${schemeid}' and major_component_id = '${major_component_id}' and sub_component_id = '${sub_component_id}' and activity_master_id = ${activity_master_id}`
    );

    return Response.handle(req, res, "activemasterdetaillist", 200, {
      status: true,
      data: object.rows,
    });
  } catch (e) {
    return Exception.handle(e, res, req, "activemasterdetaillist");
  }
};

exports.activitymasterDetailRecommendation = async (req, res) => {
  try {
    const { year, state_id, activity_master_id } = req.body;
    const object = await Model.knx().raw(
      `select * from prb_data pd where id in 
      (select psawpbd.activity_master_details_id from prb_state_ann_wrk_pln_bdgt_data psawpbd where psawpbd.state = '${state_id}' and psawpbd.plan_year = '${year}' and activity_master_id= '${activity_master_id}' and proposed_financial_amount > 0) `
    );

    return Response.handle(req, res, "activemasterdetaillist", 200, {
      status: true,
      data: object.rows,
    });
  } catch (e) {
    return Exception.handle(e, res, req, "activemasterdetaillist");
  }
};
exports.getAllActivity = async (req, res) => {
  const { scheme_id } = req.body;
  try {
    const object = await Model.knx().raw(
      `select * from prb_data where scheme_id= ${scheme_id} ORDER BY  id`
    );
    return Response.handle(req, res, "activemasterdetaillist", 200, {
      status: true,
      data: object.rows,
    });
  } catch (e) {
    return Exception.handle(e, res, req, "activemasterdetaillist");
  }
};

exports.updateApprovedActivity = async (req, res) => {
  const { update, scheme_id } = req.body;
  const updated_by = req.auth.user.id;
  const updated_at = DTime.create().format("Y-m-d H:M:S");

  try {
    const inClause = update?.join(", ");
    if (update?.length === 0) {
      const object = await Model.knx().raw(
        `UPDATE prb_data
        SET approved_plan_asset_selection = 0,
          updated_by = ${updated_by},
          updated_at = '${updated_at}'
        WHERE scheme_id=${scheme_id}`
      );
    } else {
      const object = await Model.knx().raw(
        `UPDATE prb_data
        SET approved_plan_asset_selection = 1,
          updated_by = ${updated_by},
          updated_at = '${updated_at}'
        WHERE scheme_id=${scheme_id} and id IN (${inClause})`
      );
    }
    if (inClause.length !== 0) {
      const updateOtherRecordsQuery = await Model.knx().raw(`
    UPDATE prb_data
    SET approved_plan_asset_selection = 0,
      updated_by = ${updated_by},
      updated_at = '${updated_at}'
    WHERE scheme_id = ${scheme_id} and id NOT IN (${inClause});
  `);
    }
    return Response.handle(req, res, "activemasterdetaillist", 200, {
      status: true,
      message: "Data Updated Successfully",
    });
  } catch (e) {
    return Exception.handle(e, res, req, "activemasterdetaillist");
  }
};

exports.getProgressTrackingLevel = async (req, res) => {
  const { scheme_id, major_component_id, state_id } = req.body;
  const apiYear = req.headers?.api_year;
  try {
    const insert = await Model.knx().raw(`
            INSERT INTO progress.prb_activity_detail_execution_level
            (prb_activity_detail_execution_level_id, 
            scheme_id, major_component_id, sub_component_id, activity_master_id, activity_master_detail_id, state_id,
            plan_year )
            select (nextval('progress.prb_activity_detail_execution_prb_activity_detail_execution_seq'::regclass)),
            scheme_id, major_component_id, sub_component_id, activity_master_id, activity_master_details_id, state ,plan_year
            from public.prb_state_ann_wrk_pln_bdgt_data psawpbd 
            where state = ${state_id} and plan_year = '${apiYear}'
            and proposed_physical_quantity > 0
            on conflict (activity_master_detail_id,state_id,plan_year) do nothing`);
    const object = await Model.knx().raw(
      `select pd.*,padel.physical_level_of_execution , padel.status,padel.prb_activity_detail_execution_level_id, padel.financial_level_of_execution  from 
      progress.prb_activity_detail_execution_level padel , public.prb_data pd 
      where pd.scheme_id= ${scheme_id} and pd.major_component_id=${major_component_id} and  padel.activity_master_detail_id = pd.id 
      and padel.state_id = ${state_id}
      and padel.plan_year = '${apiYear}' order by pd.activity_master_name`
    );
    return Response.handle(req, res, "activemasterdetaillist", 200, {
      status: true,
      data: object.rows,
    });
  } catch (e) {
    return Exception.handle(e, res, req, "activemasterdetaillist");
  }
};

exports.updateProgressTrackingLevel = async (req, res) => {
  const data = req.body;
  // const alldata = await Model.findLeveldata();
  // const find = Model.knx().raw(`select * from progress.prb_activity_detail_execution_level where prb_activity_detail_execution_level_id ='${data.id}'`)
  // console.log(find.rows);

  // let matchedData = [];
  // let unmatchedData = [];

  // const mapArray1 = new Map(data.map(item => [item.activity_master_detail_id, item]));

  // alldata.forEach(item => {
  //   const match = mapArray1.get(item.activity_master_detail_id);
  //   if (match) {
  //     matchedData.push({ ...item, ...match });
  //   } else {
  //     unmatchedData.push(item);
  //   }
  // });

  // try {
  //   if (unmatchedData.length > 0) { const object = await Model.createprogresslevel(unmatchedData) }
  //   if (matchedData.length > 0) {
  //     for (i = 0; i <= matchedData.length - 1; i++) {
  //       const update = await Model.knx().raw(`UPDATE progress.prb_activity_detail_execution_level
  //       SET financial_level_of_execution = ${matchedData[i]["financial_level_of_execution"]}, physical_level_of_execution=${matchedData[i]["physical_level_of_execution"]}
  //       WHERE activity_master_detail_id = ${matchedData[i]["activity_master_detail_id"]}`)
  //     }
  //   }
  //   return Response.handle(req, res, "progresslevel", 200, {
  //     status: true,
  //     message: "Data Updated Successfully"
  //   });
  // }
  try {
    for (i = 0; i <= data.length - 1; i++) {
      const update = await Model.knx()
        .raw(`UPDATE progress.prb_activity_detail_execution_level
      SET financial_level_of_execution = ${data[i]["financial_level_of_execution"]}, physical_level_of_execution=${data[i]["physical_level_of_execution"]}
      WHERE prb_activity_detail_execution_level_id = ${data[i]["id"]}`);
    }
    return Response.handle(req, res, "progresslevel", 200, {
      status: true,
      message: "Data Updated Successfully",
    });
  } catch (e) {
    return Exception.handle(e, res, req, "progresslevel");
  }
};

exports.finalizeProgressTrackingLevel = async (req, res) => {
  const state_id = req.body;
  try {
    const update = await Model.knx()
      .raw(`UPDATE progress.prb_activity_detail_execution_level
      SET status=6 WHERE state_id = ${state_id}`);
    return Response.handle(req, res, "progresslevel", 200, {
      status: true,
      message: "Tracking Level Finalized Successfully",
    });
  } catch (e) {
    return Exception.handle(e, res, req, "progresslevel");
  }
};

exports.updateApprovedPlanassetSelection = async (req, res) => {
  const { status, id } = req.body;
  const updated_by = req.auth.user.id;
  const updated_at = DTime.create().format("Y-m-d H:M:S");
  try {
    const object = await Model.knx().raw(
      `UPDATE prb_data
      SET approved_plan_asset_selection = ${status},
        updated_by = ${updated_by},
        updated_at = '${updated_at}'
      WHERE id = ${id};`
    );
    return Response.handle(req, res, "updateApprovedPlanassetSelection", 200, {
      status: true,
      message: "Status Updated Successfully",
    });
  } catch (e) {
    return Exception.handle(e, res, req, "activemasterdetaillist");
  }
};
exports.BulkupdateApprovedPlanassetSelection = async (req, res) => {
  const { status, id } = req.body;
  const ids = id.join(", ");
  try {
    updates.map(({ id, newStatus }) => {
      return knex(tableName)
        .where("id", id)
        .update({ approved_plan_asset_selection: newStatus });
    });
    const object = await Model.knx().raw(
      `UPDATE prb_data
      SET approved_plan_asset_selection = ${status}
      WHERE id = ${id};`
    );
    return Response.handle(req, res, "updateApprovedPlanassetSelection", 200, {
      status: true,
      message: "Status Updated Successfully",
    });
  } catch (e) {
    return Exception.handle(e, res, req, "activemasterdetaillist");
  }
};
exports.majorCompSubCompActivityList = async (req, res) => {
  try {
    const request = req.body;
    const object = await Model.knx().raw(`select 
              pmc.scheme_id as scheme_id, 
              pam.id as id, 
              pmc.title as major_component, 
              psc.title as sub_major_component, 
              pam.title as activity,
              pam.title  
            from prb_major_component pmc 
      left join prb_sub_component psc on psc.major_component_id  = pmc.prb_major_component_id 
      left join prb_activity_master pam on pam.sub_component_id = psc.sub_component_id order by pmc.prb_major_component_id`);

    return Response.handle(req, res, "majorCompSubCompActivityList", 200, {
      status: true,
      data: object.rows,
    });
  } catch (e) {
    return Exception.handle(e, res, req, "majorCompSubCompActivityList");
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
      `select * from prb_data pd where scheme_id = '${schemeid}' and major_component_id = '${major_component_id}' and sub_component_id = '${sub_component_id}' and activity_master_id = ${activity_master_id} and pd.id in (select distinct activity_master_details_id from prb_ann_wrk_pln_bdgt_data pawpbd where state = ${state_id} and plan_year= '${apiYear}' and activity_master_id = ${activity_master_id}) order by activity_master_details_name asc`
    );

    return Response.handle(req, res, "activemasterdetaillist", 200, {
      status: true,
      data: object.rows,
    });
  } catch (e) {
    return Exception.handle(e, res, req, "activemasterdetaillist");
  }
};

exports.subComponents = async (req, res) => {
  try {
    const request = req.body;
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
      .orderBy("prb_sub_component.serial_order", "ASC");

    return Response.handle(req, res, "subComponents", 200, {
      status: true,
      data: object,
    });
  } catch (e) {
    return Exception.handle(e, res, req, "subComponents");
  }
};

const asyncForEach = async (array, callback) => {
  for (let i = 0; i < array.length; i++) {
    await callback(array[i], i, array);
  }
};

exports.amComponents = async (req, res) => {
  try {
    let object1 = null;
    let object2 = 0;
    const request = req.body;
    const apiYear = req.headers?.api_year;
    const apiVersion = req.headers?.api_version;

    object1 = await Model.knx()
      .select(
        "pd.activity_master_name",
        "pd.activity_master_id",
        "pd.scheme_id",
        "pd.major_component_id",
        "pd.sub_component_id",
        "pd.component_type"
      )
      .max("pd.serial_order as serial_order")
      .max("ppc.final_submit as final_submit")
      .from("public.prb_plan_configurator as ppc")
      .join("public.prb_data as pd", "ppc.activity_detail_id", "pd.id")
      .where("ppc.district_id", request.district_id)
      .andWhere("ppc.state_id", request.state_id)
      .andWhere("ppc.prb_year", apiYear)
      .andWhere("pd.scheme_id", request.schemeid)
      .andWhere("pd.major_component_id", request.majorcomponentid)
      .andWhere("pd.sub_component_id", request.subcomponentid)
      .andWhere("pd.component_type", "3")
      .groupBy(
        "pd.activity_master_name",
        "pd.activity_master_id",
        "pd.scheme_id",
        "pd.major_component_id",
        "pd.sub_component_id",
        "pd.component_type"
      )
      .orderBy("serial_order", "asc");

    object2 = await Model.knx()
      .raw(
        `select count(*) as approved_status from prb_ann_wrk_pln_bdgt_data where state = ${request.state_id} and district = ${request.district_id} and plan_year = '${apiYear}' and status > 2`
      )
      .then();

    let response = {
      status: true,
      data: object1,
      is_approved: +object2?.rows[0].approved_status > 0 ? true : false,
    };

    return Response.handle(req, res, "amComponents", 200, response);
  } catch (e) {
    return Exception.handle(e, res, req, "amComponents");
  }
};

exports.amdComponents = async (req, res) => {
  try {
    const {
      state_id,
      year,
      majorcomponentid,
      subcomponentid,
      activitymasterid,
      type,
      district_id,
      role,
    } = req.body;
    let object = null;
    const apiYear = req.headers?.api_year;
    const apiVersion = req.headers?.api_version;

    /*
    object1 = await Model.knx()
      .select("*")
      .from(function () {
        this.select("*", "ppc.id as amdid")
          .from("prb_plan_configurator as ppc")
          .innerJoin("prb_data as pd", function () {
            this.on(
              Model.knx().raw(
                "CAST(pd.id AS DECIMAL) = CAST(ppc.activity_detail_id AS DECIMAL)"
              )
            );
          })
          .where("ppc.state_id", state_id)
          .where("ppc.prb_year", apiYear)
          .where("pd.major_component_id", majorcomponentid)
          .where("pd.sub_component_id", subcomponentid)
          .where("pd.activity_master_id", activitymasterid);
 
        if ([8, 9, 10].includes(role)) {
          this.where("ppc.district_id", district_id);
        } else {
          this.where("pd.component_type", 2);
        }
 
        this.as("aa");
      })
      .orderBy("serial_order", "asc");
      */

    object = await Model.knx()
      .select("*")
      .from(function () {
        this.select("*", "ppc.id as amdid")
          .from("prb_plan_configurator as ppc")
          .innerJoin("prb_data as pd", function () {
            this.on(
              Model.knx().raw("CAST(pd.id AS DECIMAL)"),
              "=",
              Model.knx().raw("CAST(ppc.activity_detail_id AS DECIMAL)")
            );
          })
          .where({
            "ppc.state_id": state_id,
            "ppc.prb_year": apiYear,
            "pd.major_component_id": majorcomponentid,
            "pd.sub_component_id": subcomponentid,
            "pd.activity_master_id": activitymasterid,
          })
          .whereIn("pd.id", function () {
            this.select("activity_master_detail_id")
              .from("prb_data_state")
              .where("state_id", state_id)
              .union(function () {
                this.select("id").from("prb_data").where("state_specfic_yn", 0);
              });
          });

        if ([8, 9, 10].includes(role)) {
          this.where("ppc.district_id", district_id);
        } else {
          this.where("pd.component_type", 2);
        }

        this.as("aa");
      })
      .orderBy("aa.serial_order", "asc");

    if (type === "finalized" && [8, 9, 10].includes(role)) {
      let response = {
        status: true,
        data: object.filter((o) => {
          return o.final_submit === 2;
        }),
      };

      return Response.handle(req, res, "amdComponents", 200, response);
    } else {
      return Response.handle(req, res, "amdComponents", 200, {
        status: true,
        data: object,
      });
    }
  } catch (e) {
    return Exception.handle(e, res, req, "amdComponents");
  }
};

exports.setPlanConfigurator = async (req, res) => {
  try {
    const {
      fields,
      year,
      status,
      created_by,
      updated_by,
      state_id,
      district_id,
      type,
    } = req.body;

    const apiYear = req.headers?.api_year;
    const apiVersion = req.headers?.api_version;

    let typeVal = type === "FS" ? 2 : 1;
    let responseData = [];

    if (fields.length > 0) {
      for (let i = 0; i < fields.length; i++) {
        let f = fields[i];
        if (f.type === "add") {
          const seldata = await Model.configurator()
            .where({ id: f.id })
            .andWhere({ prb_year: apiYear })
            .update({
              final_submit: typeVal,
              updated_by: updated_by,
              created_by: created_by,
            })
            .then(() => {});

          /* Insert into prb_ann_wrk_pln_bdgt_data*/
          if (typeVal === 2) {
            const insData = await Model.form()
              .insert({
                state: state_id,
                district: district_id,
                block: 0,
                activity_master_details_id: f.activity_master_detail_id,
                physical_quantity: 0,
                proposed_physical_quantity: 0,
                financial_amount: 0,
                proposed_financial_amount: 0,
                uom: "",
                unit_cost: 0,
                proposed_unit_cost: 0,
                status: 2,
                scheme_id: f.scheme_id,
                plan_year: apiYear,
                sub_component_id: f.sub_component_id,
                major_component_id: f.major_component_id,
                activity_master_id: f.activity_master_id,
                created_by: district_id || state_id,
                created_at: new Date(),
              })
              .then(() => {})
              .catch((error) => {
                console.error("Error inserting data:", error);
              });
          }
        }
      }
      for (let i = 0; i < fields.length; i++) {
        let f = fields[i];
        if (f.type === "delete") {
          const deldata = await Model.configurator()
            .where({ id: f.id })
            .andWhere({ prb_year: apiYear })
            .update({
              final_submit: 0,
              updated_by: updated_by,
              created_by: created_by,
            })
            .then(() => {});
        }
      }
      // responseFromApiLogger = await ApiLog.create(token, req.originalUrl, 'setPlanConfigurator', req.body, { status: true, message: true })
      // res.status(200).json({ status: true, message: true });

      return Response.handle(req, res, "setPlanConfigurator", 200, {
        status: true,
        message: true,
      });
    }
  } catch (e) {
    return Exception.handle(e, res, req, "setPlanConfigurator");
  }
};

exports.getSavedPlanState = async (req, res) => {
  try {
    const request = req.body;
    const getType = request.get;
    const role = request.role;
    const activity_group_code =
      request.activity_group_code === "null" ||
      request.activity_group_code === null ||
      request.activity_group_code === undefined
        ? null
        : `'${request.activity_group_code}'`;

    const apiYear = req.headers?.api_year;
    const apiVersion = req.headers?.api_version;

    let object = {};

    if ([8, 9, 10].includes(role)) {
      object = (
        await Model.knx().raw(`select
      distinct "pd"."scheme_id",
      "pd"."scheme_name",
      "pd"."major_component_id",
      "pd"."major_component_name",
      "pd"."sub_component_id",
      "pd"."sub_component_name",
      "pd"."activity_master_id",
      "pd"."activity_master_name",
      "pam"."drill_down_flag",
      "pd"."dd_national" as "drill_down_national",
      "pd"."dd_state" as "drill_down_state",
      "pd"."dd_district" as "drill_down_district",
      "pd"."dd_block" as "drill_down_block",
      "pd"."dd_school" as "drill_down_school",
      "pd"."dd_hostel" as "drill_down_hostel",
      "pd"."dd_child" as "drill_down_child"
    from
      "prb_plan_configurator" as "ppc"
    inner join "prb_data" as "pd" on
      "ppc"."activity_detail_id" = "pd"."id"
    inner join "prb_activity_master" as "pam" on
      "pam"."id" = "pd"."activity_master_id"
    where
      "ppc"."state_id" = ${request.stateid}
      and "ppc"."district_id" = ${request.districtid}
      and "ppc"."final_submit" = 2
      and "ppc"."prb_year" = '${apiYear}'
      and "pd"."id" in (select activity_master_details_id from fetch_activity_master_details(${activity_group_code}))`)
      ).rows;
    }
    if ([1, 2, 3, 4, 5, 6, 7, 13, 14].includes(role)) {
      //apiYear should be added
      /*       object = Model.knx()
        .select(
          "pd.scheme_id",
          "pd.scheme_name",
          "pd.major_component_id",
          "pd.major_component_name",
          "pd.sub_component_id",
          "pd.sub_component_name",
          "pd.activity_master_id",
          "pd.activity_master_name",
          "pam.drill_down_flag",
          "pd.dd_national as drill_down_national",
          "pd.dd_state as drill_down_state",
          "pd.dd_district as drill_down_district",
          "pd.dd_block as drill_down_block",
          "pd.dd_school as drill_down_school",
          "pd.dd_hostel as drill_down_hostel",
          "pd.dd_child as drill_down_child",
          "pd.recuring_nonrecuring",
          "pd.serial_order"
        )
        .from("prb_data as pd")
        .innerJoin("prb_activity_master as pam", function () {
          this.on("pam.id", "=", "pd.activity_master_id").andOn(
            "pd.component_type",
            "=",
            2
          );
        })
        .where((builder) => {
          if ([13, 14].includes(role)) {
            builder.andWhere("pd.scheme_id", 3);
          }
        })
        .orderBy("pd.scheme_id")
        .orderBy("pd.recuring_nonrecuring")
        .orderBy("pd.serial_order")
        .distinct(); */

      object = await Model.knx()
        .select(
          "pd.scheme_id",
          "pd.scheme_name",
          "pd.major_component_id",
          "pd.major_component_name",
          "pd.sub_component_id",
          "pd.sub_component_name",
          "pd.activity_master_id",
          "pd.activity_master_name"
        )
        .from("prb_data as pd")
        .innerJoin(
          "prb_ann_wrk_pln_bdgt_data as pawpbd",
          "pd.id",
          "=",
          "pawpbd.activity_master_details_id"
        )
        .where("pawpbd.state", "=", request.stateid)
        .where("pawpbd.plan_year", "=", apiYear)
        .where("pd.component_type", "=", 2)
        .whereRaw(
          `pd.id in (select activity_master_details_id from fetch_activity_master_details(${activity_group_code}))`
        )
        .where((builder) => {
          if ([13, 14].includes(role)) {
            builder.andWhere("pd.scheme_id", 3);
          }
        })
        .orderBy("pd.scheme_id", "asc")
        .orderBy("pd.activity_master_name", "asc")
        .distinct();
    }

    return Response.handle(req, res, "getSavedPlan", 200, {
      status: true,
      data: object,
    });
  } catch (e) {
    return Exception.handle(e, res, req, "getSavedPlan");
  }
};
exports.getSavedactivity = async (req, res) => {
  try {
    const request = req.body;
    console.log("request:::::", request);
    let year = "";
    let state = "";
    if (request?.year !== 0) {
      year = `and plan_year='${request.year}'`;
    }
    if (request?.stateid !== 0) {
      state = `and state='${request.stateid}'`;
    }
    // let object = {};
    const data = await Model.knx()
      .raw(`select distinct pd.scheme_id, pd.scheme_name  ,pd.major_component_id , pd.major_component_name , pd.sub_component_id , pd.    sub_component_name , pd.activity_master_name , pd.activity_master_id   
                    from prb_state_ann_wrk_pln_bdgt_data psawpbd , prb_data pd 
                    where pd.activity_master_id = psawpbd.activity_master_id 
                    and pd.id = psawpbd.activity_master_details_id  
                    and proposed_physical_quantity > 0 ${year} ${state}
                    and pd.allocation_asset_selection = 1`);
    return Response.handle(req, res, "getActivity", 200, {
      status: true,
      data: data.rows || [],
    });
  } catch (e) {
    return Exception.handle(e, res, req, "getActivity");
  }
};

exports.getdocactivityDetailList = async (req, res) => {
  try {
    const request = req.body;
    const { activity_master_id, year, stateid } = request;
    console.log("request::", request);
    const data = await Model.knx()
      .raw(`select pd.activity_master_details_name ,proposed_physical_quantity , eligible_for_allocation  from 
      prb_data pd ,public.prb_state_ann_wrk_pln_bdgt_data psawpbd  
      where pd.id = psawpbd.activity_master_details_id 
      and  state = '${stateid}' and proposed_physical_quantity > 0
      and psawpbd.activity_master_id = ${activity_master_id}  
      and plan_year='${year}'`);
    console.log(data);
    return Response.handle(req, res, "getActivity", 200, {
      status: true,
      data: data.rows || [],
    });
  } catch (e) {
    return Exception.handle(e, res, req, "getActivity");
  }
};
exports.deleteInvalidDataEntered = async (req, res) => {
  const { state_id, master_activity_detail_id } = req.body;
  try {
    const deletebyState = await Model.knx().raw(
      `delete from public.prb_state_documents where state_id::TEXT = '${state_id}' and activity_master_details_id::TEXT = '${master_activity_detail_id}' and valid_assset=0`
    );
    res
      .status(200)
      .json({ status: 200, message: "Deleted Successfully invalid entries" });
  } catch (e) {
    return Exception.handle(e, res, req, "finalsubmission");
  }
};
exports.updateStatus = async (req, res) => {
  const { state_id, activity_master_detail_id, year } = req.body;
  const updated_by = req.auth.user.id;
  const updated_at = DTime.create().format("Y-m-d H:M:S");

  try {
    const updateStatus = await Model.knx().raw(
      `update prb_state_documents psd set status = 6, updated_by=${updated_by},updated_at='${updated_at}' where plan_year='${year}' and state_id = '${state_id}' and activity_master_details_id = '${activity_master_detail_id}'`
    );
    const update = await Model.knx().raw(
      `update prb_state_ann_wrk_pln_bdgt_data set eligible_for_allocation = 1, updated_by=${updated_by} where state = '${state_id}' and plan_year = '${year}' and activity_master_details_id = '${activity_master_detail_id}'`
    );

    const insertResult = await Model.knx()
      .raw(
        `INSERT INTO allocation.prb_ann_wrk_pln_bdgt_data_allocation_asset
        (asset_code, asset_type,scheme_id, major_component_id, sub_component_id, activity_master_id, activity_master_details_id,allocated_physical_quantity, allocated_financial_amount,state_id, plan_year)
        select udise_code, 5,scheme_id, major_component_id, sub_component_id, activity_id, activity_master_details_id,physical_quantity,financial_amount,state_id , plan_year 
        from prb_state_documents psd where state_id = ${state_id} and activity_master_details_id = ${activity_master_detail_id} and plan_year = '${year}'`
      )

      .then(async (result) => {
        await Model.knx()
          .raw(`update allocation.prb_ann_wrk_pln_bdgt_data_allocation_asset paasm 
          set district_id = psm.district_id 
          from prb_school_master psm where psm.udise_sch_code =  paasm.asset_code 
          and paasm.state_id = ${state_id} and paasm.activity_master_details_id = ${activity_master_detail_id} and paasm.plan_year = '${year}'`);
        Model.knx()
          .raw(
            `update allocation.prb_ann_wrk_pln_bdgt_data_allocation_district
          set  allocated_physical_quantity = 0 , allocated_financial_amount = 0 
          where  activity_master_details_id = ${activity_master_detail_id} and state_id = ${state_id} and plan_year = '${year}'`
          )
          .then(async (slresult) => {
            await Model.knx()
              .raw(`update allocation.prb_ann_wrk_pln_bdgt_data_allocation_asset paasm
            set scheme_id = pd.scheme_id ,
            major_component_id = pd.major_component_id ,
            sub_component_id = pd.sub_component_id ,
            activity_master_id =pd.activity_master_id 
            from prb_data pd 
            where pd.id = paasm.activity_master_details_id 
            and paasm.activity_master_details_id = ${activity_master_detail_id}
            and paasm.plan_year = '${year}'
            and paasm.state_id = ${state_id}`);

            Model.knx()
              .raw(
                `INSERT INTO allocation.prb_ann_wrk_pln_bdgt_data_allocation_district
              (district_id, district_type, 
                scheme_id, major_component_id, sub_component_id, activity_master_id, activity_master_details_id, 
                allocated_physical_quantity, allocated_financial_amount,  
                state_id, plan_year,  no_of_asset)
              select district_id , 3,
              scheme_id, major_component_id, sub_component_id, activity_master_id , activity_master_details_id,
                sum(allocated_physical_quantity)  ,sum( allocated_financial_amount)  ,
                pawpbdaa.state_id ,  plan_year , count(*)
                from allocation.prb_ann_wrk_pln_bdgt_data_allocation_asset pawpbdaa 
                where activity_master_details_id = ${activity_master_detail_id} and state_id = ${state_id} and plan_year='${year}'
              group by scheme_id, major_component_id, sub_component_id, activity_master_id , activity_master_details_id,pawpbdaa.state_id , 
                plan_year ,district_id 
              on conflict (state_id,district_id,district_type, activity_master_details_id,plan_year) do 
              update 
              set allocated_physical_quantity = excluded.allocated_physical_quantity,
                  allocated_financial_amount = excluded.allocated_financial_amount `
              )
              .then((fresult) => {
                return res.status(200).json({
                  status: 200,
                  message: "Status Updated Successfully",
                  fresult,
                });
              });
          });

        // console.log(result);
      })
      .catch((error) => {
        console.error(error);
      });
  } catch (e) {
    return Exception.handle(e, res, req, "finalsubmission");
  }
};
exports.getSavedPlanDistrict = async (req, res) => {
  try {
    const request = req.body;

    const apiYear = req.headers?.api_year;
    //const apiVersion = req.headers?.api_version;

    let object = {};

    //const { page, limit, districtid, stateid } = request;
    //const offset = (page - 1) * limit;

    obj = await Model.knx()
      .select(
        Model.knx().raw(
          "ROW_NUMBER() OVER (ORDER BY pd.serial_order) AS row_number"
        ),
        "pd.scheme_name",
        "pd.major_component_name",
        "pd.sub_component_name",
        "pd.activity_master_name",
        "pd.activity_master_details_name",
        Model.knx().raw(
          "CASE WHEN pd.recuring_nonrecuring = 1 THEN 'RECURRING' ELSE 'NON RECURRING' END AS recuring_nonrecuring"
        )
      )
      .from("prb_plan_configurator as ppc")
      .join("prb_data as pd", function () {
        this.on(
          Model.knx().raw("pd.id::numeric = ppc.activity_detail_id::numeric")
        );
      })
      .where("ppc.state_id", request.stateid)
      .andWhere("ppc.district_id", request.districtid)
      .andWhere("ppc.final_submit", "2")
      .andWhere("ppc.prb_year", apiYear)
      .orderBy("pd.serial_order");

    let countObj = await Model.knx()
      .count("* as count")
      .from("prb_plan_configurator as ppc")
      .join("prb_data as pd", function () {
        this.on(
          Model.knx().raw("pd.id::numeric = ppc.activity_detail_id::numeric")
        );
      })
      .where("ppc.state_id", request.stateid)
      .andWhere("ppc.district_id", request.districtid)
      .andWhere("ppc.prb_year", apiYear)
      .andWhere("ppc.final_submit", "2")
      .first();
    object = { count: countObj.count, data: obj };

    return Response.handle(req, res, "getSavedPlanDistrict", 200, {
      status: true,
      data: object,
    });
  } catch (e) {
    return Exception.handle(e, res, req, "getSavedPlanDistrict");
  }
};

exports.getSpillOverData = async (req, res) => {
  try {
    const { districtid, unique_code } = req.body;

    if (
      districtid !== null &&
      unique_code !== null &&
      districtid !== undefined &&
      unique_code !== undefined
    ) {
      object = await Model.query()
        .select(["fieldid", "amount", "year"])
        .from("prb_spillover_data")
        .where("fieldid", unique_code)
        .where("district_id", districtid);

      // responseFromApiLogger = await ApiLog.create(token, req.originalUrl, 'getSpillOverData', req.body, { status: true, data: object })
      // res.status(200).json({ status: true, data: object });

      return Response.handle(req, res, "getSpillOverData", 200, {
        status: true,
        data: object,
      });
    }
  } catch (e) {
    return Exception.handle(e, res, req, "getSpillOverData");
  }
};

exports.savePrabandhData = async (req, res) => {
  try {
    const { data, year, status, created_by, state_id, district_id } = req.body;
    let responseData = [];
    const apiYear = req.headers?.api_year;
    const apiVersion = req.headers?.api_version;
    if (data.length > 0) {
      await data.forEach((f) => {
        const object = Model.data()
          .insert({
            activity_detail_id: f.field_id,
            amount: f.value,
            amt_qty_type: f.input_type,
            year: year,
            status: status,
            created_by: created_by,
            state_id: state_id,
            district_id: district_id,
          })
          .onConflict(["activity_detail_id", "year"])
          .merge()
          .then(() => {
            responseData.push(f);
          })
          .catch((error) => {
            console.error("Error inserting data:", error);
          });
      });

      // responseFromApiLogger = await ApiLog.create(token, req.originalUrl, 'savePrabandhData', req.body, { status: true, message: true })
      // res.status(200).json({ status: true, message: true });

      return Response.handle(req, res, "savePrabandhData", 200, {
        status: true,
        message: true,
      });
    }
  } catch (e) {
    return Exception.handle(e, res, req, "savePrabandhData");
  }
};

exports.savePrabandhForm = async (req, res) => {
  try {
    const data = req.body.data;
    const level = req.body.level;
    const apiYear = req.headers?.api_year;
    const apiVersion = req.headers?.api_version;

    let responseData = [];
    if (data.length > 0) {
      await data.forEach((f) => {
        if (+f.id === 0) {
          /*
          const object = Model.form()
            .insert({
              udise: f.value.udise,
              state: f.value.state,
              district: f.value.district,
              block: f.value.block,
              activity_master_details_id: f.value.activity_master_details_id,
              physical_quantity: f.value.physical_quantity,
              financial_amount: f.value.financial_amount,
              uom: f.value.uom,
              unit_cost: f.value.unit_cost,
              scheme_id: f.value.scheme_id,
              sub_component_id: f.value.sub_component_id,
              major_component_id: f.value.major_component_id,
              activity_master_id: f.value.activity_master_id,
            })
            .then(() => {
              responseData.push(f);
            })
            .catch((error) => {
              console.error("Error inserting data:", error);
            });
            */
        } else {
          console.log("firstqqqqqqqqqqqqqqqqqq", f);
          if (!isNaN(+f.id)) {
            const object = Model.form()
              .where("id", +f.id)
              .update({
                /* udise: f.value.udise, */
                state: f.value.state,
                district: f.value.district,
                block: f.value.block,
                activity_master_details_id: f.value.activity_master_details_id,
                physical_quantity: f.value.physical_quantity,
                financial_amount: f.value.financial_amount,
                /* spillover_amount: f.value.spillover_amount, */
                /* spillover_quantity: f.value.spillover_quantity, */
                /* uom: f.value.uom, */
                unit_cost: f.value.unit_cost,
                scheme_id: f.value.scheme_id,
                sub_component_id: f.value.sub_component_id,
                major_component_id: f.value.major_component_id,
                activity_master_id: f.value.activity_master_id,
                status: 2,
                updated_by: f.value.district || f.value.state,
                plan_year: apiYear,
                updated_at: new Date(),
              })
              .then(() => {
                responseData.push(f);
              })
              .catch((error) => {
                console.error("Error inserting data:", error);
              });
          }
        }
      });
      // responseFromApiLogger = await ApiLog.create(token, req.originalUrl, 'savePrabandhForm', req.body, { status: true, message: true, level: level })
      // res.status(200).json({ status: true, message: true, level: level });
      return Response.handle(req, res, "savePrabandhForm", 200, {
        status: true,
        message: true,
        level: level,
      });
    }
  } catch (e) {
    return Exception.handle(e, res, req, "savePrabandhForm");
  }
};

exports.savePrabandhFormSpill = async (req, res) => {
  try {
    const dataToCreate = req.body;
    delete dataToCreate.edit;
    let result;
    const created_by = req.auth.user.id;

    if (dataToCreate.prb_ann_wrk_pln_bdgt_spill_over_id) {
      result = await Model.planbdgtspillover()
        .where(
          "prb_ann_wrk_pln_bdgt_spill_over_id",
          "=",
          dataToCreate.prb_ann_wrk_pln_bdgt_spill_over_id
        )
        .update({
          prb_ann_wrk_pln_bdgt_spill_over_id:
            dataToCreate.prb_ann_wrk_pln_bdgt_spill_over_id,
          physical_quantity_cummu_inception:
            dataToCreate.physical_quantity_cummu_inception,
          financial_amount_cummu_inception:
            dataToCreate.financial_amount_cummu_inception,
          physical_quantity_progress_complete_inception:
            dataToCreate.physical_quantity_progress_complete_inception,
          physical_quantity_progress_progress_inception:
            dataToCreate.physical_quantity_progress_progress_inception,
          financial_amount_progress_inception:
            dataToCreate.financial_amount_progress_inception,
          physical_quantity_progress_notstart_inception:
            dataToCreate.physical_quantity_progress_notstart_inception,
          spillover_amount: dataToCreate.spillover_amount,
          fresh_approval_physical_quantity:
            dataToCreate.fresh_approval_physical_quantity,
          fresh_approval_financial_amount:
            dataToCreate.fresh_approval_financial_amount,
          exp_against_fresh_app_phy_ip:
            dataToCreate.exp_against_fresh_app_phy_ip,
          exp_against_fresh_app_phy_ns:
            dataToCreate.exp_against_fresh_app_phy_ns,
          exp_against_fresh_app_phy_c: dataToCreate.exp_against_fresh_app_phy_c,
          exp_against_fresh_app_fin: dataToCreate.exp_against_fresh_app_fin,
          spillover_quantity: dataToCreate.spillover_quantity,
          updated_at: new Date(),
          updated_by: created_by,
        })
        .returning("*");
    } else {
      result = await Model.planbdgtspillover()
        .insert({ ...dataToCreate, created_by })
        .returning("*");
    }

    const spillOverID = result[0]?.prb_ann_wrk_pln_bdgt_spill_over_id || 0;
    if (spillOverID !== 0) {
      await Model.knx()
        .raw(`update public.prb_ann_wrk_pln_bdgt_spill_over pawpbso
      set spillover_amount  = coalesce(financial_amount_cummu_inception,0) + coalesce (fresh_approval_financial_amount,0) - (coalesce(financial_amount_progress_inception,0) + coalesce (exp_against_fresh_app_fin,0) )
      where prb_ann_wrk_pln_bdgt_spill_over_id = ${spillOverID}`);

      await Model.knx()
        .raw(`update public.prb_ann_wrk_pln_bdgt_spill_over pawpbso
      set spillover_quantity = (coalesce(physical_quantity_cummu_inception,0) + coalesce (fresh_approval_physical_quantity,0)) - ((coalesce(physical_quantity_progress_complete_inception,0) + coalesce (exp_against_fresh_app_phy_c,0)))
      where prb_ann_wrk_pln_bdgt_spill_over_id = ${spillOverID}`);
    }

    // responseFromApiLogger = await ApiLog.create(token, req.originalUrl, 'savePrabandhFormSpill', req.body, { status: true, message: true, data: result })
    // res.status(200).json({ status: true, message: true, data: result });

    return Response.handle(req, res, "savePrabandhFormSpill", 200, {
      status: true,
      message: true,
      data: result,
    });
  } catch (e) {
    return Exception.handle(e, res, req, "savePrabandhFormSpill");
  }
};

exports.spilloverReset = async (req, res) => {
  try {
    const { id, inception_year } = req.body;

    const deletedResult = await Model.knx().raw(
      `delete from public.prb_ann_wrk_pln_bdgt_spill_over where state ='${id}' and inception_year= '${inception_year}'`
    );
    const result = await Model.knx()
      .raw(`INSERT INTO public.prb_ann_wrk_pln_bdgt_spill_over
    ( state,activity_master_details_id, uom,  status, scheme_id, sub_component_id, major_component_id, activity_master_id, inception_year)
    select  ${id},id , uom , '1' , scheme_id, sub_component_id, major_component_id, activity_master_id, '${inception_year}'
    from prb_data where recuring_nonrecuring = '2'`);

    const object = await Model.knx().raw(`
      select 
      pawpbso.prb_ann_wrk_pln_bdgt_spill_over_id,
      pawpbso.physical_quantity_cummu_inception,
      pawpbso.financial_amount_cummu_inception,
      pawpbso.physical_quantity_progress_complete_inception,
      pawpbso.physical_quantity_progress_progress_inception,
      pawpbso.financial_amount_progress_inception,
      pawpbso.physical_quantity_progress_notstart_inception,
      pawpbso.spillover_amount,
      pawpbso.spillover_quantity,
      pd.scheme_name , pd.major_component_name , pd.sub_component_name , pd.activity_master_name , pd.activity_master_details_name 
      from prb_ann_wrk_pln_bdgt_spill_over pawpbso , prb_data pd 
      where pawpbso.activity_master_details_id = pd.id and state= '${id}'`);

    // responseFromApiLogger = await ApiLog.create(token, req.originalUrl, 'spilloverReset', req.body, { status: true, data: object && object.rows ? object.rows : [] })
    // res
    //   .status(200)
    //   .json({ status: true, data: object && object.rows ? object.rows : [] });

    return Response.handle(req, res, "spilloverReset", 200, {
      status: true,
      data: object && object.rows ? object.rows : [],
    });
  } catch (e) {
    return Exception.handle(e, res, req, "spilloverReset");
  }
};

exports.deletePrabandhFormSpill = async (req, res) => {
  try {
    const { id } = req.body;

    let result = await Model.planbdgtspillover()
      .where({ prb_ann_wrk_pln_bdgt_spill_over_id: id })
      .delete();
    // =======
    //     const { id } = req.body;
    //     let result = await Model.planbdgtspillover()
    //       .where({ sub_component_id: id })
    //       .delete();
    // responseFromApiLogger = await ApiLog.create(token, req.originalUrl, 'deletePrabandhFormSpill', req.body, { status: true, message: true, data: result })
    // res.status(200).json({ status: true, message: true, data: result });

    return Response.handle(req, res, "deletePrabandhFormSpill", 200, {
      status: true,
      message: true,
      data: result,
    });
  } catch (e) {
    return Exception.handle(e, res, req, "deletePrabandhFormSpill");
  }
};

// expendeture start

exports.getSavedDataExpendFun = async (filters) => {
  const {
    state_id,
    scheme_id,
    major_component_id,
    sub_component_id,
    activity_master_id,
    activity_master_details_id,
  } = filters;
  var object;

  let cond = "";
  if (+scheme_id !== 0) {
    cond += ` and pawpbpp.scheme_id = '${scheme_id}' `;
  }
  if (+major_component_id !== 0) {
    cond += ` and pawpbpp.major_component_id = '${major_component_id}' `;
  }
  if (+sub_component_id !== 0) {
    cond += ` and pawpbpp.sub_component_id = '${sub_component_id}' `;
  }
  if (+activity_master_id !== 0) {
    cond += ` and pawpbpp.activity_master_id = '${activity_master_id}' `;
  }
  if (+activity_master_details_id !== 0) {
    cond += ` and pawpbpp.activity_master_details_id = '${activity_master_details_id}' `;
  }

  // let where = ``;
  // if (state_id !== 0 && state_id !== null) {
  //   where += `and pawpbso.state = ${state_id}`;
  // }

  // if (+scheme_id && state_id !== 0) {
  //   where += ` and pawpbso.scheme_id = '${scheme_id}'`;
  // }
  // if (+major_component_id && +major_component_id !== 0) {
  //   where += ` and pawpbso.major_component_id = ${major_component_id}`;
  // }
  // if (+sub_component_id && +sub_component_id !== 0) {
  //   where += ` and pawpbso.sub_component_id = ${sub_component_id}`;
  // }
  // if (+activity_master_id && +activity_master_id !== 0) {
  //   where += ` and pawpbso.activity_master_id = ${activity_master_id}`;
  // }
  // if (+activity_master_details_id && +activity_master_details_id !== 0) {
  //   where += ` and pawpbso.activity_master_details_id = ${activity_master_details_id}`;
  // }

  // object = await Model.knx().raw(`select
  //      ROW_NUMBER() OVER () AS index,
  //      pd.scheme_name , pd.major_component_name , pd.sub_component_name , pd.activity_master_name , pd.activity_master_details_name,
  //      pawpbso.prb_ann_wrk_pln_bdgt_prev_progress_id,
  //      pawpbso.budget_quantity,
  //      pawpbso.budget_amount,
  //      pawpbso.progress_quantity,
  //      pawpbso.progress_amount,
  //      pawpbso.status
  //      from prb_ann_wrk_pln_bdgt_prev_progress pawpbso , prb_data pd
  //      where pawpbso.activity_master_details_id = pd.id ${where} order by prb_ann_wrk_pln_bdgt_prev_progress_id`);

  object = Model.knx().raw(`select 
    ps.title  as scheme_name, pmc.title as  major_component_name , psc.title as  sub_component_name , pam.title as activity_master_name , pd.activity_master_details_name ,
    budget_quantity,budget_amount, progress_quantity, progress_amount,
     case when (aa.activity_master_id is null ) then 888888 else aa.activity_master_id end activity_master_id,
     case when (aa.sub_component_id is null ) then 777777 else aa.sub_component_id end sub_component_id,
     case when (aa.major_component_id is null ) then 666666 else aa.major_component_id end major_component_id,
     case when (aa.scheme_id is null ) then '555555' else aa.scheme_id end scheme_id,
     case when (aa.activity_master_details_id is null ) then 999999 else aa.activity_master_details_id end activity_master_details_id 
      from (
     SELECT sum(pawpbpp.budget_quantity) AS budget_quantity,
         CAST(SUM(pawpbpp.budget_amount) AS numeric(16, 5)) AS budget_amount,
         sum(pawpbpp.progress_quantity) AS progress_quantity,
         CAST(SUM(pawpbpp.progress_amount) AS numeric(16, 5)) AS progress_amount,
         pawpbpp.scheme_id,
         pawpbpp.major_component_id,
         pawpbpp.sub_component_id,
         pawpbpp.activity_master_id,
         pawpbpp.activity_master_details_id
        FROM prb_ann_wrk_pln_bdgt_prev_progress pawpbpp  
       WHERE pawpbpp.state = ${state_id} ${cond}
       and (budget_quantity+ budget_amount + progress_quantity +progress_amount > 0 )
       GROUP BY GROUPING SETS ((pawpbpp.scheme_id, pawpbpp.major_component_id, pawpbpp.sub_component_id, pawpbpp.activity_master_id, pawpbpp.activity_master_details_id), (pawpbpp.scheme_id, pawpbpp.major_component_id, pawpbpp.sub_component_id, pawpbpp.activity_master_id), (pawpbpp.scheme_id, pawpbpp.major_component_id, pawpbpp.sub_component_id), (pawpbpp.scheme_id, pawpbpp.major_component_id), (pawpbpp.scheme_id), ())
     ) 
     aa 
      left join prb_data pd on (pd.id= aa.activity_master_details_id)
      left join prb_activity_master pam on (pam.id= aa.activity_master_id)
      left join prb_sub_component psc on (psc.sub_component_id= aa.sub_component_id)
      left join prb_major_component pmc   on (pmc.prb_major_component_id = aa.major_component_id)
      left join prb_schemes ps on (ps.id= aa.scheme_id::numeric)
      order by aa.scheme_id , aa.major_component_id , aa.sub_component_id , aa.activity_master_id ,aa.activity_master_details_id`);

  return object && object.rows ? object.rows : [];
};

exports.getExpenditureReportpdf = async (filters) => {
  try {
    const { state_id } = filters;

    const object = await Model.knx().raw(`select 
    ps.title  as scheme_name, pmc.title as  major_component_name , psc.title as  sub_component_name , pam.title as activity_master_name , pd.activity_master_details_name ,
     budget_quantity,budget_amount, progress_quantity, progress_amount,
      case when (aa.activity_master_id is null ) then 888888 else aa.activity_master_id end activity_master_id,
      case when (aa.sub_component_id is null ) then 777777 else aa.sub_component_id end sub_component_id,
      case when (aa.major_component_id is null ) then 666666 else aa.major_component_id end major_component_id,
      case when (aa.scheme_id is null ) then '555555' else aa.scheme_id end scheme_id,
      case when (aa.activity_master_details_id is null ) then 999999 else aa.activity_master_details_id end activity_master_details_id 
       from (
      SELECT sum(pawpbpp.budget_quantity) AS budget_quantity,
          CAST(SUM(pawpbpp.budget_amount) AS numeric(16, 5)) AS budget_amount,
          sum(pawpbpp.progress_quantity) AS progress_quantity,
          CAST(SUM(pawpbpp.progress_amount) AS numeric(16, 5)) AS progress_amount,
          pawpbpp.scheme_id,
          pawpbpp.major_component_id,
          pawpbpp.sub_component_id,
          pawpbpp.activity_master_id,
          pawpbpp.activity_master_details_id
         FROM prb_ann_wrk_pln_bdgt_prev_progress pawpbpp  
        WHERE pawpbpp.state = ${state_id}
        and (budget_quantity+ budget_amount + progress_quantity +progress_amount > 0 )
        GROUP BY GROUPING SETS ((pawpbpp.scheme_id, pawpbpp.major_component_id, pawpbpp.sub_component_id, pawpbpp.activity_master_id, pawpbpp.activity_master_details_id), (pawpbpp.scheme_id, pawpbpp.major_component_id, pawpbpp.sub_component_id, pawpbpp.activity_master_id), (pawpbpp.scheme_id, pawpbpp.major_component_id, pawpbpp.sub_component_id), (pawpbpp.scheme_id, pawpbpp.major_component_id), (pawpbpp.scheme_id), ())
      ) 
      aa 
       left join prb_data pd on (pd.id= aa.activity_master_details_id)
       left join prb_activity_master pam on (pam.id= aa.activity_master_id)
       left join prb_sub_component psc on (psc.sub_component_id= aa.sub_component_id)
       left join prb_major_component pmc   on (pmc.prb_major_component_id = aa.major_component_id)
       left join prb_schemes ps on (ps.id= aa.scheme_id::numeric)
       order by aa.scheme_id , aa.major_component_id , aa.sub_component_id , aa.activity_master_id ,aa.activity_master_details_id
    `);
    console.log("3333333333333333333333333333", object.rows);
    return object && object.rows ? object.rows : [];
  } catch (e) {
    return Exception.handle(e, res, req, "getExpenditureReport");
  }
};
exports.getSavedDataExpend = async (req, res) => {
  try {
    const data = await this.getSavedDataExpendFun(
      ({
        state_id,
        scheme_id,
        major_component_id,
        sub_component_id,
        activity_master_id,
        activity_master_details_id,
      } = req.body)
    );

    const token = req.headers.authorization.split(" ")[1];
    let responseFromApiLogger = await ApiLog.create(
      token,
      req.originalUrl,
      "getSavedDataExpend",
      req.body,
      { status: true, data: data }
    );

    return Response.handle(req, res, "getSavedDataExpend", 200, {
      status: true,
      data: data,
    });
  } catch (e) {
    return Exception.handle(e, res, req, "getSavedDataExpend");
  }
};

exports.getExpenditures = async (req, res) => {
  try {
    const {
      state_id,
      scheme_id,
      major_component_id,
      sub_component_id,
      activity_master_id,
      activity_master_details_id,
    } = req.body;

    let cond = "";
    if (+scheme_id !== 0) {
      cond += ` and pawpbpp.scheme_id = '${scheme_id}' `;
    }
    if (+major_component_id !== 0) {
      cond += ` and pawpbpp.major_component_id = '${major_component_id}' `;
    }
    if (+sub_component_id !== 0) {
      cond += ` and pawpbpp.sub_component_id = '${sub_component_id}' `;
    }
    if (+activity_master_id !== 0) {
      cond += ` and pawpbpp.activity_master_id = '${activity_master_id}' `;
    }
    if (+activity_master_details_id !== 0) {
      cond += ` and pawpbpp.activity_master_details_id = '${activity_master_details_id}' `;
    }

    const object = await Model.knx().raw(`select
    ps.title  as scheme_name, pmc.title as  major_component_name , psc.title as  sub_component_name , pam.title as activity_master_name , pd.activity_master_details_name ,
    budget_quantity,budget_amount, progress_quantity, progress_amount,prb_ann_wrk_pln_bdgt_prev_progress_id,
     case when (aa.activity_master_id is null ) then 888888 else aa.activity_master_id end activity_master_id,
     case when (aa.sub_component_id is null ) then 777777 else aa.sub_component_id end sub_component_id,
     case when (aa.major_component_id is null ) then 666666 else aa.major_component_id end major_component_id,
     case when (aa.scheme_id is null ) then '555555' else aa.scheme_id end scheme_id,
     case when (aa.activity_master_details_id is null ) then 999999 else aa.activity_master_details_id end activity_master_details_id
      from (
     SELECT coalesce (pawpbpp.budget_quantity,0) AS budget_quantity,
         CAST(coalesce(pawpbpp.budget_amount,0) AS numeric(16, 5)) AS budget_amount,
         coalesce(pawpbpp.progress_quantity,0) AS progress_quantity,
         CAST(coalesce(pawpbpp.progress_amount,0) AS numeric(16, 5)) AS progress_amount,
         pawpbpp.scheme_id,
         pawpbpp.major_component_id,
         pawpbpp.sub_component_id,
         pawpbpp.activity_master_id,
         pawpbpp.activity_master_details_id,
         pawpbpp.prb_ann_wrk_pln_bdgt_prev_progress_id
        FROM prb_ann_wrk_pln_bdgt_prev_progress pawpbpp
       WHERE pawpbpp.state = ${state_id} ${cond}
     )
     aa
      left join prb_data pd on (pd.id= aa.activity_master_details_id)
      left join prb_activity_master pam on (pam.id= aa.activity_master_id)
      left join prb_sub_component psc on (psc.sub_component_id= aa.sub_component_id)
      left join prb_major_component pmc   on (pmc.prb_major_component_id = aa.major_component_id)
      left join prb_schemes ps on (ps.id= aa.scheme_id::numeric)
      order by aa.scheme_id , aa.major_component_id , aa.sub_component_id , aa.activity_master_id ,aa.activity_master_details_id`);

    const data = object && object.rows ? object.rows : [];

    return Response.handle(req, res, "getExpenditures", 200, {
      status: true,
      data: data,
    });
  } catch (e) {
    return Exception.handle(e, res, req, "getExpenditures");
  }
};

exports.deletePrabandhFormExpend = async (req, res) => {
  try {
    const { id } = req.body;

    let result = await Model.planbdgtExpend()
      .where({ prb_ann_wrk_pln_bdgt_prev_progress_id: id })
      .delete();

    // responseFromApiLogger = await ApiLog.create(token, req.originalUrl, 'deletePrabandhFormExpend', req.body, { status: true, message: true, data: result })
    // res.status(200).json({ status: true, message: true, data: result });

    return Response.handle(req, res, "deletePrabandhFormExpend", 200, {
      status: true,
      message: true,
      data: result,
    });
  } catch (e) {
    return Exception.handle(e, res, req, "deletePrabandhFormExpend");
  }
};

exports.savePrabandhFormExpend = async (req, res) => {
  try {
    const dataToCreate = req.body;
    delete dataToCreate.edit;
    let result;

    if (dataToCreate.prb_ann_wrk_pln_bdgt_prev_progress_id) {
      result = await Model.planbdgtExpend()
        .where(
          "prb_ann_wrk_pln_bdgt_prev_progress_id",
          "=",
          dataToCreate.prb_ann_wrk_pln_bdgt_prev_progress_id
        )
        .update({
          prb_ann_wrk_pln_bdgt_prev_progress_id:
            dataToCreate.prb_ann_wrk_pln_bdgt_prev_progress_id,
          budget_quantity: dataToCreate.budget_quantity,
          budget_amount: dataToCreate.budget_amount,
          progress_quantity: dataToCreate.progress_quantity,
          progress_amount: dataToCreate.progress_amount,
        })
        .returning("*");
    } else {
      result = await Model.planbdgtExpend().insert(dataToCreate).returning("*");
    }

    // responseFromApiLogger = await ApiLog.create(token, req.originalUrl, 'savePrabandhFormExpend', req.body, { status: true, message: true, data: result })
    // res.status(200).json({ status: true, message: true, data: result });

    return Response.handle(req, res, "savePrabandhFormExpend", 200, {
      status: true,
      message: true,
      data: result,
    });
  } catch (e) {
    return Exception.handle(e, res, req, "savePrabandhFormExpend");
  }
};

exports.expendoverReset = async (req, res) => {
  try {
    const { id, inception_year } = req.body;

    const deletedResult = await Model.knx().raw(
      `delete from public.prb_ann_wrk_pln_bdgt_prev_progress where state ='${id}' and inception_year= '${inception_year}'`
    );
    const result = await Model.knx()
      .raw(`INSERT INTO public.prb_ann_wrk_pln_bdgt_prev_progress
    ( state,activity_master_details_id, uom,  status, scheme_id, sub_component_id, major_component_id, activity_master_id, inception_year)
    select  ${id},id , uom , '1' , scheme_id, sub_component_id, major_component_id, activity_master_id, '${inception_year}'
    from prb_data`);

    const object = await Model.knx().raw(`
      select 
      pawpbso.prb_ann_wrk_pln_bdgt_prev_progress_id,
      pawpbso.budget_quantity,
      pawpbso.budget_amount,
      pawpbso.progress_quantity,
      pawpbso.progress_amount,
      pd.scheme_name , pd.major_component_name , pd.sub_component_name , pd.activity_master_name , pd.activity_master_details_name 
      from prb_ann_wrk_pln_bdgt_prev_progress pawpbso , prb_data pd 
      where pawpbso.activity_master_details_id = pd.id and state= '${id}'`);

    // responseFromApiLogger = await ApiLog.create(token, req.originalUrl, 'expendoverReset', req.body, { status: true, data: object && object.rows ? object.rows : [] })
    // res
    //   .status(200)
    //   .json({ status: true, data: object && object.rows ? object.rows : [] });

    return Response.handle(req, res, "expendoverReset", 200, {
      status: true,
      data: object && object.rows ? object.rows : [],
    });
  } catch (e) {
    return Exception.handle(e, res, req, "expendoverReset");
  }
};
// expendeture end

exports.summaryData = async (req, res) => {
  try {
    const { udise, type, district, activity_master_id, udiseType } = req.body;

    if (type === "all") {
      const originalData = await Model.knx()
        .select(["*"])
        .from("prb_ann_wrk_pln_bdgt_data")
        .where("district", district)
        .where("activity_master_id", activity_master_id);

      const transformedData = {};

      /*       originalData.forEach((item) => {
        const udise = item.udise;
        if (!transformedData[udise]) {
          transformedData[udise] = { udise, data: [] };
        }
 
        transformedData[udise].data.push({
          summaryid: item?.id || 0,
          summaryrowdetails: item,
          key: item.activity_master_details_id,
          value: [
            { label: "uom", value: item.uom },
            { label: "physical_quantity", value: item.physical_quantity },
            { label: "financial_amount", value: item.financial_amount },
            { label: "unit_cost", value: item.unit_cost },
          ],
        });
      }); */

      originalData.forEach((item) => {
        const udise = item[udiseType];
        if (!transformedData[udise]) {
          transformedData[udise] = { udise, data: [] };
        }

        transformedData[udise].data.push({
          summaryid: item?.id || 0,
          summaryrowdetails: item,
          key: item.activity_master_details_id,
          value: [
            { label: "uom", value: item.uom },
            { label: "physical_quantity", value: item.physical_quantity },
            { label: "financial_amount", value: item.financial_amount },
            { label: "unit_cost", value: item.unit_cost },
          ],
        });
      });

      const result = Object.values(transformedData);

      // responseFromApiLogger = await ApiLog.create(token, req.originalUrl, 'summaryData', req.body, { status: true, data: result })
      // res.status(200).json({ status: true, data: result });

      return Response.handle(req, res, "summaryData", 200, {
        status: true,
        data: result,
      });
    }
  } catch (e) {
    return Exception.handle(e, res, req, "summaryData");
  }
};

const getPlaceName = async (table, id = null) => {
  if (id !== null) {
    try {
      const result = await Model.knx()
        .select("*")
        .from(table)
        .where("id", id)
        .first();

      return result;
    } catch (error) {
      console.error("Error querying the database:", error);
      throw error;
    }
  } else {
    return "";
  }
};

exports.generateCSV = async (req, res) => {
  try {
    const { s, d, y } = req.body;

    const token = req.headers.authorization.split(" ")[1];
    let responseFromApiLogger;

    const object = await Model.knx()
      .select("*")
      .from("prb_plan_configurator as ppc")
      .join("prb_data as pd", function () {
        this.on(
          Model.knx().raw("pd.id::numeric = ppc.activity_detail_id::numeric")
        );
      })
      .where("ppc.state_id", s)
      .andWhere("ppc.district_id", d)
      .andWhere("ppc.prb_year", y)
      .andWhere("ppc.final_submit", "2");

    const data = object.map((o, idx) => {
      return {
        column1: idx + 1,
        column2: o.scheme_name,
        column3: o.major_component_name,
        column4: o.sub_component_name,
        column5: o.activity_master_name,
        column6: o.activity_master_details_name,
        column7: o.recuring_nonrecuring === 1 ? "RECURRING" : "NON RECURRING",
      };
    });

    const csvWriter = createObjectCsvWriter({
      path: "data.csv",
      header: [
        { id: "column1", title: "S.NO" },
        { id: "column2", title: "SCHEME" },
        { id: "column3", title: "MAJOR COMPONENT" },
        { id: "column4", title: "SUB COMPONENT" },
        { id: "column5", title: "ACTIVITY MASTER" },
        { id: "column6", title: "ACTIVITY MASTER DETAILS" },
        { id: "column7", title: "RECURRING TYPE" },
      ],
    });
    await csvWriter.writeRecords(data);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=data.csv");
    responseFromApiLogger = await ApiLog.create(
      token,
      req.originalUrl,
      "generateCSV",
      req.body,
      { status: true, data: data }
    );
    res.status(200).download("data.csv", "data.csv", (err) => {
      if (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
      } else {
        fs.unlinkSync("data.csv");
      }
    });
  } catch (e) {
    return Exception.handle(e, res, req, "generateCSV");
  }
};

exports.autoFillData = async (req, res) => {
  try {
    const { district_id, get_this, data } = req.body;
    const { activity_master_details_global_code, activity_master_global_code } =
      data;

    //const id = 2119;
    //const activityMasterGlobalCode = '1010';
    //const activityMasterDetailsGlobalCode = '10194';
    //const label = 'financial_amount';

    const object = await Model.knx()
      .select(
        Model.knx().raw(
          "jsonb_array_elements(district_activity_association_text_book)->>'values' as value"
        )
      )
      .from("prb_district_level_data_predefined")
      .where("district_id", district_id)
      .where(
        "district_activity_association_text_book",
        "@>",
        JSON.stringify([
          {
            activity_master_global_code: activity_master_global_code,
            data: [
              [
                {
                  activity_master_details_global_code:
                    activity_master_details_global_code,
                  values: [{ label: get_this }],
                },
              ],
            ],
          },
        ])
      );

    //res.status(200).json({ status: true, data: object });
    let response = {
      status: true,
      data: {
        value_of: get_this,
        value: Math.round(Math.random() * 100),
      },
    };
    // responseFromApiLogger = await ApiLog.create(token, req.originalUrl, 'autoFillData', req.body, response)
    // res.status(200).json(response);

    return Response.handle(req, res, "autoFillData", 200, response);
  } catch (e) {
    return Exception.handle(e, res, req, "autoFillData");
  }
};

exports.reportData = async (req, res) => {
  try {
    const { report_id, user, state_id, district_id, year } = req.body;

    const token = req.headers.authorization.split(" ")[1];
    let responseFromApiLogger;

    const object = await Model.knx().raw(`select pd.scheme_name , 
            pd.major_component_name , 
            pd.sub_component_name , 
            pd.activity_master_name, 
            pd.activity_master_details_name ,
            sum(pawpbd.financial_amount)::numeric(20,5) financial_amount, 
            sum(pawpbd.physical_quantity) physical_quantity ,
            max(pawpbd.uom) as uom, 
            max(pawpbd.unit_cost)::numeric(20,5) as unit_cost, 
            max(pawpbd.status) as status
    from public.prb_ann_wrk_pln_bdgt_data pawpbd , prb_data pd 
    where pd.id = pawpbd.activity_master_details_id and pawpbd.state = ${state_id} and pawpbd.district = ${district_id}
    group by pd.serial_order, pd.scheme_name , pd.major_component_name , pd.sub_component_name , pd.activity_master_name, pd.activity_master_details_name  
    order by pd.serial_order, pd.scheme_name , pd.major_component_name , pd.sub_component_name , pd.activity_master_name, pd.activity_master_details_name`);
    // .select("*")
    // .from("prb_ann_wrk_pln_bdgt_data")
    // .innerJoin(
    //   "prb_data",
    //   "prb_ann_wrk_pln_bdgt_data.activity_master_details_id",
    //   "prb_data.id"
    // );
    // responseFromApiLogger = await ApiLog.create(token, req.originalUrl, 'reportData', req.body, { status: true, data: object })
    // res.status(200).json({ status: true, data: object });

    return Response.handle(req, res, "reportData", 200, {
      status: true,
      data: object,
    });
  } catch (e) {
    return Exception.handle(e, res, req, "reportData");
  }
};

exports.majorComponentList = async (req, res) => {
  try {
    const object = await Model.knx()
      .select("prb_major_component_id as id", "title as label", "scheme_id")
      .from("prb_major_component");

    // const token = ((req.headers.authorization).split(' '))[1];
    // let responseFromApiLogger = await ApiLog.create(token, req.originalUrl, 'majorComponentList', {}, { status: true, data: object })
    // res.status(200).json({ status: true, data: object });

    return Response.handle(req, res, "majorComponentList", 200, {
      status: true,
      data: object,
    });
  } catch (e) {
    return Exception.handle(e, res, req, "majorComponentList");
  }
};

exports.subComponentList = async (req, res) => {
  try {
    const object = await Model.knx()
      .select("sub_component_id as id", "major_component_id", "title as label")
      .from("prb_sub_component");

    // const token = ((req.headers.authorization).split(' '))[1];
    // let responseFromApiLogger = await ApiLog.create(token, req.originalUrl, 'subComponentList', {}, { status: true, data: object })
    // res.status(200).json({ status: true, data: object });

    return Response.handle(req, res, "subComponentList", 200, {
      status: true,
      data: object,
    });
  } catch (e) {
    return Exception.handle(e, res, req, "subComponentList");
  }
};

// new servece create
exports.componentsaidbar = async (req, res) => {
  var role_id = req.body.id;
  try {
    // const object = await Model.knx().raw(
    //   `select * from view_menu_group where role_id =${role_id} order by order_no asc`
    // );

    const object = await Model.knx().raw(`SELECT sp.id,
    sp.role_id,
    sp.menu_id,
    sp.record_create,
    sp.record_read,
    sp.record_update,
    sp.record_delete,
    sm.parent_id,
    sm.name,
    sm.url,
    sm.active_url,
    sm.menu_img,
    sm.menu_type,
    sm.order_no,
    sm.status,
    sm.parent_sm,
    sm.module_group
   FROM system_permissions sp
     LEFT JOIN ( SELECT smg.id,
            smg.parent_id,
            smg.name,
            smg.url,
            smg.active_url,
            smg.menu_img,
            smg.menu_type,
            smg.order_no,
            smg.status,
            smg.module_group,
            smg.created_by,
            smg.updated_by,
            smg.created_at,
            smg.updated_at,
            ( SELECT json_agg(json_build_object('smp_id', smp.id, 'smp_parent_id', smp.parent_id, 'smp_name', smp.name, 'smp_url', smp.url, 'smp_active_url', smp.active_url, 'smp_menu_img', smp.menu_img, 'smp_menu_type', smp.menu_type, 'smp_order_no', smp.order_no, 'smp_status', smp.status)

              ORDER BY smp.order_no) AS user_object
                   FROM system_menus smp join system_permissions sp2 on smp.id= sp2.menu_id 
                  WHERE smp.parent_id::numeric = smg.id and sp2.role_id=${role_id}) AS parent_sm
           FROM system_menus smg
          WHERE smg.parent_id = 0 AND smg.status = 1) sm ON sm.id = sp.menu_id::numeric
  WHERE sm.parent_id = 0 and sp.role_id =${role_id}
  ORDER BY sm.order_no`);

    return Response.handle(req, res, "componentsaidbar", 200, {
      status: true,
      data: object.rows,
    });
  } catch (e) {
    return Exception.handle(e, res, req, "componentsaidbar");
  }
};

exports.viewEditFormState_editByDistrict = async (req, res) => {
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

    const subquery = Model.knx()
      .select([
        Model.knx()
          .raw(`(select count( DISTINCT prb_ann_wrk_pln_bdgt_data_physical_asset_id) from 
          prb_ann_wrk_pln_bdgt_data_physical_asset 
          where state=${state_id} and district= ${district_id} and activity_master_details_id=pawpbd.activity_master_details_id) as schoolcount`),
        Model.knx().raw("sum(physical_quantity) as physical_quantity"),
        Model.knx().raw(
          "sum(financial_amount)::numeric(20,5) as financial_amount"
        ),
        Model.knx().raw(
          "sum(proposed_financial_amount) as proposed_financial_amount"
        ),
        Model.knx().raw("max(pawpbd.status) as status"),
        Model.knx().raw(
          "sum(proposed_physical_quantity) as proposed_physical_quantity"
        ),
        Model.knx().raw(
          "max(proposed_unit_cost)::numeric(20,5) as proposed_unit_cost"
        ),
        Model.knx().raw(
          "sum(financial_amount) / nullif( sum(physical_quantity),0) as unit_cost "
        ),
        "activity_master_details_id",
      ])
      .from("prb_ann_wrk_pln_bdgt_data as pawpbd")
      .leftJoin("master_districts as md", "md.id", "=", "district")
      .where((builder) => {
        builder.where("pawpbd.plan_year", apiYear);
        if (+state_id !== 0) {
          builder.andWhere("pawpbd.state", state_id);
        }
        if (+district_id !== 0) {
          builder.andWhere("pawpbd.district", district_id);
        }
        if (+scheme_id !== 0) {
          builder.andWhere("pawpbd.scheme_id", scheme_id);
        }
        if (mcid !== undefined && mcid !== "0") {
          builder.andWhere("pawpbd.major_component_id", "=", mcid);
        }
        if (scid !== undefined && scid !== "0") {
          builder.andWhere("pawpbd.sub_component_id", "=", scid);
        }
        if (activity_master_id !== undefined && activity_master_id !== "0") {
          builder.andWhere(
            "pawpbd.activity_master_id",
            "=",
            activity_master_id
          );
        }
        if (
          activity_master_details_id !== undefined &&
          activity_master_details_id !== "0"
        ) {
          builder.andWhere(
            "pawpbd.activity_master_details_id",
            "=",
            activity_master_details_id
          );
        }
        if ([13, 14].includes(user_role_id)) {
          builder.andWhere("pawpbd.scheme_id", 3);
        }
      })
      .groupBy("activity_master_details_id")
      .as("phy");

    if (+district_id !== 0) {
      subquery.groupBy("district");
    }
    subquery.as("phy");

    let object = await Model.knx()
      .select("*")
      .from(function () {
        this.from(subquery).as("sq");
      })
      .leftJoin("prb_data as pd", "pd.id", "=", "sq.activity_master_details_id")
      .orderBy("pd.serial_order", "asc");

    return Response.handle(req, res, "getSavedData", 200, {
      status: true,
      data: object,
    });
  } catch (e) {
    return Exception.handle(e, res, req, "getSavedData");
  }
};

exports.getSavedDataActivityByDist = async (req, res) => {
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
    const activity_group_code =
      req.body.activity_group_code === "null" ||
      req.body.activity_group_code === null ||
      req.body.activity_group_code === undefined
        ? null
        : `'${req.body.activity_group_code}'`;

    let object = await Model.knx()
      .select([
        "dd_school",
        "activity_master_details_id",
        "district",
        "district_name",
        /* "physical_quantity", */
        Model.knx().raw(
          `physical_quantity::numeric(16,0) as physical_quantity`
        ),
        "unit_cost",
        Model.knx().raw(`financial_amount::numeric(20,5) as financial_amount`),
        "pawpbd.id",
        "status",
      ])
      .from("prb_ann_wrk_pln_bdgt_data as pawpbd")
      .leftJoin("master_districts as md", "md.id", "=", "district")
      .leftJoin(
        "prb_data as pd",
        "pd.id",
        "=",
        "pawpbd.activity_master_details_id"
      )
      .where((builder) => {
        builder.where("pawpbd.plan_year", apiYear);
        if (+state_id !== 0) {
          builder.andWhere("pawpbd.state", state_id);
        }
        if (+scheme_id !== 0) {
          builder.andWhere("pawpbd.scheme_id", scheme_id);
        }
        if (mcid !== undefined && mcid !== "0") {
          builder.andWhere("pawpbd.major_component_id", "=", mcid);
        }
        if (scid !== undefined && scid !== "0") {
          builder.andWhere("pawpbd.sub_component_id", "=", scid);
        }
        if (activity_master_id !== undefined && activity_master_id !== "0") {
          builder.andWhere(
            "pawpbd.activity_master_id",
            "=",
            activity_master_id
          );
        }
        if (
          activity_master_details_id !== undefined &&
          activity_master_details_id !== "0"
        ) {
          builder.andWhere(
            "pawpbd.activity_master_details_id",
            "=",
            activity_master_details_id
          );
        }

        if ([13, 14].includes(user_role_id)) {
          builder.andWhere("pawpbd.scheme_id", 3);
        }

        builder.andWhereRaw(
          `pd.id in (select activity_master_details_id from fetch_activity_master_details(${activity_group_code}))`
        );
      })
      .orderBy("md.district_name")
      .orderBy("pawpbd.id");

    // let object = await Model.knx()
    //   .select("*")
    //   .from(function () {
    //     this.from(subquery).as("sq");
    //   })
    //   .leftJoin("prb_data as pd", "pd.id", "=", "sq.activity_master_details_id")
    //   .orderBy("pd.serial_order");

    // const token = ((req.headers.authorization).split(' '))[1];
    // let responseFromApiLogger = await ApiLog.create(token, req.originalUrl, 'getSavedData', req.body, { status: true, data: object })
    // res.status(200).json({ status: true, data: object });

    const object2 = await Model.knx()
      .raw(
        `select min(status) as approved_status from prb_ann_wrk_pln_bdgt_data where state= ${state_id} and district = ${
          district_id == null ? 0 : district_id
        } and plan_year = '${apiYear}'`
      )
      .then();

    return Response.handle(req, res, "getSavedData", 200, {
      status: true,
      data: object,
      is_approved: +object2.rows[0].approved_status > 5 ? true : false,
    });
  } catch (e) {
    return Exception.handle(e, res, req, "getSavedData");
  }
};

exports.getNationalSavedData = async (req, res) => {
  try {
    const { state_id, activity_master_id } = req.body;
    const apiYear = req.headers?.api_year;
    const apiVersion = req.headers?.api_version;
    const created_by = req.auth.user.id;

    const updateTable = await Model.knx().raw(
      `insert
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
      ${created_by} as created_by
    from
      view_state_cosolidated_plan
    where
      plan_year = '${apiYear}'
      and state = ${state_id}
      and activity_master_id = ${activity_master_id}
      on
      conflict (state, activity_master_details_id, scheme_id, plan_year) do
    update
    set
      physical_quantity = excluded.physical_quantity,
      financial_amount = excluded.financial_amount,
      unit_cost = excluded.unit_cost,
      state_submission_status = excluded.state_submission_status,
      updated_by= ${created_by}`
    );

    /*
    const subquery = await Model.knx().raw(
      `
      select aa.*,coalesce (v.no_of_school ,0) as no_of_school from   ( 
      select
      pd.activity_master_details_name,
      pd.dd_school,
      pd.finance_yn ,
      pd.scheme_id,
      pd.major_component_id,
      pd.sub_component_id,
      pd.activity_master_id,
      pawpbd.activity_master_details_id,
      pawpbd.state,
      pawpbd.physical_quantity,
      pawpbd.physical_quantity as pq,
      pawpbd.financial_amount,
      pawpbd.financial_amount as fa,
      pawpbd.unit_cost,
      pawpbd.status,
      pawpbd.proposed_physical_quantity,
      pawpbd.proposed_financial_amount,
      pawpbd.proposed_unit_cost,
      pawpbd.created_by,
      pawpbd.created_at,
      pawpbd.spillover_quantity,
      pawpbd.spillover_amount,
      pawpbd.plan_year,
      pawpbd.prb_state_ann_wrk_pln_bdgt_data_id,
      pawpbd.page_number,
      pawpbd.state_submission_status,
      pawpbd.coordinator_remarks
    from
      prb_state_ann_wrk_pln_bdgt_data pawpbd,
      prb_data pd
    where
      pd.id = pawpbd.activity_master_details_id
      and pawpbd.state = ${state_id} 
      and pawpbd.activity_master_id = ${activity_master_id}
      and pawpbd.plan_year = '${apiYear}'
        ) aa left join view_state_wise_number_of_school_asset_before_approval v
        on (aa.activity_master_details_id = v.activity_master_details_id and v.plan_year = aa.plan_year and aa.state = v.state)
        `
    );
    */

    const subqueryResult = await Model.knx().raw(`select
      pd.activity_master_details_name,
      pd.dd_school,
      pd.finance_yn ,
      pd.scheme_id,
      pd.major_component_id,
      pd.sub_component_id,
      pd.activity_master_id,
      pawpbd.activity_master_details_id,
      pawpbd.state,
      pawpbd.physical_quantity,
      pawpbd.physical_quantity as pq,
      pawpbd.financial_amount::numeric(20,5),
      pawpbd.financial_amount::numeric(20,5) as fa,
      pawpbd.unit_cost::numeric(20,5),
      pawpbd.status,
      pawpbd.proposed_physical_quantity,
      pawpbd.proposed_financial_amount::numeric(20,5),
      pawpbd.proposed_unit_cost::numeric(20,5),
      pawpbd.created_by,
      pawpbd.created_at,
      pawpbd.spillover_quantity,
      pawpbd.spillover_amount,
      pawpbd.plan_year,
      pawpbd.prb_state_ann_wrk_pln_bdgt_data_id,
      pawpbd.page_number,
      pawpbd.state_submission_status,
      pawpbd.coordinator_remarks,
      'CSV' as no_of_school
    from
      prb_state_ann_wrk_pln_bdgt_data pawpbd,
      prb_data pd 
    where
      pd.id = pawpbd.activity_master_details_id
      and pawpbd.state = ${state_id} 
      and pawpbd.activity_master_id = ${activity_master_id}
      and pawpbd.plan_year = '${apiYear}'`);

    const resultWithQuantity = [];
    for (const row of subqueryResult.rows) {
      const activityMasterDetailsId = row.activity_master_details_id;
      const schoolListQryResult = await Model.knx().raw(`
    SELECT COALESCE(SUM(psawpbdpa.quantity), 0) AS school_list_quantity
    FROM prb_state_ann_wrk_pln_bdgt_data_physical_asset psawpbdpa
    WHERE plan_year = '${apiYear}'
      AND state = ${state_id}
      AND activity_master_details_id = ${activityMasterDetailsId}
  `);
      const school_list_quantity =
        schoolListQryResult.rows[0].school_list_quantity;
      resultWithQuantity.push({
        ...row,
        school_list_quantity: school_list_quantity,
      });
    }

    return Response.handle(req, res, "getNationalSavedData", 200, {
      status: true,
      data: resultWithQuantity,
    });
  } catch (e) {
    return Exception.handle(e, res, req, "getNationalSavedData");
  }
};

exports.getSavedDataSpillFun = async (filters) => {
  const {
    state_id,
    scheme_id,
    major_component_id,
    sub_component_id,
    activity_master_id,
    activity_master_details_id,
    inception_year,
  } = filters;
  var object;
  let where = ``;
  if (state_id) {
    if (state_id != 0 && state_id != null) {
      where += ` and pawpbso.state = ${state_id}`;
    }
    if (+scheme_id) {
      where += ` and pawpbso.scheme_id = '${scheme_id}'`;
    }
    /*     if (inception_year) {
      where += ` and pawpbso.inception_year = '${inception_year}'`;
    } */
    if (+major_component_id) {
      where += ` and pawpbso.major_component_id = ${major_component_id}`;
    }
    if (+sub_component_id) {
      where += ` and pawpbso.sub_component_id = ${sub_component_id}`;
    }
    if (+activity_master_id) {
      where += ` and pawpbso.activity_master_id = ${activity_master_id}`;
    }
    if (+activity_master_details_id) {
      where += ` and pawpbso.activity_master_details_id = ${activity_master_details_id}`;
    }

    object = await Model.knx().raw(`
      select 
      ROW_NUMBER() OVER () AS index,
      pd.scheme_name , pd.major_component_name , pd.sub_component_name , pd.activity_master_name , pd.activity_master_details_name ,
      pawpbso.inception_year,pawpbso.prb_ann_wrk_pln_bdgt_spill_over_id , pawpbso.status ,
      coalesce(pawpbso.physical_quantity_cummu_inception, 0) physical_quantity_cummu_inception,
      coalesce(pawpbso.financial_amount_cummu_inception, 0) financial_amount_cummu_inception,
      coalesce(pawpbso.physical_quantity_progress_complete_inception, 0) physical_quantity_progress_complete_inception,
      coalesce(pawpbso.physical_quantity_progress_progress_inception, 0) physical_quantity_progress_progress_inception,
      coalesce(pawpbso.financial_amount_progress_inception, 0) financial_amount_progress_inception,
      coalesce(pawpbso.physical_quantity_progress_notstart_inception, 0) physical_quantity_progress_notstart_inception,
      coalesce(pawpbso.spillover_amount, 0) spillover_amount,
      coalesce(pawpbso.spillover_quantity, 0) spillover_quantity,
      coalesce(pawpbso.fresh_approval_physical_quantity, 0) fresh_approval_physical_quantity,
      coalesce(pawpbso.fresh_approval_financial_amount, 0) fresh_approval_financial_amount,
      coalesce(pawpbso.exp_against_fresh_app_phy_ip, 0) exp_against_fresh_app_phy_ip,
      coalesce(pawpbso.exp_against_fresh_app_phy_ns, 0) exp_against_fresh_app_phy_ns,
      coalesce(pawpbso.exp_against_fresh_app_phy_c, 0) exp_against_fresh_app_phy_c,
      coalesce(pawpbso.exp_against_fresh_app_fin, 0) exp_against_fresh_app_fin,
      coalesce((pawpbso.exp_against_fresh_app_phy_ip + pawpbso.exp_against_fresh_app_phy_ns + pawpbso.exp_against_fresh_app_phy_c), 0) as fresh_total,
      coalesce((pawpbso.physical_quantity_progress_progress_inception + pawpbso.physical_quantity_progress_notstart_inception + pawpbso.physical_quantity_progress_complete_inception), 0) as exp_total
      from prb_ann_wrk_pln_bdgt_spill_over pawpbso , prb_data pd 
      where pawpbso.activity_master_details_id = pd.id ${where}
      order by pawpbso.updated_at desc nulls last`);
  }

  return object && object.rows ? object.rows : [];
};

exports.getSavedDataSpill = async (req, res) => {
  try {
    const data = await this.getSavedDataSpillFun(
      ({
        state_id,
        scheme_id,
        major_component_id,
        sub_component_id,
        activity_master_id,
        activity_master_details_id,
        inception_year,
      } = req.body)
    );

    // const token = ((req.headers.authorization).split(' '))[1];
    // let responseFromApiLogger = await ApiLog.create(token, req.originalUrl, 'getSavedDataSpill', req.body, { status: true, data: data });
    // res.status(200).json({ status: true, data: data });

    return Response.handle(req, res, "getSavedDataSpill", 200, {
      status: true,
      data: data,
    });
  } catch (e) {
    return Exception.handle(e, res, req, "getSavedDataSpill");
  }
};

exports.getApproveBtnStatus = async (req, res) => {
  try {
    const { state_id, district_id } = req.body;

    let object = {
      state: false,
      district: false,
    };

    // const token = ((req.headers.authorization).split(' '))[1];
    // let responseFromApiLogger;

    if (state_id && !district_id) {
      // const subquery = Model.knx()
      // .select([
      //   Model.knx().raw("sum(physical_quantity) as physical_quantity"),
      //   Model.knx().raw("sum(financial_amount) as financial_amount"),
      //   Model.knx().raw(
      //     "sum(proposed_financial_amount) as proposed_financial_amount"
      //   ),
      //   Model.knx().raw(
      //     "sum(proposed_physical_quantity) as proposed_physical_quantity"
      //   ),
      //   Model.knx().raw("max(proposed_unit_cost) as proposed_unit_cost"),
      //   Model.knx().raw("max(unit_cost) as unit_cost"),
      //   "activity_master_details_id",
      // ])
      // .from("prb_ann_wrk_pln_bdgt_data as pawpbd")
      // .where((builder) => {
      //   builder.where(1, "=", 1);
      //   if (+state_id !== 0) {
      //     builder.andWhere("pawpbd.state", state_id);
      //   }
      //   if (+district_id !== 0) {
      //     builder.andWhere("pawpbd.district", district_id);
      //   }
      //   if (+scheme_id !== 0) {
      //     builder.andWhere("pawpbd.scheme_id", scheme_id);
      //   }
      //   if (mcid !== undefined && mcid !== "0") {
      //     builder.andWhere("pawpbd.major_component_id", "=", mcid);
      //   }
      //   builder.andWhere("pawpbd.status", ">", 0)
      // })
      // .groupBy("activity_master_details_id")
      // .as("phy");

      // let object = await Model.knx()
      //   .select("*")
      //   .from(function () {
      //     this.from(subquery).as("sq");
      //   })
      //   .leftJoin(
      //     "prb_data as pd",
      //     "pd.id",
      //     "=",
      //     "sq.activity_master_details_id"
      //   )
      //   .orderBy("pd.serial_order");
      // responseFromApiLogger = await ApiLog.create(token, req.originalUrl, 'getApproveBtnStatus', req.body, { status: true, data: object })
      // res.status(200).json({ status: true, data: object });

      return Response.handle(req, res, "getApproveBtnStatus", 200, {
        status: true,
        data: object,
      });
    } else if (district_id) {
      // responseFromApiLogger = await ApiLog.create(token, req.originalUrl, 'getApproveBtnStatus', req.body, { status: true, data: object })
      // res.status(200).json({ status: true, data: object });

      return Response.handle(req, res, "getApproveBtnStatus", 200, {
        status: true,
        data: object,
      });
    } else {
      // responseFromApiLogger = await ApiLog.create(token, req.originalUrl, 'getApproveBtnStatus', req.body, { status: true, data: object })
      // res.status(200).json({ status: true, data: object });

      return Response.handle(req, res, "getApproveBtnStatus", 200, {
        status: true,
        data: object,
      });
    }
  } catch (e) {
    return Exception.handle(e, res, req, "getApproveBtnStatus");
  }
};

exports.modifyData = async (req, res) => {
  try {
    const {
      id,
      physical_quantity,
      financial_amount,
      uom,
      unit_cost,
      proposed_physical_quantity,
      proposed_financial_amount,
      proposed_unit_cost,
      state_id,
      district_id,
    } = req.body;
    let object = null;
    const apiYear = req.headers?.api_year;
    const apiVersion = req.headers?.api_version;

    object = await Model.form()
      .where("activity_master_details_id", "=", id)
      .where("state", "=", state_id)
      .where((builder) => {
        if (district_id === 0) {
          builder.whereNull("district").orWhere("district", 0);
        } else {
          builder.where("district", "=", district_id);
        }
      })
      .andWhere("plan_year", apiYear)
      .update({
        physical_quantity,
        financial_amount,
        uom,
        unit_cost,
        proposed_physical_quantity,
        proposed_financial_amount,
        proposed_unit_cost,
      })
      .catch((error) => {
        console.error("Error inserting data:", error);
      });

    // const token = ((req.headers.authorization).split(' '))[1];
    // let responseFromApiLogger = await ApiLog.create(token, req.originalUrl, 'modifyData', req.body, { status: true, data: object })
    // res.status(200).json({ status: true, data: object });

    return Response.handle(req, res, "modifyData", 200, {
      status: true,
      data: object,
    });
  } catch (e) {
    return Exception.handle(e, res, req, "modifyData");
  }
};

exports.updateSchoolActivities = async (req, res) => {
  try {
    const { state_id, district_id } = req.body;
    const updateValues = req.body.form_data;
    const udise = req.body.school_data.id;

    object = await Model.school()
      .where("udise_sch_code", "=", udise)
      .where((builder) => {
        if (district_id !== 0) {
          builder.where("district_id", "=", district_id);
        } else {
          builder.where("state_id", "=", state_id);
        }
      })
      .update(updateValues)
      .catch((error) => {
        console.error("Error inserting data:", error);
      });

    // const token = ((req.headers.authorization).split(' '))[1];
    // let responseFromApiLogger = await ApiLog.create(token, req.originalUrl, 'updateSchoolActivities', req.body, { status: true, data: object })
    // res.status(200).json({ status: true, data: object });

    return Response.handle(req, res, "updateSchoolActivities", 200, {
      status: true,
      data: object,
    });
  } catch (e) {
    return Exception.handle(e, res, req, "updateSchoolActivities");
  }
};

exports.amdBdgt = async (req, res) => {
  try {
    const {
      state_id,
      year,
      majorcomponentid,
      subcomponentid,
      activitymasterid,
      type,
      district_id,
      role,
    } = req.body;

    const apiYear = req.headers?.api_year;
    const apiVersion = req.headers?.api_version;

    /*     if ([8, 9, 10].includes(role)) {
      object = await Model.knx()
        .select("*")
        .from({ pd: "prb_data" })
        .join(
          { pawpbd: "public.prb_ann_wrk_pln_bdgt_data" },
          "pd.id",
          "=",
          "pawpbd.activity_master_details_id"
        )
        .where("pawpbd.state", state_id)
        .andWhere("pd.major_component_id", majorcomponentid)
        .andWhere("pd.sub_component_id", subcomponentid)
        .andWhere("pd.activity_master_id", activitymasterid)
        .andWhere("pawpbd.district", district_id)
        .orderBy("pawpbd.id", "asc");
    }
    if ([1, 2, 3, 4, 5, 6, 7].includes(role)) {
      object = await Model.knx()
        .select("*")
        .from({ pd: "prb_data" })
        .join(
          { pawpbd: "public.prb_ann_wrk_pln_bdgt_data" },
          "pd.id",
          "=",
          "pawpbd.activity_master_details_id"
        )
        .where("pawpbd.state", state_id)
        .andWhere("pd.major_component_id", majorcomponentid)
        .andWhere("pd.sub_component_id", subcomponentid)
        .andWhere("pd.activity_master_id", activitymasterid)
        .orderBy("pawpbd.id", "asc");
    } */

    let query = "";
    if ([8, 9, 10, 11].includes(role)) {
      query = await Model.knx()
        .select("aa.*", "bb.number_of_school")
        .from(function () {
          this.select(
            "pd.*",
            "pawpbd.udise",
            "pawpbd.state",
            "pawpbd.district",
            "pawpbd.block",
            "pawpbd.activity_master_details_id",
            "pawpbd.physical_quantity",
            Model.knx().raw(
              `pawpbd.financial_amount::numeric(20,5) as financial_amount `
            ),
            /* "pawpbd.financial_amount", */
            "pawpbd.uom",
            Model.knx().raw(`pawpbd.unit_cost::numeric(20,5) as unit_cost `),
            /* "pawpbd.unit_cost", */
            "pawpbd.status",
            "pawpbd.scheme_id",
            "pawpbd.sub_component_id",
            "pawpbd.major_component_id",
            "pawpbd.activity_master_id",
            "pawpbd.id as pawpbd_id",
            "pawpbd.proposed_physical_quantity",
            Model.knx().raw(
              `pawpbd.proposed_financial_amount::numeric(20,5) as proposed_financial_amount`
            ),
            /* "pawpbd.proposed_financial_amount", */
            Model.knx().raw(
              `pawpbd.proposed_unit_cost::numeric(20,5) as proposed_unit_cost`
            ),
            /* "pawpbd.proposed_unit_cost", */
            "pawpbd.created_by",
            Model.knx().raw(
              "to_char(pd.created_at, 'YYYY-MM-DD HH24:MI:SS.MS') as created_at"
            ),
            "pawpbd.spillover_quantity",
            "pawpbd.spillover_amount",
            "pawpbd.plan_year",
            "pawpbd.updated_by",
            Model.knx().raw(
              "to_char(pd.updated_at, 'YYYY-MM-DD HH24:MI:SS.MS') as updated_at"
            )
          )
            .from({ pd: "prb_data" })
            .join(
              { pawpbd: "public.prb_ann_wrk_pln_bdgt_data" },
              "pd.id",
              "=",
              "pawpbd.activity_master_details_id"
            )
            .where("pawpbd.state", state_id)
            .andWhere("pawpbd.plan_year", apiYear)
            .andWhere("pd.major_component_id", majorcomponentid)
            .andWhere("pd.sub_component_id", subcomponentid)
            .andWhere("pd.activity_master_id", activitymasterid)
            .modify((knexQuery) => {
              if (district_id !== null && district_id > 0) {
                knexQuery.andWhere("pawpbd.district", district_id);
              }
            })
            .as("aa");
        })
        .leftJoin(
          function () {
            this.select("activity_master_details_id")
              .count("* as number_of_school")
              .from("prb_ann_wrk_pln_bdgt_data_physical_asset")
              .where("state", state_id)
              .andWhere("plan_year", apiYear)
              .modify((knexQuery) => {
                if (district_id !== null && district_id > 0) {
                  knexQuery.andWhere("district", district_id);
                }
              })
              .groupBy("activity_master_details_id")
              .as("bb");
          },
          "aa.id",
          "bb.activity_master_details_id"
        )
        .orderBy("pawpbd_id", "asc");
    } else if ([4, 5, 6, 7, 13, 14, 15].includes(role)) {
      query = await Model.knx()
        .select("aa.*", "bb.number_of_school")
        .from(function () {
          this.select(
            "pd.*",
            "pawpbd.udise",
            "pawpbd.state",
            "pawpbd.district",
            "pawpbd.block",
            "pawpbd.activity_master_details_id",
            "pawpbd.physical_quantity",
            Model.knx().raw(
              "pawpbd.financial_amount::numeric(20,5) as financial_amount"
            ),
            /* "pawpbd.financial_amount", */
            "pawpbd.uom",
            Model.knx().raw("pawpbd.unit_cost::numeric(20,5) as unit_cost"),
            /* "pawpbd.unit_cost", */
            "pawpbd.status",
            "pawpbd.scheme_id",
            "pawpbd.sub_component_id",
            "pawpbd.major_component_id",
            "pawpbd.activity_master_id",
            "pawpbd.id as pawpbd_id",
            "pawpbd.proposed_physical_quantity",
            Model.knx().raw(
              "pawpbd.proposed_financial_amount::numeric(20,5) as proposed_financial_amount"
            ),
            /* "pawpbd.proposed_financial_amount", */
            Model.knx().raw(
              "pawpbd.proposed_unit_cost::numeric(20,5) as proposed_unit_cost"
            ),
            /* "pawpbd.proposed_unit_cost", */
            "pawpbd.created_by",
            Model.knx().raw(
              "to_char(created_at, 'YYYY-MM-DD HH24:MI:SS.MS') as created_at"
            ),
            "pawpbd.spillover_quantity",
            "pawpbd.spillover_amount",
            "pawpbd.plan_year",
            "pawpbd.updated_by",
            "pd.dd_national as drill_down_national",
            "pd.dd_state as drill_down_state",
            "pd.dd_district as drill_down_district",
            "pd.dd_block as drill_down_block",
            "pd.dd_school as drill_down_school",
            "pd.dd_hostel as drill_down_hostel",
            "pd.dd_child as drill_down_child",
            Model.knx().raw(
              "to_char(updated_at, 'YYYY-MM-DD HH24:MI:SS.MS') as updated_at"
            )
          )
            .from({ pd: "prb_data" })
            .join(
              { pawpbd: "public.prb_ann_wrk_pln_bdgt_data" },
              "pd.id",
              "=",
              "pawpbd.activity_master_details_id"
            )
            .where("pawpbd.state", state_id)
            .andWhere("pawpbd.plan_year", apiYear)
            .andWhere("pd.major_component_id", majorcomponentid)
            .andWhere("pd.sub_component_id", subcomponentid)
            .andWhere("pd.activity_master_id", activitymasterid)
            .andWhere("pd.component_type", 2)
            .modify((knexQuery) => {
              if (district_id !== null && district_id > 0) {
                knexQuery.andWhere("pawpbd.district", district_id);
              }
            })
            .as("aa");
        })
        .leftJoin(
          function () {
            this.select("activity_master_details_id")
              .count("* as number_of_school")
              .from("prb_ann_wrk_pln_bdgt_data_physical_asset")
              .where("state", state_id)
              .andWhere("plan_year", apiYear)
              .modify((knexQuery) => {
                if (district_id !== null && district_id > 0) {
                  knexQuery.andWhere("district", district_id);
                }
              })
              .groupBy("activity_master_details_id")
              .as("bb");
          },
          "aa.id",
          "bb.activity_master_details_id"
        )
        .orderBy("pawpbd_id", "asc");
    }

    const object = query;

    const object2 = await Model.knx()
      .raw(
        `select min(status) as approved_status from prb_ann_wrk_pln_bdgt_data where state= ${state_id} and district = ${
          district_id == null ? 0 : district_id
        } and plan_year = '${apiYear}'`
      )
      .then();

    let is_approved =
      +object2.rows[0].approved_status > 2 && [8, 9, 10, 11].includes(role)
        ? true
        : +object2.rows[0].approved_status > 5 &&
          [4, 5, 6, 7, 13, 14, 15].includes(role)
        ? true
        : false;

    let response = {
      status: true,
      data: object,
      is_approved: is_approved,
      latest_updated_at: GLT(object),
    };

    return Response.handle(req, res, "amdBdgt", 200, response);

    /* New */
    /*     const objectQuery = Model.knx()
      .select("*")
      .from({ pd: "prb_data" })
      .join(
        { pawpbd: "public.prb_ann_wrk_pln_bdgt_data" },
        "pd.id",
        "=",
        "pawpbd.activity_master_details_id"
      )
      .where("pawpbd.state", state_id)
      .andWhere("pd.major_component_id", majorcomponentid)
      .andWhere("pd.sub_component_id", subcomponentid)
      .andWhere("pd.activity_master_id", activitymasterid)
      .modify((knexQuery) => {
        if ([1, 2, 3, 4, 5, 6, 7].includes(role)) {
          knexQuery.andWhere("pawpbd.district", district_id);
        }
      })
      .orderBy("pawpbd.id", "asc");
 
    const object = await objectQuery;
 
    const uniqueActivityIds = [
      ...new Set(object.map((item) => item.activity_master_id)),
    ];
 
    const countPromises = uniqueActivityIds.map((uniqueId) =>
      Model.knx()
        .count("* as count")
        .from("prb_ann_wrk_pln_bdgt_data_physical_asset")
        .where("state", state_id)
        .andWhere("district", district_id)
        .andWhere("activity_master_id", uniqueId)
        .first()
    );
 
    const counts = await Promise.all(countPromises);
 
    const resultArray = object.map((item) => ({
      ...item,
      total_school_selected:
        counts.find(
          (count) => count.activity_master_id === item.activity_master_id
        )?.count || 0,
    }));
 
    res.status(200).json({
      status: true,
      data: resultArray,
    }); */

    /* new code end  */
  } catch (e) {
    return Exception.handle(e, res, req, "amdBdgt");
  }
};

exports.activitiesForSchoolSelection = async (req, res) => {
  try {
    const { state_id, district_id, drill_down_school } = req.body;

    const object = await Model.knx()
      .select("pd.*", "pam.drill_down_school")
      .from("prb_ann_wrk_pln_bdgt_data as pawpbd")
      .innerJoin(
        "prb_activity_master as pam",
        "pawpbd.activity_master_id",
        "pam.id"
      )
      .innerJoin("prb_data as pd", "pd.id", "pawpbd.activity_master_details_id")
      .where("pawpbd.state", state_id)
      .andWhere("pawpbd.district", district_id)
      .andWhere("pam.drill_down_school", drill_down_school);

    // const token = ((req.headers.authorization).split(' '))[1];
    // let responseFromApiLogger = await ApiLog.create(token, req.originalUrl, 'activitiesForSchoolSelection', req.body, { status: true, data: object })

    // res.status(200).json({
    //   status: true,
    //   data: object,
    // });

    return Response.handle(req, res, "activitiesForSchoolSelection", 200, {
      status: true,
      data: object,
    });
  } catch (e) {
    return Exception.handle(e, res, req, "activitiesForSchoolSelection");
  }
};

exports.tempConfig = async (req, res) => {
  try {
    const apiYear = req.headers?.api_year;
    const apiVersion = req.headers?.api_version;
    const { stateid, districtid, type } = req.body;
    let object = null;

    if (type === "state") {
      //     const rawQuery = `
      // INSERT INTO public.prb_ann_wrk_pln_bdgt_data
      // (state, scheme_id, major_component_id, sub_component_id, activity_master_id, activity_master_details_id,
      // physical_quantity, financial_amount, uom, unit_cost, status, id)
      // SELECT
      //   ${stateid},
      //   scheme_id,
      //   major_component_id,
      //   sub_component_id,
      //   activity_master_id,
      //   id,
      //   0,
      //   0,
      //   0,
      //   0,
      //   1,
      //   nextval('prb_ann_wrk_pln_bdgt_data_id_seq'::regclass)
      // FROM public.prb_data WHERE component_type = '2'`;

      const rawQuery = `INSERT INTO public.prb_ann_wrk_pln_bdgt_data
                        (state,district ,scheme_id, major_component_id, sub_component_id, activity_master_id, activity_master_details_id,
  physical_quantity, financial_amount, uom, unit_cost, status, id,created_by,plan_year)
  SELECT
    ${stateid},
    0,
   scheme_id,
    major_component_id,
    sub_component_id,
    activity_master_id,
    id,
    0,
    0,
    0,
    0,
    6,
    nextval('prb_ann_wrk_pln_bdgt_data_id_seq'::regclass),
    ${stateid},
    '${apiYear}'
FROM public.prb_data WHERE component_type = '2' and id not in ( select activity_master_details_id from public.prb_ann_wrk_pln_bdgt_data where state =${stateid} and plan_year = '${apiYear}') on conflict (activity_master_details_id, state, district,plan_year) do update set status = 6`;

      object = await Model.knx()
        .raw(rawQuery)
        .then((result) => {})
        .catch((error) => {});
    }
    if (type === "district") {
      //     const rawQuery = `
      // INSERT INTO public.prb_plan_configurator
      // (id, activity_detail_id, state_id, district_id, prb_year, status, final_submit, iid)
      // SELECT
      //   nextval('prb_plan_configurator_iid_seq'::regclass),
      //   pd.id,
      //   ${stateid},
      //   ${districtid},
      //   2023,
      //   1,
      //   0,
      //   nextval('prb_plan_configurator_iid_seq'::regclass)
      //   FROM prb_data pd`;

      const rawQuery = `INSERT INTO public.prb_plan_configurator (id, activity_detail_id, state_id, district_id, prb_year, status, final_submit, iid) select nextval('prb_plan_configurator_iid_seq'::regclass), id,${stateid},${districtid}, '${apiYear}',1,0, nextval('prb_plan_configurator_iid_seq'::regclass) FROM public.prb_data WHERE component_type = '3' and id not in (select activity_detail_id from public.prb_plan_configurator ppc where state_id = ${stateid} and district_id = ${districtid} and prb_year = '${apiYear}' ) on conflict (activity_detail_id, state_id, district_id,prb_year) do update set final_submit = 0`;

      object = await Model.knx()
        .raw(rawQuery)
        .then((result) => {})
        .catch((error) => {});
    }

    // const token = ((req.headers.authorization).split(' '))[1];
    // let responseFromApiLogger = await ApiLog.create(token, req.originalUrl, 'tempConfig', req.body, { status: true, data: object })

    // res.status(200).json({
    //   status: true,
    //   data: object,
    // });

    return Response.handle(req, res, "tempConfig", 200, {
      status: true,
      data: object,
    });
  } catch (e) {
    return Exception.handle(e, res, req, "tempConfig");
  }
};

exports.submitPlan = async (req, res) => {
  try {
    const apiYear = req.headers?.api_year;
    const apiVersion = req.headers?.api_version;

    const { district_id, status, plan_year, state_id, user_state_id } =
      req.body;
    let object;

    if (state_id) {
      object = await Model.knx().raw(
        `UPDATE prb_ann_wrk_pln_bdgt_data SET status = ${status}, updated_by = ${state_id}, updated_at = ${Model.knx().fn.now()} WHERE state = ${state_id} and plan_year = '${apiYear}'`
      );

      const districtNodalOfficers = await AdminUser.find({
        "u.user_state_id": user_state_id,
        "u.user_role_id": 8,
      });
      let mails = districtNodalOfficers.map((u) => u.user_email);
      await MailerHandler.planApproved(req, {
        subject: "Plan Approved",
        msg: `Your Plan has been approved by State.`,
        to: mails,
      });

      const stateNodalOfficers = await AdminUser.find({
        "u.user_state_id": user_state_id,
        "u.user_role_id": 4,
      });
      const stateObj = await State.findOne({ id: state_id });
      mails = stateNodalOfficers.map((u) => u.user_email);
      await MailerHandler.planApproved(req, {
        subject: "Plan Approved",
        msg: `All Plans of State: ${stateObj.state_name} has been approved.`,
        to: mails,
      });
    } else {
      object = await Model.knx().raw(
        `UPDATE prb_ann_wrk_pln_bdgt_data SET status = ${status}, updated_by = ${district_id}, updated_at = ${Model.knx().fn.now()} WHERE district = ${district_id} and plan_year = '${apiYear}'`
      );

      const stateNodalOfficers = await AdminUser.find({
        "u.user_state_id": user_state_id,
        "u.user_role_id": 4,
      });
      const districtNodalOfficers = await AdminUser.find({
        "u.user_state_id": user_state_id,
        "u.user_role_id": 8,
      });
      const districtObj = await District.findOne({ "md.id": district_id });
      let mails = [
        ...stateNodalOfficers.map((u) => u.user_email),
        ...districtNodalOfficers.map((u) => u.user_email),
      ];
      await MailerHandler.planApproved(req, {
        subject: "Plan Approved",
        msg: `Plan has been approved for District: ${districtObj.district_name}.`,
        to: mails,
      });
    }

    return Response.handle(req, res, "submitPlan", 200, {
      status: true,
      data: object,
    });
  } catch (e) {
    return Exception.handle(e, res, req, "submitPlan");
  }
};

exports.saveSchoolConfiguration = async (req, res) => {
  try {
    const { district_id, state_id, data, process, pg } = req.body;
    const { rows, amd } = data;
    const tableName = "prb_ann_wrk_pln_bdgt_data_physical_asset";
    let state = state_id;
    let district = district_id;
    const activityMasterDetailsId = amd?.activity_master_details_id;
    const apiYear = req.headers?.api_year;
    const apiVersion = req.headers?.api_version;

    if (process) {
      let total_inserted = 0;
      let failed_udise_array = [];
      let success_udise_array = [];

      await Model.knx()
        .from("prb_ann_wrk_pln_bdgt_data_physical_asset")
        .where("state", "=", state)
        .andWhere("district", "=", district)
        .andWhere("activity_master_details_id", "=", activityMasterDetailsId)
        .andWhere("plan_year", apiYear)
        .del();

      const saveObj = {
        asset_code: "",
        asset_type: 5,
        state: state,
        district: district,
        activity_master_details_id: activityMasterDetailsId,
        scheme_id: amd.scheme_id,
        sub_component_id: amd.sub_component_id,
        major_component_id: amd.major_component_id,
        activity_master_id: amd.activity_master_id,
        prb_ann_wrk_pln_bdgt_data_id: 0,
        applicable_yn: 1,
        block: 0,
        quantity: 1,
        financial_quantity: 0,
        plan_year: apiYear,
      };

      const padZeros = (udiseValue, length) => {
        if (udiseValue.length === length) {
          udiseValue = "0" + udiseValue;
        }
        return udiseValue;
      };

      const object = await Model.knx()
        .distinct("*")
        .from("udisetemp")
        .where("state", state)
        .where("district", district)
        .where("activity_master_detail_id", activityMasterDetailsId);

      const udiseValues = object
        .map((record) => padZeros(String(record.udise), 10))
        .join("','");

      const chkUDISE = await Model.knx().raw(
        `SELECT udise_sch_code FROM prb_school_master WHERE udise_sch_code IN ('${udiseValues}') AND state_id = '${state}' AND district_id = '${district}'`
      );

      await Model.knx().transaction(async (trx) => {
        for (const record of object) {
          //let udiseValue = String(record.udise);
          let udiseValue = padZeros(String(record.udise), 10);

          if (udiseValue.length > 11) {
            udiseValue = udiseValue.slice(0, 11);
          }

          if (
            chkUDISE.rows.find((row) => {
              return row.udise_sch_code === udiseValue;
            })?.udise_sch_code
          ) {
            const saveObjForUDISE = {
              ...saveObj,
              asset_code: udiseValue,
              prb_ann_wrk_pln_bdgt_data_id: 0,
              quantity: record.values,
              financial_quantity: +record.financial_quantity,
            };

            total_inserted += 1;
            await Model.assetForm()
              .insert(saveObjForUDISE)
              .onConflict([
                "asset_code",
                "state",
                "district",
                "activity_master_details_id",
                "plan_year",
              ])
              .merge();

            success_udise_array.push(record.udise);
          } else {
            failed_udise_array.push(record.udise);
          }
        }
        await trx
          .from("udisetemp")
          .where("state", state)
          .where("district", district)
          .where("activity_master_detail_id", activityMasterDetailsId)
          .del();
      });

      await Model.knx().raw(
        `update prb_ann_wrk_pln_bdgt_data d set physical_quantity = a.quantity from ( select sum(quantity) as quantity, district, activity_master_details_id from prb_ann_wrk_pln_bdgt_data_physical_asset a where a.plan_year = '${apiYear}' group by district, activity_master_details_id ) a where d.plan_year = '${apiYear}' and d.district = a.district and d.activity_master_details_id = a.activity_master_details_id and d.district = ${district} and d.activity_master_details_id = ${activityMasterDetailsId}`
      );

      return Response.handle(req, res, "saveSchoolConfiguration", 200, {
        status: true,
        data: "Successfully inserted",
        success_udise_list: success_udise_array,
        failed_udise_list: failed_udise_array,
      });

      /* old code 
      let total_inserted = 0;
      let failed_udise_array = [];
      let success_udise_array = [];
 
      const object = await Model.knx()
        .distinct("*")
        .from("udisetemp")
        .where("state", state)
        .where("district", district)
        .where("activity_master_detail_id", activityMasterDetailsId);
 
      const saveObj = {
        asset_code: "",
        asset_type: 5,
        state: state,
        district: district,
        activity_master_details_id: activityMasterDetailsId,
        scheme_id: amd.scheme_id,
        sub_component_id: amd.sub_component_id,
        major_component_id: amd.major_component_id,
        activity_master_id: amd.activity_master_id,
        prb_ann_wrk_pln_bdgt_data_id: 0,
        applicable_yn: 1,
        block: 0,
        quantity: 1,
        financial_quantity: 0,
      };
 
      for (const record of object) {
        let udiseValue = record.udise;
        const quantityValue = record.values;
        const fq = record.financial_quantity;
 
        udiseValue = String(udiseValue);
 
        if (udiseValue.length === 10) {
          udiseValue = "0" + udiseValue;
        }
 
        if (udiseValue.length > 11) {
          udiseValue = udiseValue.slice(0, 11);
        }
 
        const chkUDISE = await Model.knx().raw(
          `SELECT count(*) as found from prb_school_master WHERE udise_sch_code = '${udiseValue}' AND state_id = '${state}' AND district_id = '${district}'`
        );
 
        if (+chkUDISE.rows[0].found > 0) {
          const saveObjForUDISE = {
            ...saveObj,
            asset_code: udiseValue,
            prb_ann_wrk_pln_bdgt_data_id: 0,
            quantity: quantityValue,
            financial_quantity: +fq,
          };
          total_inserted += 1;
          await Model.assetForm()
            .insert(saveObjForUDISE)
            .onConflict([
              "asset_code",
              "state",
              "district",
              "activity_master_details_id",
            ])
            .merge();
 
          success_udise_array.push(record.udise);
        } else {
          failed_udise_array.push(record.udise);
        }
      }
 
      const del = await Model.knx()
        .from("udisetemp")
        .where("state", state)
        .where("district", district)
        .where("activity_master_detail_id", activityMasterDetailsId)
        .del();
 
      await Model.knx().raw(
        `update
        prb_ann_wrk_pln_bdgt_data d
      set
        physical_quantity = a.quantity
      from
        (
        select
          sum(quantity) as quantity,
          district ,
          activity_master_details_id
        from
          prb_ann_wrk_pln_bdgt_data_physical_asset a
        group by
          district ,
          activity_master_details_id
      ) a
      where
        d.district = a.district
        and d.activity_master_details_id = a.activity_master_details_id
        and d.district = ${district}
        and d.activity_master_details_id = ${activityMasterDetailsId}`
      );
 
      return Response.handle(req, res, "saveSchoolConfiguration", 200, {
        status: true,
        data: "Successsfully inserted",
        success_udise_list: success_udise_array,
        failed_udise_list: failed_udise_array,
      });
 
      */
    } else {
      if (Object.keys(amd).length > 0) {
        try {
          if (amd.scheme_id === "3") {
            let states_array = [];
            let districts_array = [];

            rows.forEach((r) => {
              states_array.push(r.state_id);
              districts_array.push(r.district_id);
            });

            states_array = [...new Set(states_array)];
            districts_array = [...new Set(districts_array)];

            let object = await Model.knx().transaction(async (trx) => {
              await trx(tableName)
                .where("state", "=", +state)
                .andWhere(
                  "activity_master_details_id",
                  "=",
                  activityMasterDetailsId
                )
                .andWhere("plan_year", apiYear)
                .del();

              // `update prb_ann_wrk_pln_bdgt_data d set physical_quantity = 0, financial_amount= 0, unit_cost = 0 where state = ${+state} and activity_master_details_id = ${activityMasterDetailsId}`
              await trx.raw(
                `update prb_ann_wrk_pln_bdgt_data d set physical_quantity = 0 where state = ${+state} and activity_master_details_id = ${activityMasterDetailsId} and plan_year = '${apiYear}'`
              );

              if (rows.length > 0) {
                await trx(tableName).insert(
                  rows.map((r) => ({
                    asset_code: r.udise_sch_code,
                    asset_type: 5,
                    state: r.state_id,
                    district: r.district_id,
                    activity_master_details_id: activityMasterDetailsId,
                    scheme_id: amd.scheme_id,
                    sub_component_id: amd.sub_component_id,
                    major_component_id: amd.major_component_id,
                    activity_master_id: amd.activity_master_id,
                    prb_ann_wrk_pln_bdgt_data_id: 0,
                    applicable_yn: 1,
                    block: 0,
                    quantity: r?.quantity || 1,
                    financial_quantity: +r?.financial_quantity,
                    plan_year: apiYear,
                  }))
                );
              }

              let totQty = 0;
              rows.forEach((r) => {
                totQty += +r?.quantity !== 0 ? +r.quantity : 1;
              });

              await trx.raw(
                `update prb_ann_wrk_pln_bdgt_data d set physical_quantity = a.quantity from ( 
                  select sum(quantity) as quantity, 
                    activity_master_details_id, 
                    state 
                  from prb_ann_wrk_pln_bdgt_data_physical_asset a 
                  where a.state = ${+state} and a.plan_year = '${apiYear}' 
                  group by state, activity_master_details_id ) a 
                  where d.state = a.state 
                  and d.plan_year = '${apiYear}'
                  and d.activity_master_details_id = a.activity_master_details_id 
                  and d.activity_master_details_id = ${activityMasterDetailsId}`
              );
            });

            return Response.handle(req, res, "saveSchoolConfiguration", 200, {
              status: true,
              data: object,
            });
          } else {
            const object = await Model.knx().transaction(async (trx) => {
              // `update prb_ann_wrk_pln_bdgt_data d set physical_quantity = 0, financial_amount= 0, unit_cost = 0 from ( select district, activity_master_details_id from prb_ann_wrk_pln_bdgt_data_physical_asset a group by district, activity_master_details_id ) a where d.district = a.district and d.activity_master_details_id = a.activity_master_details_id and d.district = ${district} and d.activity_master_details_id = ${activityMasterDetailsId}`
              await trx.raw(
                `update prb_ann_wrk_pln_bdgt_data d set physical_quantity = 0 from ( select district, activity_master_details_id from prb_ann_wrk_pln_bdgt_data_physical_asset a where a.plan_year = '${apiYear}' group by district, activity_master_details_id ) a where d.plan_year = '${apiYear}' and d.district = a.district and d.activity_master_details_id = a.activity_master_details_id and d.district = ${district} and d.activity_master_details_id = ${activityMasterDetailsId}`
              );

              await trx(tableName)
                .where("state", "=", state)
                .andWhere("district", "=", district)
                .andWhere(
                  "activity_master_details_id",
                  "=",
                  activityMasterDetailsId
                )
                .andWhere("plan_year", apiYear)
                .del();

              if (rows.length > 0) {
                await trx(tableName).insert(
                  rows.map((r) => ({
                    asset_code: r.udise_sch_code,
                    asset_type: 5,
                    state: state,
                    district: district,
                    activity_master_details_id: activityMasterDetailsId,
                    scheme_id: amd.scheme_id,
                    sub_component_id: amd.sub_component_id,
                    major_component_id: amd.major_component_id,
                    activity_master_id: amd.activity_master_id,
                    prb_ann_wrk_pln_bdgt_data_id: 0,
                    applicable_yn: 1,
                    block: 0,
                    quantity: r?.quantity || 1,
                    financial_quantity: +r?.financial_quantity,
                    plan_year: apiYear,
                  }))
                );
              }

              let totQty = 0;
              rows.forEach((r) => {
                totQty += +r?.quantity !== 0 ? +r.quantity : 1;
              });

              await trx.raw(
                `update prb_ann_wrk_pln_bdgt_data d set physical_quantity = a.quantity from (select sum(quantity) as quantity, district, activity_master_details_id from prb_ann_wrk_pln_bdgt_data_physical_asset a where a.plan_year = '${apiYear}' group by district, activity_master_details_id ) a where d.plan_year = '${apiYear}' and d.district = a.district and d.activity_master_details_id = a.activity_master_details_id and d.district = ${district} and d.activity_master_details_id = ${activityMasterDetailsId}`
              );
              await trx.raw(
                `update prb_ann_wrk_pln_bdgt_data d set financial_amount = (d.physical_quantity*d.unit_cost) where d.plan_year = '${apiYear}' and d.district = ${district} and d.activity_master_details_id = ${activityMasterDetailsId}`
              );
            });

            return Response.handle(req, res, "saveSchoolConfiguration", 200, {
              status: true,
              data: object,
            });
          }
        } catch (error) {
          console.error("Error performing delete and insert:", error);
          // responseFromApiLogger = await ApiLog.create(token, req.originalUrl, 'saveSchoolConfiguration', req.body, { status: true, data: { error: "Internal server error" } })
          // res
          //   .status(500)
          //   .json({ status: false, data: { error: "Internal server error" } });

          return Response.handle(req, res, "saveSchoolConfiguration", 500, {
            status: false,
            data: { error: "Internal server error" },
          });
        }
      } else {
        // responseFromApiLogger = await ApiLog.create(token, req.originalUrl, 'saveSchoolConfiguration', req.body, { status: true, data: { error: "Something went wrong" } })
        // res
        //   .status(200)
        //   .json({ status: true, data: { error: "Something went wrong" } });

        return Response.handle(req, res, "saveSchoolConfiguration", 200, {
          status: true,
          data: { error: "Something went wrong" },
        });
      }
    }
  } catch (e) {
    return Exception.handle(e, res, req, "saveSchoolConfiguration");
  }
};

exports.getSchoolConfiguration = async (req, res) => {
  try {
    const { district_id, state_id, amd } = req.body;
    const { activity_master_details_id } = amd;
    const apiYear = req.headers?.api_year;
    const apiVersion = req.headers?.api_version;
    if (amd !== 0 && activity_master_details_id !== 0) {
      const object = await Model.assetForm()
        .select("*")
        .where((builder) => {
          builder.where("plan_year", apiYear);
          if (state_id !== 0) {
            builder.andWhere("state", state_id);
          }
          if (+amd.component_type === 2) {
            if (activity_master_details_id !== 0) {
              builder.andWhere(
                "activity_master_details_id",
                activity_master_details_id
              );
            }
          } else {
            if (activity_master_details_id !== 0) {
              builder.andWhere(
                "activity_master_details_id",
                activity_master_details_id
              );
            }
            if (district_id !== 0 && district_id !== null) {
              builder.andWhere("district", district_id);
            }
          }
        });

      return Response.handle(req, res, "getSchoolConfiguration", 200, {
        status: true,
        data: object,
      });
    } else {
      return Response.handle(req, res, "getSchoolConfiguration", 200, {
        status: true,
        data: [],
      });
    }
  } catch (e) {
    return Exception.handle(e, res, req, "getSchoolConfiguration");
  }
};

exports.saveApprovedPlanDetails = async (req, res) => {
  try {
    const {
      state_id,
      district_id,
      user_id,
      user_role_id,
      plan_status_id,
      plan_session_id,
      plan_year,
      user_remarks,
    } = req.body;

    const object = await PlanStatusModel.create({
      state_id: state_id,
      district_id: district_id,
      user_id: user_id,
      user_role_id: user_role_id,
      plan_status_id: plan_status_id,
      plan_session_id: plan_session_id,
      plan_year: plan_year,
      user_remarks: user_remarks,
      createdby: user_id,
      modifiedby: user_id,
    });

    // responseFromApiLogger = await ApiLog.create(token, req.originalUrl, 'saveApprovedPlanDetails', req.body, { status: true, message: true });
    // res.status(200).json({ status: true, message: true });

    return Response.handle(req, res, "saveApprovedPlanDetails", 200, {
      status: true,
      message: true,
    });
  } catch (e) {
    return Exception.handle(e, res, req, "saveApprovedPlanDetails");
  }
};

exports.uploadFile = async (req, res) => {
  try {
    await Model.knx().raw(`delete from udisetemp`);
    const csvData = req.file.buffer.toString("utf-8");
    const insertPromises = [];

    const fileName = `${Date.now()}_${req.file.originalname}`;
    const filePath = path.join("public/file/uploads/", fileName);
    fs.writeFileSync(filePath, req.file.buffer);

    let records = await new Promise((resolve, reject) => {
      const results = [];
      const parser = csv({ columns: true });
      parser.on("data", (data) => results.push(data));
      parser.on("end", () => resolve(results));
      parser.on("error", (error) => reject(error));
      parser.write(csvData);
      parser.end();
    });

    // const udisecheck = await Model.knx()
    //   .raw(`select count(school_id) from prb_school_master
    // where udise_sch_code in(${records.map((v) => {
    //   return `'${v.UDISE.length == 10 ? "0" : ""}${v.UDISE}'`;
    // })}) `);

    // if (records.length == udisecheck.rows[0]["count"]) {
    const decryptObj = JSON.parse(Hash.decrypt(req.body.secure));

    const state = decryptObj.state_id;
    const district = decryptObj.district_id;
    const uploadFrom = decryptObj?.uploadFrom;

    /* udisetemp cleanup for activity_master_details_id in combination with state and district */
    await Model.udisetemp()
      .where("state", "=", state)
      .andWhere("district", "=", district)
      .andWhere(
        "activity_master_detail_id",
        "=",
        decryptObj.amd.activity_master_details_id
      )
      .del();

    function sanitizeKeys(obj) {
      const sanitizedObj = {};
      for (let key in obj) {
        const sanitizedKey = key.replace(/"/g, "").trim();
        sanitizedObj[sanitizedKey] = obj[key];
      }
      return sanitizedObj;
    }

    records = records.map(sanitizeKeys);

    for (const record of records) {
      if (record.UDISE !== null && record.UDISE !== undefined) {
        if (uploadFrom === "national") {
          insertPromises.push(
            Model.udisetemp().insert({
              udise: record.UDISE,
              values: Object.values(record)[2] ? +Object.values(record)[2] : 0,
              financial_quantity: Object.values(record)[3]
                ? +Object.values(record)[3]
                : 0,
              state: state,
              district: district,
              activity_master_detail_id:
                decryptObj.amd.activity_master_details_id,
            })
          );
        } else {
          insertPromises.push(
            Model.udisetemp().insert({
              udise: record.UDISE,
              values: Object.values(record)[5] ? +Object.values(record)[5] : 0,
              financial_quantity: Object.values(record)[6]
                ? +Object.values(record)[6]
                : 0,
              state: state,
              district: district,
              activity_master_detail_id:
                decryptObj.amd.activity_master_details_id,
            })
          );
        }
      }
    }
    insertPromises.push(
      Model.knx().raw(`delete from udisetemp u where u."values" = 'NaN'`)
    );

    /*     insertPromises.push(
      Model.knx().raw(
        `update udisetemp set udise = concat('0', udise)  where LENGTH(trim(udise)) = 10 `
      )
    ); */

    insertPromises.push(
      Model.knx().raw(
        `update udisetemp u set state = psm.state_id, district = psm.district_id from prb_school_master psm where psm.udise_sch_code = u.udise and state = '0'`
      )
    );

    await Promise.all(insertPromises);

    await Model.knx().raw(
      `update udisetemp set udise = concat('0', udise)  where LENGTH(trim(udise)) = 10 `
    );

    await Model.knx().raw(
      `update udisetemp u set state = psm.state_id, district = psm.district_id from prb_school_master psm where psm.udise_sch_code = u.udise and state = '0'`
    );

    res.status(200).json({
      success: true,
      status: 200,
      message: "CSV data inserted into udisetemp table",
    });
    // } else {
    //   res.status(200).json({
    //     success: false,
    //     status: 400,
    //     message: `${
    //       records.length - Number(udisecheck.rows[0]["count"])
    //     } UDISE code is not valid `,
    //   });
    // }
  } catch (e) {
    return Exception.handle(e, res, req, "");
  }
};

exports.getStatePlanStatusReport = async (req, res) => {
  try {
    const data = await Model.getStateReportStatus(req);

    // const token = ((req.headers.authorization).split(' '))[1];
    // let responseFromApiLogger = await ApiLog.create(token, req.originalUrl, 'getStatePlanStatusReport', req.body, { status: true, message: "success", data: data })
    // res.status(200).json({ status: true, message: "success", data: data });

    return Response.handle(req, res, "getStatePlanStatusReport", 200, {
      status: true,
      message: "success",
      data: data,
    });
  } catch (e) {
    return Exception.handle(e, res, req, "getStatePlanStatusReport");
  }
};

exports.getAllyears = async (req, res) => {
  try {
    const data = await Model.getAllYears(req.body);

    // const token = ((req.headers.authorization).split(' '))[1];
    // let responseFromApiLogger = await ApiLog.create(token, req.originalUrl, 'getAllyears', req.body, { status: true, message: "success", data: data })
    // res.status(200).json({ status: true, message: "success", data: data });

    return Response.handle(req, res, "getAllYears", 200, {
      status: true,
      message: "success",
      data: data,
    });
  } catch (e) {
    return Exception.handle(e, res, req, "getAllYears");
  }
};

exports.modifyNationalData = async (req, res) => {
  try {
    const {
      id,
      physical_quantity,
      financial_amount,
      uom,
      unit_cost,
      proposed_physical_quantity,
      proposed_financial_amount,
      proposed_unit_cost,
      state_id,
      district_id,
      coordinator_remarks,
    } = req.body;
    let object = null;
    const apiYear = req.headers?.api_year;
    const apiVersion = req.headers?.api_version;
    const updated_by = req.auth.user.id;

    object = await Model.stateBudget()
      .where("prb_state_ann_wrk_pln_bdgt_data_id", "=", id)
      // .andWhere("plan_year", apiYear)
      .update({
        proposed_physical_quantity: proposed_physical_quantity,
        proposed_financial_amount: proposed_financial_amount,
        proposed_unit_cost: proposed_unit_cost,
        plan_year: apiYear,
        coordinator_remarks: coordinator_remarks,
        updated_by,
      })
      .catch((error) => {
        console.error("Error inserting data:", error);
      });

    return Response.handle(req, res, "modifyNationalData", 200, {
      status: true,
      data: object,
    });
  } catch (e) {
    return Exception.handle(e, res, req, "modifyNationalData");
  }
};

exports.cleanPlanData = async (req, res) => {
  try {
    const { user_role_id, state_id, district_id } = req.body;

    if (+user_role_id == 4 || +user_role_id == 8) {
      const planConfigurator = await Model.knx()
        .select("ppc.*")
        .from("prb_plan_configurator as ppc")
        .where((builder) => {
          builder.where(1, "=", 1);
          if (+state_id !== 0) {
            builder.andWhere("ppc.state", state_id);
          }
          if (+district_id !== 0) {
            builder.andWhere("ppc.district", district_id);
          }
        });

      const planBudgetData = await Model.knx()
        .select("pawpbd.*")
        .from("prb_ann_wrk_pln_bdgt_data as pawpbd")
        .where((builder) => {
          builder.where(1, "=", 1);
          if (+state_id !== 0) {
            builder.andWhere("pawpbd.state", state_id);
          }
          if (+district_id !== 0) {
            builder.andWhere("pawpbd.district", district_id);
          }
        });

      const planPhysicalAssetsData = await Model.knx()
        .select("pawpbd.*")
        .from("prb_ann_wrk_pln_bdgt_data_physical_asset as pawpbdpa")
        .where((builder) => {
          builder.where(1, "=", 1);
          if (+state_id !== 0) {
            builder.andWhere("pawpbdpa.state", state_id);
          }
          if (+district_id !== 0) {
            builder.andWhere("pawpbdpa.district", district_id);
          }
        });

      let deletePlanConfiguration = await Model.knx()
        .delete()
        .from("prb_plan_configurator as ppc")
        .where((builder) => {
          builder.where(1, "=", 1);
          if (+state_id !== 0) {
            builder.andWhere("ppc.state", state_id);
          }
          if (+district_id !== 0) {
            builder.andWhere("ppc.district", district_id);
          }
        });

      let deletePlanBudgetData = await Model.knx()
        .delete()
        .from("prb_ann_wrk_pln_bdgt_data as pawpbd")
        .where((builder) => {
          builder.where(1, "=", 1);
          if (+state_id !== 0) {
            builder.andWhere("pawpbd.state", state_id);
          }
          if (+district_id !== 0) {
            builder.andWhere("pawpbd.district", district_id);
          }
        });

      let deletePlanPhysicalAssetsData = await Model.knx()
        .delete()
        .from("prb_ann_wrk_pln_bdgt_data_physical_asset as pawpbdpa")
        .where((builder) => {
          builder.where(1, "=", 1);
          if (+state_id !== 0) {
            builder.andWhere("pawpbdpa.state", state_id);
          }
          if (+district_id !== 0) {
            builder.andWhere("pawpbdpa.district", district_id);
          }
        });

      return Response.handle(req, res, "cleanPlanData", 200, {
        status: true,
        data: {
          plan_config_data: planConfigurator,
          plan_work_budget_data: planBudgetData,
          plan_physical_assets_data: planPhysicalAssetsData,
        },
        message: "Data deleted successfully.",
      });
    } else {
      return Response.handle(req, res, "cleanPlanData", 200, {
        status: true,
        message: "Failed to delete. Make sure you have correct permissions.",
      });
    }
  } catch (e) {
    return Exception.handle(e, res, req, "cleanPlanData");
  }
};

exports.getDynamicDistrictData = async (req, res) => {
  try {
    const { state_id } = req.body;

    let result = await exports.getDynamicDistrictDataFn(req, state_id);

    return Response.handle(req, res, "getDynamicDistrictData", 200, {
      status: true,
      message: true,
      data: result,
    });
  } catch (e) {
    return Exception.handle(e, res, req, "getDynamicDistrictData");
  }
};

exports.getDynamicDistrictDataFn = async (req, state_id) => {
  // let columnsData = await Model.knx()
  //   .raw(`select STRING_AGG('MAX(CASE WHEN district = ' || district_id ||
  //                                         ' THEN financial_amount END) AS "' || district_name || '_financial_amount" ' ,', ')
  //                                         from master_districts md where md.district_state_id = ${state_id};`);
  const year = req?.headers?.api_year || "2024-2025";
  let result = await Model.knx().raw(`select 
  ps.title  as scheme_name, pmc.title as  major_component_name , psc.title as  sub_component_name , pam.title as activity_master_name , pd.activity_master_details_name ,
   physical_quantity,unit_cost::numeric(20,5), financial_amount::numeric(20,5),
    case when (aa.activity_master_id is null ) then 888888 else aa.activity_master_id end activity_master_id,
    case when (aa.sub_component_id is null ) then 777777 else aa.sub_component_id end sub_component_id,
    case when (aa.major_component_id is null ) then 666666 else aa.major_component_id end major_component_id,
    case when (aa.scheme_id is null ) then '555555' else aa.scheme_id end scheme_id,
    case when (aa.activity_master_details_id is null ) then 999999 else aa.activity_master_details_id end activity_master_details_id 
   
     from (
    SELECT  CAST(SUM(pawpbd.financial_amount) AS numeric(16, 5)) AS financial_amount,
        sum(pawpbd.physical_quantity) AS physical_quantity,
        (sum(pawpbd.financial_amount)/ nullif(sum(pawpbd.physical_quantity),0))::numeric(20,5) as unit_cost ,
        pawpbd.scheme_id,
        pawpbd.major_component_id,
        pawpbd.sub_component_id,
        pawpbd.activity_master_id,
        pawpbd.activity_master_details_id
       FROM prb_ann_wrk_pln_bdgt_data pawpbd
      WHERE pawpbd.state = ${state_id}  and pawpbd.plan_year= '${year}'
      GROUP BY GROUPING SETS ((pawpbd.scheme_id, pawpbd.major_component_id, pawpbd.sub_component_id, pawpbd.activity_master_id, pawpbd.activity_master_details_id), (pawpbd.scheme_id, pawpbd.major_component_id, pawpbd.sub_component_id, pawpbd.activity_master_id), (pawpbd.scheme_id, pawpbd.major_component_id, pawpbd.sub_component_id), (pawpbd.scheme_id, pawpbd.major_component_id), (pawpbd.scheme_id), ())
    ) 
    aa 
     left join prb_data pd on (pd.id= aa.activity_master_details_id)
     left join prb_activity_master pam on (pam.id= aa.activity_master_id)
     left join prb_sub_component psc on (psc.sub_component_id= aa.sub_component_id)
     left join prb_major_component pmc   on (pmc.prb_major_component_id = aa.major_component_id)
     left join prb_schemes ps on (ps.id= aa.scheme_id::numeric)
     order by aa.scheme_id , aa.major_component_id , aa.sub_component_id , aa.activity_master_id ,aa.activity_master_details_id`);

  return result;
};

exports.nationalCoordinatorFormAcitivityList = async (req, res) => {
  const {
    user: { id, user_role_id },
    state_id,
  } = req.body;

  const activity_group_code =
    req.body.activity_group_code === "null" ||
    req.body.activity_group_code === null ||
    req.body.activity_group_code === undefined
      ? null
      : `'${req.body.activity_group_code}'`;

  const apiYear = req?.headers?.api_year || "2024-2025";

  let countQuery = `
  FROM prb_state_ann_wrk_pln_bdgt_data pawpbds
  JOIN prb_data pds ON pds.id = pawpbds.activity_master_details_id
  WHERE
      pds.id = pawpbds.activity_master_details_id
      AND pawpbds.state = '${state_id}' 
      AND pawpbds.activity_master_id = aa.activity_master_id
      AND pawpbds.plan_year = '${apiYear}'
       AND `;

  let subQuery = `(case 
      when (SELECT count(pawpbds.prb_state_ann_wrk_pln_bdgt_data_id) ${countQuery} pawpbds.state_submission_status != 6) > 0 then 0
      when (SELECT COUNT(pawpbds.prb_state_ann_wrk_pln_bdgt_data_id) ${countQuery} pawpbds.status < 3) > 0 then 1
      when (SELECT COUNT(pawpbds.prb_state_ann_wrk_pln_bdgt_data_id) ${countQuery} pawpbds.status = 3) > 0 then 2
      when (SELECT COUNT(pawpbds.prb_state_ann_wrk_pln_bdgt_data_id) ${countQuery} pawpbds.status = 4) > 0 then 3
      when (SELECT COUNT(pawpbds.prb_state_ann_wrk_pln_bdgt_data_id) ${countQuery} pawpbds.status = 5) > 0 then 4      
      when (SELECT COUNT(pawpbds.prb_state_ann_wrk_pln_bdgt_data_id) ${countQuery} pawpbds.status = 6) > 0 then 5              
      Else 1 end) as activitiStatus`;

  try {
    if (+user_role_id === 2 || +user_role_id === 3) {
      const data = await Model.knx().raw(
        `select aa.status as  activitistatus, aa.status,  vam.* from ( select min(status) as status, activity_master_id, plan_year, state from prb_state_ann_wrk_pln_bdgt_data psawpbd where state = ${state_id} and plan_year = '${apiYear}' and psawpbd.physical_quantity > 0 group by activity_master_id, plan_year, state) aa left join view_activity_master vam on (aa.activity_master_id = vam.activity_master_id ) order by scheme_id ,major_component_name ,sub_component_name ,activity_master_name`
      );
      const status_for_action = await Model.knx().raw(
        `select min(status) as action_status from prb_ann_wrk_pln_bdgt_data pawpbd where state = ${state_id} and plan_year = '${apiYear}'`
      );

      return Response.handle(
        req,
        res,
        "schMajorCompSubCompActivityFilter",
        200,
        {
          status: true,
          data: data,
          status_for_action: status_for_action.rows[0].action_status ?? 0,
        }
      );
    } else {
      const data = await Model.knx().raw(
        `select aa.status as  activitistatus, aa.status,  vam.* from ( select min(status) as status, activity_master_id, plan_year, state 
        from prb_state_ann_wrk_pln_bdgt_data psawpbd 
        where state = ${state_id} and plan_year = '${apiYear}' and psawpbd.physical_quantity > 0 
        and psawpbd.activity_master_details_id in (select activity_master_details_id from fetch_activity_master_details(${activity_group_code}))
        group by activity_master_id, plan_year, state) aa left join view_activity_master vam on (aa.activity_master_id = vam.activity_master_id ) 
        order by scheme_id ,major_component_name ,sub_component_name ,activity_master_name`
      );

      // prb_data.id in (select activity_master_details_id from fetch_activity_master_details(${activity_group_code}))
      // activity_master_details_id in (select activity_master_details_id from fetch_activity_master_details(${activity_group_code})

      const status_for_action = await Model.knx().raw(
        `select min(status) as action_status from prb_ann_wrk_pln_bdgt_data pawpbd where state = ${state_id} and plan_year = '${apiYear}'`
      );

      return Response.handle(
        req,
        res,
        "schMajorCompSubCompActivityFilter",
        200,
        {
          status: true,
          data: data,
          status_for_action: status_for_action.rows[0].action_status ?? 0,
        }
      );
    }
  } catch (e) {
    return Exception.handle(e, res, req, "schMajorCompSubCompActivityFilter");
  }
};

// exports.getInterventionsList = async (req, res) => {
//   const { state_specfic } = req.body;
//   if (state_specfic === 1) {
//     const data = await Model.knx()
//       .select(
//         "pd.id",
//         "pd.scheme_name",
//         "pd.major_component_name",
//         "pd.sub_component_name",
//         "pd.activity_master_name",
//         "pd.activity_master_details_name",
//         "ms.state_name",
//         "ms.state_id",
//         Model.knx().raw(
//           "CASE WHEN pd.recuring_nonrecuring = 1 THEN ? WHEN pd.recuring_nonrecuring = 2 THEN ? END AS recuring_nonrecuring",
//           ["Recurring", "Non Recurring"]
//         ),
//         Model.knx().raw(
//           "CASE WHEN pd.component_type = 2 THEN ? WHEN component_type = 3 THEN ? END AS component_type",
//           ["State", "District"]
//         )
//       )
//       .from("prb_data as pd")
//       .join(
//         "prb_data_state",
//         "prb_data_state.activity_master_detail_id",
//         "pd.id"
//       )
//       .join("master_states as ms", "ms.state_id", "prb_data_state.state_id")
//       .where("pd.state_specfic_yn", 1)
//       .orderBy("pd.id", "desc");

//     return Response.handle(req, res, "interventionslist", 200, {
//       status: true,
//       data: data,
//     });
//   } else {
//     const data = await Model.knx()
//       .select(
//         "pd.id",
//         "pd.scheme_name",
//         "pd.major_component_name",
//         "pd.sub_component_name",
//         "pd.activity_master_name",
//         "pd.activity_master_details_name",
//         Model.knx().raw("'' as state_name"),
//         Model.knx().raw("'' as state_id"),
//         Model.knx().raw(
//           "CASE WHEN pd.recuring_nonrecuring = 1 THEN 'Recurring' WHEN pd.recuring_nonrecuring = 2 THEN 'Non Recurring' END as recuring_nonrecuring"
//         ),
//         Model.knx().raw(
//           "CASE WHEN pd.component_type = 2 THEN 'State' WHEN pd.component_type = 3 THEN 'District' END as component_type"
//         )
//       )
//       .from("prb_data as pd")
//       .orderBy("pd.id", "desc");

//     return Response.handle(req, res, "interventionslist", 200, {
//       status: true,
//       data: data,
//     });
//   }
// };

exports.getInterventionsList = async (req, res) => {
  const { state_specfic } = req.body;
  if (state_specfic === 1) {
    const data = await Model.knx().raw(`select  
    pd.id,
    pd.scheme_name,
    pd.major_component_name,
    pd.sub_component_name,
    pd.activity_master_name,
    pd.activity_master_details_name ,
    CASE WHEN pd.recuring_nonrecuring = 1 THEN 'Recurring' WHEN pd.recuring_nonrecuring = 2 THEN 'Non Recurring' END AS recuring_nonrecuring,
    CASE WHEN pd.component_type = 2 THEN 'State' WHEN component_type = 3 THEN 'District' END AS component_type,
    ms.state_name ,
    ms.state_id
    from prb_data pd , prb_data_state pds , master_states ms 
    where pds.activity_master_detail_id = pd.id 
    and  state_specfic_yn = '1'
    and ms.state_id = pds.state_id`);

    return Response.handle(req, res, "interventionslist", 200, {
      status: true,
      data: data.rows,
    });
  } else {
    const data = await Model.knx().raw(`select  
    pd.id,
    pd.scheme_name,
    pd.major_component_name,
    pd.sub_component_name,
    pd.activity_master_name,
    pd.activity_master_details_name ,
    CASE WHEN pd.recuring_nonrecuring = 1 THEN 'Recurring' WHEN pd.recuring_nonrecuring = 2 THEN 'Non Recurring' END AS recuring_nonrecuring,
    CASE WHEN pd.component_type = 2 THEN 'State' WHEN component_type = 3 THEN 'District' END AS component_type,
    ms.state_name ,
    ms.state_id
    from prb_data pd , prb_data_state pds , master_states ms 
    where pds.activity_master_detail_id = pd.id 
    and  state_specfic_yn = '1'
    and ms.state_id = pds.state_id 
    union
    select  
    pd.id,
    pd.scheme_name,
    pd.major_component_name,
    pd.sub_component_name,
    pd.activity_master_name,
    pd.activity_master_details_name ,
    CASE WHEN pd.recuring_nonrecuring = 1 THEN 'Recurring' WHEN pd.recuring_nonrecuring = 2 THEN 'Non Recurring' END AS recuring_nonrecuring,
    CASE WHEN pd.component_type = 2 THEN 'State' WHEN component_type = 3 THEN 'District' END AS component_type,
    'National' state_name, 
    null as  state_id
    from prb_data pd 
    where state_specfic_yn = '0'
    order by
    scheme_name,
    major_component_name,
    sub_component_name,
    activity_master_name,
    activity_master_details_name `);

    return Response.handle(req, res, "interventionslist", 200, {
      status: true,
      data: data.rows,
    });
  }
};

exports.saveNewIntervention = async (req, res) => {
  const payloadData = req.body.data;
  const apiYear = req.headers?.api_year;
  const apiVersion = req.headers?.api_version;
  const created_by = req.auth.user.id;
  const getData = (key) => payloadData.filter((p) => p.key === key);
  const getLastObj = await Model.knx()
    .select("id")
    .from("prb_data")
    .orderBy("id", "desc")
    .limit(1);
  const newID = +getLastObj[0]?.id + 1 || 0;

  if (newID > 0) {
    let schoolColumns = {};
    if (getData("school")[0]?.value == 1) {
      schoolColumns = {
        dd_national: 1,
        dd_state: 1,
        dd_district: 1,
        dd_block: 1,
        dd_school: 1,
      };
    }
    const insertObj = await Model.query()
      .insert({
        id: newID,
        scheme_id: getData("scheme_id")[0]?.value,
        scheme_name: getData("scheme_name")[0]?.value,
        major_component_id: getData("major_component_id")[0]?.value,
        major_component_name: getData("major_component_name")[0]?.value,
        sub_component_id: getData("sub_component_id")[0]?.value,
        sub_component_name: getData("sub_component_name")[0]?.value,
        activity_master_id: getData("activity_master_id")[0]?.value,
        activity_master_name: getData("activity_master_name")[0]?.value,
        activity_master_details_name: getData("activity_master_details_name")[0]
          ?.value,
        component_type: getData("component_type")[0]?.value || 0,
        recuring_nonrecuring: getData("recuring_nonrecuring")[0]?.value || 0,
        year_code: apiYear,
        state_specfic_yn: getData("state_specfic_yn")[0].value || 0,
        ...schoolColumns,
      })
      .then(() => {
        if (+getData("state_specfic_yn")[0].value === 1) {
          getData("states_list")[0].value.forEach((f) => {
            Model.queryState()
              .insert({
                activity_master_detail_id: newID,
                state_id: f.value,
                created_by,
              })
              .then(() => {})
              .catch((error) => {
                console.error("Error inserting data in sate table:", error);
              });
          });
        }
      })
      .catch((error) => {
        console.error("Error inserting data in prb data data:", error);
      });

    return Response.handle(req, res, "interventionslist", 200, {
      status: true,
      data: insertObj,
    });
  } else {
    return Response.handle(req, res, "interventionslist", 200, {
      status: false,
      data: [],
    });
  }
};

exports.stateTentativeProposedDetails = async (req, res) => {
  const id = req.params.id;
  const apiYear = req?.headers?.api_year;

  const data = await Model.knx().raw(
    `select
    (plan_total*100/tentative_total_estimates)::numeric(16,2)  plan_diff,*
  from
    (
    select
    CAST(SUM(financial_amount) AS numeric(16, 5)) plan_total ,
      state
    from
      prb_ann_wrk_pln_bdgt_data pawpbd
    where
      plan_year = '${apiYear}'
      and state = '${id}'
    group by
      state) aa
  left join master_states_tentative_proposed pr on
    (aa.state = pr.state_id )`
  );

  return Response.handle(req, res, "stateTentativeProposedDetails", 200, {
    status: false,
    data: data.rows[0],
  });
};

exports.notification = async (req, res) => {
  const { user_role_id, user_state_id, user_district_id } = req.body.data;
  const { type, notification_info } = req.body;

  if (type === "get") {
    const data = await Model.knx().raw(
      `select * from notification where status = 0 and type = 'GLOBAL'`
    );
    return Response.handle(req, res, "notification", 200, {
      status: false,
      data: data.rows || [],
    });
  } else if (type === "read") {
    const updateQry = await Model.knx().raw(
      `select * from notification where status = 0`
    );
    return Response.handle(req, res, "notification", 200, {
      status: false,
      data: true,
    });
  }
};

exports.getStateCostSheetData = async (req, res) => {
  try {
    const { state_id } = req.body;

    let result = await Model.knx().raw(`select 
      financial_amount,physical_quantity,
      case when (aa.activity_master_id is null ) then 888888 else aa.activity_master_id end activity_master_id,
      case when (aa.sub_component_id is null ) then 777777 else aa.sub_component_id end sub_component_id,
      case when (aa.major_component_id is null ) then 666666 else aa.major_component_id end major_component_id,
      case when (aa.scheme_id is null ) then '555555' else aa.scheme_id end scheme_id,
      case when (aa.activity_master_details_id is null ) then 999999 else aa.activity_master_details_id end activity_master_details_id ,
      ps.title  as scheme_name, pmc.title as  major_component_name , psc.title as  sub_component_name , pam.title as activity_master_name , pd.activity_master_details_name 
       from (
      SELECT sum(pawpbd.financial_amount) AS financial_amount,
          sum(pawpbd.physical_quantity) AS physical_quantity,
          sum(pawpbd.financial_amount)/ nullif(sum(pawpbd.physical_quantity),0) as unit_cost ,
          pawpbd.scheme_id,
          pawpbd.major_component_id,
          pawpbd.sub_component_id,
          pawpbd.activity_master_id,
          pawpbd.activity_master_details_id
         FROM prb_ann_wrk_pln_bdgt_data pawpbd
        WHERE pawpbd.state = ${state_id}
        GROUP BY GROUPING SETS ((pawpbd.scheme_id, pawpbd.major_component_id, pawpbd.sub_component_id, pawpbd.activity_master_id, pawpbd.activity_master_details_id), (pawpbd.scheme_id, pawpbd.major_component_id, pawpbd.sub_component_id, pawpbd.activity_master_id), (pawpbd.scheme_id, pawpbd.major_component_id, pawpbd.sub_component_id), (pawpbd.scheme_id, pawpbd.major_component_id), (pawpbd.scheme_id), ())
      ) 
      aa 
       left join prb_data pd on (pd.id= aa.activity_master_details_id)
       left join prb_activity_master pam on (pam.id= aa.activity_master_id)
       left join prb_sub_component psc on (psc.sub_component_id= aa.sub_component_id)
       left join prb_major_component pmc   on (pmc.prb_major_component_id = aa.major_component_id)
       left join prb_schemes ps on (ps.id= aa.scheme_id::numeric)
       order by aa.scheme_id , aa.major_component_id , aa.sub_component_id , aa.activity_master_id ,aa.activity_master_details_id`);

    return Response.handle(req, res, "getStateCostSheetData", 200, {
      status: true,
      message: true,
      data: [],
    });
  } catch (e) {
    return Exception.handle(e, res, req, "getStateCostSheetData");
  }
};

exports.getPptData = async (req, res) => {
  try {
    const { state_id } = req.body;

    let result = await Model.knx()
      .raw(`select ROW_NUMBER() OVER (ORDER BY qc.group_name, state) AS serial_number, 
                                              qc.group_name , 
                                              Round(sum(p.financial_amount),5) as state_demand , 
                                              sum(p.proposed_financial_amount) as proposed
    from  prb_state_ann_wrk_pln_bdgt_data p , bibek.qpptreport_csv qc  
    where qc.activity_master_detail_id = p.activity_master_details_id 
    and p.plan_year ='2024-2025'
    and state in (${state_id})
    group by qc.group_name ,state`);

    return Response.handle(req, res, "getPptData", 200, {
      status: true,
      message: true,
      data: result,
    });
  } catch (e) {
    return Exception.handle(e, res, req, "getPptData");
  }
};

exports.stateBdgtDataPhysicalAssetSchoolList = async (req, res) => {
  const {
    type,
    assetList,
    state,
    activityDetailData: { activity_master_details_id, activity_master_id },
  } = req.body;
  const apiYear = req.headers?.api_year;
  const apiVersion = req.headers?.api_version;
  const updated_by = req.auth.user.id;
  const updated_at = DTime.create().format("Y-m-d H:M:S");

  if (type === "list") {
    const data = await Model.knx()
      .select(
        "psawpbdpa.asset_code",
        "psm.school_name",
        "psawpbdpa.plan_year",
        "psawpbdpa.status"
      )
      .from("prb_state_ann_wrk_pln_bdgt_data_physical_asset as psawpbdpa")
      .innerJoin(
        "prb_school_master as psm",
        "psm.udise_sch_code",
        "=",
        "psawpbdpa.asset_code"
      )
      .where({
        "psawpbdpa.state": state,
        "psawpbdpa.plan_year": apiYear,
        "psawpbdpa.activity_master_id": activity_master_id,
        "psawpbdpa.activity_master_details_id": activity_master_details_id,
      });
    return Response.handle(req, res, "interventionslist", 200, {
      status: false,
      data: data || [],
    });
  } else if (type === "update") {
    const result = await Model.stateAssetForm()
      .where({
        state: state,
        plan_year: apiYear,
        activity_master_id: activity_master_id,
        activity_master_details_id: activity_master_details_id,
      })
      .whereIn("asset_code", assetList)
      .update({ status: 1, updated_by, updated_at });

    return Response.handle(req, res, "interventionslist", 200, {
      status: false,
      data: result,
    });
  }
};
exports.submitStatePlan_StateCostingSheet = async (req, res) => {
  try {
    const { state_id } = req.body;
    const apiYear = req?.headers?.api_year;

    let result = await Model.knx().raw(`select 
    ps.title  as scheme_name, pmc.title as  major_component_name , psc.title as  sub_component_name , pam.title as activity_master_name , pd.activity_master_details_name ,
      physical_quantity,unit_cost,financial_amount,
      case when (aa.activity_master_id is null ) then 888888 else aa.activity_master_id end activity_master_id,
      case when (aa.sub_component_id is null ) then 777777 else aa.sub_component_id end sub_component_id,
      case when (aa.major_component_id is null ) then 666666 else aa.major_component_id end major_component_id,
      case when (aa.scheme_id is null ) then '555555' else aa.scheme_id end scheme_id,
      case when (aa.activity_master_details_id is null ) then 999999 else aa.activity_master_details_id end activity_master_details_id 
     
       from (
      SELECT CAST(SUM(pawpbd.financial_amount) AS numeric(16, 5)) AS financial_amount,
          sum(pawpbd.physical_quantity) AS physical_quantity,
          (sum(pawpbd.financial_amount)/ nullif(sum(pawpbd.physical_quantity),0))::numeric(20,5) as unit_cost ,
          pawpbd.scheme_id,
          pawpbd.major_component_id,
          pawpbd.sub_component_id,
          pawpbd.activity_master_id,
          pawpbd.activity_master_details_id
         FROM prb_ann_wrk_pln_bdgt_data pawpbd
        WHERE pawpbd.state = ${state_id}
        and pawpbd.plan_year = '${apiYear}'
        GROUP BY GROUPING SETS ((pawpbd.scheme_id, pawpbd.major_component_id, pawpbd.sub_component_id, pawpbd.activity_master_id, pawpbd.activity_master_details_id), (pawpbd.scheme_id, pawpbd.major_component_id, pawpbd.sub_component_id, pawpbd.activity_master_id), (pawpbd.scheme_id, pawpbd.major_component_id, pawpbd.sub_component_id), (pawpbd.scheme_id, pawpbd.major_component_id), (pawpbd.scheme_id), ())
      ) 
      aa 
       left join prb_data pd on (pd.id= aa.activity_master_details_id)
       left join prb_activity_master pam on (pam.id= aa.activity_master_id)
       left join prb_sub_component psc on (psc.sub_component_id= aa.sub_component_id)
       left join prb_major_component pmc   on (pmc.prb_major_component_id = aa.major_component_id)
       left join prb_schemes ps on (ps.id= aa.scheme_id::numeric)
       order by aa.scheme_id , aa.major_component_id , aa.sub_component_id , aa.activity_master_id ,aa.activity_master_details_id`);
    return Response.handle(req, res, "submitStatePlan_StateCostingSheet", 200, {
      status: true,
      message: true,
      data: result,
    });
  } catch (e) {
    return Exception.handle(e, res, req, "submitStatePlan_StateCostingSheet");
  }
};
exports.submitStatePlan_StateCostingSheetPageNumber = async (req, res) => {
  try {
    const { state_id } = req.body;
    const apiYear = req?.headers?.api_year;

    let result = await Model.knx()
      .raw(`select bb.*, au.user_name||' (' ||au.user_mobile || ')' as consultant_details from 
    (select * from (
    select  pd.scheme_name ,pd.major_component_name, pd.sub_component_name , pd.activity_master_name , pd.activity_master_details_name  , psawpbd.*
    from prb_state_ann_wrk_pln_bdgt_data psawpbd,  prb_data pd
    where pd.id = psawpbd.activity_master_details_id 
    and psawpbd.state = ${state_id}
    and psawpbd.plan_year = '${apiYear}'
    ) aa left join view_consultant_mapping vcm 
     on aa.activity_master_id = vcm.activity_id::numeric 
     where state_id = '${state_id}' and role_code = 3
    ) bb left join admin_users au 
    on bb.user_id = au.id`);
    return Response.handle(
      req,
      res,
      "submitStatePlan_StateCostingSheetPageNumber",
      200,
      {
        status: true,
        message: true,
        data: result,
      }
    );
  } catch (e) {
    return Exception.handle(
      e,
      res,
      req,
      "submitStatePlan_StateCostingSheetPageNumber"
    );
  }
};

exports.updateSubmitStatePlan_StateCostingSheetPageNumber = async (
  req,
  res
) => {
  const { prb_state_ann_wrk_pln_bdgt_data_id, page_number } = req.body;
  const updated_by = req.auth.user.id;
  let result = await Model.knx().raw(`select * 
  from prb_state_ann_wrk_pln_bdgt_data psawpbd,  prb_data pd
  where pd.id = psawpbd.activity_master_details_id and psawpbd.prb_state_ann_wrk_pln_bdgt_data_id=${prb_state_ann_wrk_pln_bdgt_data_id} `);
  if (result?.rows[0]) {
    try {
      const object = await Model.knx().raw(
        `UPDATE prb_state_ann_wrk_pln_bdgt_data SET page_number = '${page_number}', updated_by= ${updated_by} WHERE prb_state_ann_wrk_pln_bdgt_data_id = ${prb_state_ann_wrk_pln_bdgt_data_id} `
      );
      return Response.handle(
        req,
        res,
        "updatesubmitStatePlan_StateCostingSheetPageNumber",
        200,
        {
          status: true,
          message: "Page Updated Successfully",
        }
      );
    } catch (e) {
      return Exception.handle(
        e,
        res,
        req,
        "submitStatePlan_StateCostingSheetPageNumber"
      );
    }
  } else {
    return Response.handle(
      req,
      res,
      "updatesubmitStatePlan_StateCostingSheetPageNumber",
      400,
      {
        status: false,
        message: "No Record Found",
      }
    );
  }
};

exports.submitDistrictPlan = async (req, res) => {
  try {
    const { state_id, district_id } = req.body;
    const apiYear = req?.headers?.api_year;
    // CAST(SUM(pawpbd.financial_amount) AS double precision) AS financial_amount,
    // sum(pawpbd.physical_quantity) AS physical_quantity,
    // (sum(pawpbd.financial_amount) / nullif(sum(pawpbd.physical_quantity), 0))::double precision as unit_cost,

    let result = await Model.knx().raw(`select 
    ps.title  as scheme_name, pmc.title as  major_component_name , psc.title as  sub_component_name , pam.title as activity_master_name , pd.activity_master_details_name ,
    physical_quantity,unit_cost,financial_amount, aa.status,
      case when (aa.activity_master_id is null ) then 888888 else aa.activity_master_id end activity_master_id,
      case when (aa.sub_component_id is null ) then 777777 else aa.sub_component_id end sub_component_id,
      case when (aa.major_component_id is null ) then 666666 else aa.major_component_id end major_component_id,
      case when (aa.scheme_id is null ) then '555555' else aa.scheme_id end scheme_id,
      case when (aa.activity_master_details_id is null ) then 999999 else aa.activity_master_details_id end activity_master_details_id 
     
       from (
      SELECT CAST(SUM(pawpbd.financial_amount) AS numeric(16, 5)) AS financial_amount,
          sum(pawpbd.physical_quantity) AS physical_quantity,
          (sum(pawpbd.financial_amount)/ nullif(sum(pawpbd.physical_quantity),0))::numeric(20,5) as unit_cost ,
          max(status)as status ,
          pawpbd.scheme_id,
          pawpbd.major_component_id,
          pawpbd.sub_component_id,
          pawpbd.activity_master_id,
          pawpbd.activity_master_details_id
         FROM prb_ann_wrk_pln_bdgt_data pawpbd
        WHERE pawpbd.state = ${state_id}
        and pawpbd.district = ${district_id}
        and pawpbd.plan_year = '${apiYear}'
        GROUP BY GROUPING SETS ((pawpbd.scheme_id, pawpbd.major_component_id, pawpbd.sub_component_id, pawpbd.activity_master_id, pawpbd.activity_master_details_id), (pawpbd.scheme_id, pawpbd.major_component_id, pawpbd.sub_component_id, pawpbd.activity_master_id), (pawpbd.scheme_id, pawpbd.major_component_id, pawpbd.sub_component_id), (pawpbd.scheme_id, pawpbd.major_component_id), (pawpbd.scheme_id), ())
      ) 
      aa 
       left join prb_data pd on (pd.id= aa.activity_master_details_id)
       left join prb_activity_master pam on (pam.id= aa.activity_master_id)
       left join prb_sub_component psc on (psc.sub_component_id= aa.sub_component_id)
       left join prb_major_component pmc   on (pmc.prb_major_component_id = aa.major_component_id)
       left join prb_schemes ps on (ps.id= aa.scheme_id::numeric)
       order by aa.scheme_id , aa.major_component_id , aa.sub_component_id , aa.activity_master_id ,aa.activity_master_details_id`);
    return Response.handle(req, res, "submitStatePlan_StateCostingSheet", 200, {
      status: true,
      message: true,
      data: result,
    });
  } catch (e) {
    return Exception.handle(e, res, req, "submitStatePlan_StateCostingSheet");
  }
};

exports.nationalCoordinatorSchoolListCSV = async (req, res) => {
  try {
    const { s, d, activityObj, mode } = req.body;
    const apiYear = req?.headers?.api_year;
    const fileName = activityObj.activity_master_details_name;
    const finalFilename = fileName.replace(/[^\w\-\.]/g, "_");

    const object = await Model.knx()
      .select(
        "psm.udise_sch_code",
        "psm.school_name",
        "pawpbdpa.quantity",
        "pawpbdpa.financial_quantity"
      )
      .from(
        `${
          mode === "DD"
            ? "prb_state_ann_wrk_pln_bdgt_data_physical_asset"
            : "prb_ann_wrk_pln_bdgt_data_physical_asset"
        } as pawpbdpa`
      )
      .join(
        "prb_school_master as psm",
        "pawpbdpa.asset_code",
        "=",
        "psm.udise_sch_code"
      )
      .where("psm.state_id", s)
      .andWhere(
        "pawpbdpa.activity_master_details_id",
        activityObj.activity_master_details_id
      )
      .andWhere("pawpbdpa.plan_year", apiYear);

    const data = object.map((o, idx) => {
      const commonColumns = {
        column1: o.udise_sch_code,
        column2: o.school_name,
        column3: o.quantity,
      };

      if (+activityObj.finance_yn === 1) {
        return {
          ...commonColumns,
          column4: o.financial_quantity,
        };
      } else {
        return commonColumns;
      }
    });

    const csvFilePath = `public/file/uploads/${finalFilename}.csv`;
    const csvWriter = createObjectCsvWriter({
      path: csvFilePath,
      header: [
        { id: "column1", title: "UDISE" },
        { id: "column2", title: "SCHOOL NAME" },
        { id: "column3", title: "PHYSICAL QUANTITY" },
        ...(+activityObj.finance_yn === 1
          ? [{ id: "column4", title: "FINANCIAL QUANTITY" }]
          : []),
      ],
    });
    await csvWriter.writeRecords(data).then(() => {
      if (finalFilename) {
        res.setHeader(
          "Content-Disposition",
          `attachment; filename=schooldata.csv`
        );
        res
          .status(200)
          .download(
            csvFilePath,
            `public/file/uploads/schooldata.csv`,
            (err) => {
              if (err) {
                console.error(err);
                res.status(500).send("Internal Server Error");
              } else {
                fs.unlinkSync(csvFilePath);
              }
            }
          );
      } else {
        res
          .status(500)
          .send("Internal Server Error: finalFilename is undefined");
      }
    });
  } catch (e) {
    return Exception.handle(e, res, req, "nationalCoordinatorSchoolListCSV");
  }
};

exports.statevieweditformCSV = async (req, res) => {
  try {
    const {
      state_id,
      district_id,
      scheme_id,
      major_component_id,
      sub_component_id,
      activity_master_details_id,
      activity_master_id,
      activityObj,
      mode,
    } = req.body;
    const apiYear = req?.headers?.api_year;
    const fileName = activityObj.activity_master_details_name;
    const finalFilename = fileName.replace(/[^\w\-\.]/g, "_");
    // const object = await Model.knx().raw(`
    //                                       select
    //                                         pawpbdpa.asset_code,
    //                                         psm.school_name,
    //                                       pawpbd.physical_quantity,
    //                                         pawpbd.financial_amount,
    //                                       pawpbd.unit_cost
    //                                       from
    //                                         prb_ann_wrk_pln_bdgt_data_physical_asset pawpbdpa
    //                                       inner join prb_school_master psm
    //                                       on psm.udise_sch_code = pawpbdpa.asset_code
    //                                       inner join prb_ann_wrk_pln_bdgt_data pawpbd
    //                                       on pawpbd.id =
    //                                       pawpbdpa.prb_ann_wrk_pln_bdgt_data_physical_asset_id
    //                                       where
    //                                             pawpbdpa.scheme_id = '${scheme_id}'
    //                                             and pawpbdpa.major_component_id = '${major_component_id}'
    //                                             and pawpbdpa.sub_component_id = '${sub_component_id}'
    //                                             and pawpbdpa.activity_master_id = '${activity_master_id}'
    //                                             and pawpbdpa.activity_master_details_id = '${activity_master_details_id}'
    //                                             and pawpbdpa.state = '${state_id}'
    //                                             and pawpbdpa.plan_year = '${apiYear}'`)

    const object = await Model.knx().raw(`select distinct
      pawpbdpa.asset_code,
      psm.school_name,
      pawpbdpa.quantity physical_quantity,
      pawpbdpa.quantity*pawpbd.unit_cost as financial_amount,
      pawpbd.unit_cost
    from
      prb_ann_wrk_pln_bdgt_data_physical_asset pawpbdpa
      inner join prb_school_master psm on psm.udise_sch_code = pawpbdpa.asset_code
      left join prb_ann_wrk_pln_bdgt_data pawpbd on pawpbd.activity_master_details_id = pawpbdpa.activity_master_details_id and pawpbd.district = 1812
    where
      (pawpbdpa.plan_year = '${apiYear}'
        and pawpbdpa.state = '${state_id}'
        and pawpbdpa.activity_master_details_id = '${activity_master_details_id}'
        and pawpbdpa.district = ${district_id})`);

    const data =
      object &&
      object?.rows?.map((o, idx) => {
        const commonColumns = {
          column1: o.asset_code,
          column2: o.school_name,
          column3: o.physical_quantity,
          column4: o.financial_amount,
          column5: o.unit_cost,
        };

        if (+activityObj.finance_yn === 1) {
          return {
            ...commonColumns,
            column4: o.financial_quantity,
          };
        } else {
          return commonColumns;
        }
      });

    const csvFilePath = `public/file/uploads/${finalFilename}.csv`;
    const csvWriter = createObjectCsvWriter({
      path: csvFilePath,
      header: [
        { id: "column1", title: "ASSET CODE" },
        { id: "column2", title: "SCHOOL NAME" },
        { id: "column3", title: "PHYSICAL QUANTITY" },
        { id: "column4", title: "FINANCIAL AMOUNT" },
        { id: "column5", title: "UNIT COST" },
        // ...(+activityObj.finance_yn === 1
        //   ? [{ id: "column4", title: "FINANCIAL QUANTITY" }]
        //   : []),
      ],
    });
    await csvWriter.writeRecords(data).then(() => {
      if (finalFilename) {
        res.setHeader(
          "Content-Disposition",
          `attachment; filename=schooldata.csv`
        );
        res
          .status(200)
          .download(
            csvFilePath,
            `public/file/uploads/schooldata.csv`,
            (err) => {
              if (err) {
                console.error(err);
                res.status(500).send("Internal Server Error");
              } else {
                fs.unlinkSync(csvFilePath);
              }
            }
          );
      } else {
        res
          .status(500)
          .send("Internal Server Error: finalFilename is undefined");
      }
    });
  } catch (e) {
    return Exception.handle(e, res, req, "nationalCoordinatorSchoolListCSV");
  }
};

exports.saveNationalSchoolConfiguration = async (req, res) => {
  try {
    const { district_id, state_id, data, process, pg } = req.body;
    const { rows, amd } = data;
    const tableName = "prb_state_ann_wrk_pln_bdgt_data_physical_asset";
    let finance_yn = +amd.finance_yn;
    let state = state_id;
    let district = district_id;
    const activityMasterDetailsId = amd?.activity_master_details_id;
    const apiYear = req.headers?.api_year;
    const apiVersion = req.headers?.api_version;
    const updated_by = req.auth.user.id;

    let total_inserted = 0;
    let failed_udise_array = [];
    let success_udise_array = [];

    await Model.knx().transaction(async (trx) => {
      await Model.knx()
        .from("prb_state_ann_wrk_pln_bdgt_data_physical_asset")
        .where("state", state)
        .andWhere("activity_master_details_id", activityMasterDetailsId)
        .andWhere("plan_year", apiYear)
        .del();

      await Model.knx().raw(
        `insert
      into
      public.prb_state_ann_wrk_pln_bdgt_data_physical_asset  (asset_code,
      asset_type,
      state,
      district,
      activity_master_details_id,
      scheme_id,
      sub_component_id,
      major_component_id,
      activity_master_id,
      quantity,
      financial_quantity,
      plan_year,
      prb_state_ann_wrk_pln_bdgt_data_physical_asset_id, created_by)
    select u.udise, '5', u.state::numeric , u.district::numeric, u.activity_master_detail_id::numeric, pd.scheme_id::numeric , pd.sub_component_id::numeric , pd.major_component_id , pd.activity_master_id, u."values"::numeric , u.financial_quantity::numeric , '${apiYear}', nextval('prb_state_ann_wrk_pln_bdgt_da_prb_state_ann_wrk_pln_bdgt_d_seq1'::regclass),  ${updated_by} from udisetemp u, prb_data pd where u.activity_master_detail_id::numeric = pd.id and u.state = '${state}' and u.activity_master_detail_id = '${activityMasterDetailsId}'`
      );

      if (finance_yn === 1) {
        await Model.knx().raw(
          `update prb_state_ann_wrk_pln_bdgt_data psawpbd set updated_by=${updated_by}, proposed_physical_quantity = aa.quantity, proposed_financial_amount = aa.financial_quantity, proposed_unit_cost =  aa.unit_cost from ( select sum(psawpdpa.quantity) as quantity, sum(financial_quantity) as financial_quantity, sum(financial_quantity) /nullif ( sum(psawpdpa.quantity),0) as unit_cost, state, activity_master_details_id from public.prb_state_ann_wrk_pln_bdgt_data_physical_asset psawpdpa where activity_master_details_id = ${activityMasterDetailsId} and state = ${state} and plan_year = '${apiYear}' group by state, activity_master_details_id ) aa where psawpbd.state = aa.state and psawpbd.activity_master_details_id = aa.activity_master_details_id and psawpbd.state = ${state} and psawpbd.activity_master_details_id = ${activityMasterDetailsId} and plan_year = '${apiYear}'`
        );
      } else {
        await Model.knx().raw(
          `update prb_state_ann_wrk_pln_bdgt_data psawpbd set updated_by=${updated_by}, proposed_physical_quantity = aa.quantity from ( select sum(psawpdpa.quantity) as quantity, sum(financial_quantity) as financial_quantity, state, activity_master_details_id from public.prb_state_ann_wrk_pln_bdgt_data_physical_asset psawpdpa where activity_master_details_id = ${activityMasterDetailsId} and state = ${state} and plan_year = '${apiYear}' group by state, activity_master_details_id ) aa where psawpbd.state = aa.state and psawpbd.activity_master_details_id = aa.activity_master_details_id and psawpbd.state = ${state} and psawpbd.activity_master_details_id = ${activityMasterDetailsId} and plan_year = '${apiYear}'`
        );
      }

      await Model.knx().raw(`
      WITH records_count AS ( SELECT 	coalesce (sum(quantity),0)  AS no_of_record FROM public.prb_state_ann_wrk_pln_bdgt_data_physical_asset psawpdpa WHERE activity_master_details_id = ${activityMasterDetailsId} AND state = ${state} AND plan_year = '${apiYear}' ) UPDATE prb_state_ann_wrk_pln_bdgt_data psawpbd SET updated_by=${updated_by}, proposed_physical_quantity = CASE WHEN (SELECT no_of_record FROM records_count) = 0 THEN 0 ELSE psawpbd.proposed_physical_quantity END, proposed_financial_amount = CASE  WHEN (SELECT no_of_record FROM records_count) = 0 THEN 0 ELSE psawpbd.proposed_financial_amount END, proposed_unit_cost = CASE  WHEN (SELECT no_of_record FROM records_count) = 0 THEN 0 ELSE psawpbd.proposed_unit_cost end where activity_master_details_id = ${activityMasterDetailsId} AND state = ${state} AND plan_year = '${apiYear}'`);

      await Model.knx().raw(
        `update prb_state_ann_wrk_pln_bdgt_data psawpbd set updated_by=${updated_by}, proposed_financial_amount =  proposed_physical_quantity * proposed_unit_cost where  psawpbd.state = ${state} and psawpbd.activity_master_details_id = ${activityMasterDetailsId} and plan_year = '${apiYear}'`
      );

      await trx
        .from("udisetemp")
        .where("state", state)
        .where("activity_master_detail_id", activityMasterDetailsId)
        .del();
    });

    return Response.handle(req, res, "saveSchoolConfiguration", 200, {
      status: true,
      data: "Successfully inserted national school configuration",
    });
  } catch (e) {
    return Exception.handle(e, res, req, "saveSchoolConfiguration");
  }
};

exports.updateInterventionStatus = async (req, res) => {
  try {
    const { prb_state_ann_wrk_pln_bdgt_data_id, mode, user, remarks } =
      req.body;
    const user_role_id = user?.user_role_id;
    const updated_by = req.auth.user.id;
    let updateFields = {
      status: 1,
      created_at: new Date(),
      created_by: user.id,
      updated_by,
    };

    if (user_role_id === 3 && mode === "A") {
      updateFields.status = 3;
      updateFields.eligible_for_allocation = 0;
    }

    if (user_role_id === 2 && mode === "A") {
      updateFields.status = 4;
      updateFields.eligible_for_allocation = 0;
    }

    if (user_role_id === 2 && mode === "R") {
      updateFields.status = 1;
      updateFields.eligible_for_allocation = 0;
    }

    if (user_role_id === 15 && mode === "A") {
      updateFields.status = 5;
      updateFields.eligible_for_allocation = 1;
    }

    //if (user_role_id === 3) updateFields.coordinator_remarks = remarks;

    await Model.stateBudget()
      .where({ prb_state_ann_wrk_pln_bdgt_data_id })
      .update(updateFields);

    return Response.handle(req, res, "updateInterventionStatus", 200, {
      status: true,
      data: "Status updated successfully",
    });
  } catch (e) {
    return Exception.handle(e, res, req, "saveSchoolConfiguration");
  }
};

exports.getExpenditureReport = async (req, res) => {
  try {
    const { state_id } = req.body;

    const object = await Model.knx().raw(`select 
    ps.title  as scheme_name, pmc.title as  major_component_name , psc.title as  sub_component_name , pam.title as activity_master_name , pd.activity_master_details_name ,
     budget_quantity,budget_amount, progress_quantity, progress_amount,
      case when (aa.activity_master_id is null ) then 888888 else aa.activity_master_id end activity_master_id,
      case when (aa.sub_component_id is null ) then 777777 else aa.sub_component_id end sub_component_id,
      case when (aa.major_component_id is null ) then 666666 else aa.major_component_id end major_component_id,
      case when (aa.scheme_id is null ) then '555555' else aa.scheme_id end scheme_id,
      case when (aa.activity_master_details_id is null ) then 999999 else aa.activity_master_details_id end activity_master_details_id 
       from (
      SELECT sum(pawpbpp.budget_quantity) AS budget_quantity,
          CAST(SUM(pawpbpp.budget_amount) AS numeric(16, 5)) AS budget_amount,
          sum(pawpbpp.progress_quantity) AS progress_quantity,
          CAST(SUM(pawpbpp.progress_amount) AS numeric(16, 5)) AS progress_amount,
          pawpbpp.scheme_id,
          pawpbpp.major_component_id,
          pawpbpp.sub_component_id,
          pawpbpp.activity_master_id,
          pawpbpp.activity_master_details_id
         FROM prb_ann_wrk_pln_bdgt_prev_progress pawpbpp  
        WHERE pawpbpp.state = ${state_id}
        and (budget_quantity+ budget_amount + progress_quantity +progress_amount > 0 )
        GROUP BY GROUPING SETS ((pawpbpp.scheme_id, pawpbpp.major_component_id, pawpbpp.sub_component_id, pawpbpp.activity_master_id, pawpbpp.activity_master_details_id), (pawpbpp.scheme_id, pawpbpp.major_component_id, pawpbpp.sub_component_id, pawpbpp.activity_master_id), (pawpbpp.scheme_id, pawpbpp.major_component_id, pawpbpp.sub_component_id), (pawpbpp.scheme_id, pawpbpp.major_component_id), (pawpbpp.scheme_id), ())
      ) 
      aa 
       left join prb_data pd on (pd.id= aa.activity_master_details_id)
       left join prb_activity_master pam on (pam.id= aa.activity_master_id)
       left join prb_sub_component psc on (psc.sub_component_id= aa.sub_component_id)
       left join prb_major_component pmc   on (pmc.prb_major_component_id = aa.major_component_id)
       left join prb_schemes ps on (ps.id= aa.scheme_id::numeric)
       order by aa.scheme_id , aa.major_component_id , aa.sub_component_id , aa.activity_master_id ,aa.activity_master_details_id
    `);

    return Response.handle(req, res, "getExpenditureReport", 200, {
      status: true,
      data: object?.rows || [],
    });

    return object && object.rows ? object.rows : [];
  } catch (e) {
    return Exception.handle(e, res, req, "getExpenditureReport");
  }
};

exports.stateCostingSheetReport = async (req, res) => {
  try {
    const year = req?.headers?.api_year || "2024-2025";
    const { state_id } = req.body;

    let object = await Model.knx().raw(`select 
    ps.title  as scheme_name, pmc.title as  major_component_name , psc.title as  sub_component_name , pam.title as activity_master_name , pd.activity_master_details_name ,
     physical_quantity,unit_cost, financial_amount,
      case when (aa.activity_master_id is null ) then 888888 else aa.activity_master_id end activity_master_id,
      case when (aa.sub_component_id is null ) then 777777 else aa.sub_component_id end sub_component_id,
      case when (aa.major_component_id is null ) then 666666 else aa.major_component_id end major_component_id,
      case when (aa.scheme_id is null ) then '555555' else aa.scheme_id end scheme_id,
      case when (aa.activity_master_details_id is null ) then 999999 else aa.activity_master_details_id end activity_master_details_id 
     
       from (
      SELECT  CAST(SUM(pawpbd.financial_amount) AS numeric(16, 5)) AS financial_amount,
          sum(pawpbd.physical_quantity) AS physical_quantity,
          (sum(pawpbd.financial_amount)/ nullif(sum(pawpbd.physical_quantity),0))::numeric(20,5) as unit_cost ,
          pawpbd.scheme_id,
          pawpbd.major_component_id,
          pawpbd.sub_component_id,
          pawpbd.activity_master_id,
          pawpbd.activity_master_details_id
         FROM prb_ann_wrk_pln_bdgt_data pawpbd
        WHERE pawpbd.state = ${state_id}  and pawpbd.plan_year= '${year}' 
        and (coalesce (financial_amount,0) + coalesce (physical_quantity,0)) > 0
        GROUP BY GROUPING SETS ((pawpbd.scheme_id, pawpbd.major_component_id, pawpbd.sub_component_id, pawpbd.activity_master_id, pawpbd.activity_master_details_id), (pawpbd.scheme_id, pawpbd.major_component_id, pawpbd.sub_component_id, pawpbd.activity_master_id), (pawpbd.scheme_id, pawpbd.major_component_id, pawpbd.sub_component_id), (pawpbd.scheme_id, pawpbd.major_component_id), (pawpbd.scheme_id), ())
      ) 
      aa 
       left join prb_data pd on (pd.id= aa.activity_master_details_id)
       left join prb_activity_master pam on (pam.id= aa.activity_master_id)
       left join prb_sub_component psc on (psc.sub_component_id= aa.sub_component_id)
       left join prb_major_component pmc   on (pmc.prb_major_component_id = aa.major_component_id)
       left join prb_schemes ps on (ps.id= aa.scheme_id::numeric)
       order by aa.scheme_id , aa.major_component_id , aa.sub_component_id , aa.activity_master_id ,aa.activity_master_details_id`);

    return Response.handle(req, res, "stateCostingSheetReport", 200, {
      status: true,
      message: true,
      data: object,
    });
  } catch (e) {
    return Exception.handle(e, res, req, "stateCostingSheetReport");
  }
};

exports.stateCostingProposedSheetReport = async (req, res) => {
  try {
    const year = req?.headers?.api_year || "2024-2025";
    const { state_id } = req.body;

    let object = await Model.knx().raw(`select 
    ps.title  as scheme_name, pmc.title as  major_component_name , psc.title as  sub_component_name , pam.title as activity_master_name , pd.activity_master_details_name ,
    physical_quantity,unit_cost, financial_amount,
    proposed_physical_quantity, proposed_unit_cost, proposed_financial_amount,coordinator_remarks,
    case when (aa.activity_master_id is null ) then 888888 else aa.activity_master_id end activity_master_id,
    case when (aa.sub_component_id is null ) then 777777 else aa.sub_component_id end sub_component_id,
    case when (aa.major_component_id is null ) then 666666 else aa.major_component_id end major_component_id,
    case when (aa.scheme_id is null ) then '555555' else aa.scheme_id end scheme_id,
    case when (aa.activity_master_details_id is null ) then 999999 else aa.activity_master_details_id end activity_master_details_id 
     from (
    SELECT  
        CAST(SUM(pawpbd.financial_amount) AS numeric(16, 5)) AS financial_amount,
        sum(pawpbd.physical_quantity) AS physical_quantity,
        (sum(pawpbd.financial_amount)/ nullif(sum(pawpbd.physical_quantity),0))::numeric(20,5) as unit_cost ,
        CAST(SUM(pawpbd.proposed_financial_amount) AS numeric(16, 5)) AS proposed_financial_amount,
        sum(pawpbd.proposed_physical_quantity) AS proposed_physical_quantity,
        (sum(pawpbd.proposed_financial_amount)/ nullif(sum(pawpbd.proposed_physical_quantity),0))::numeric(20,5) as proposed_unit_cost ,
        max(coordinator_remarks)as coordinator_remarks,
        pawpbd.scheme_id,
        pawpbd.major_component_id,
        pawpbd.sub_component_id,
        pawpbd.activity_master_id,
        pawpbd.activity_master_details_id
       FROM prb_state_ann_wrk_pln_bdgt_data pawpbd
       WHERE pawpbd.state = ${state_id}  and pawpbd.plan_year= '${year}' and (physical_quantity+ financial_amount) > 0
      GROUP BY GROUPING SETS ((pawpbd.scheme_id, pawpbd.major_component_id, pawpbd.sub_component_id, pawpbd.activity_master_id, pawpbd.activity_master_details_id), (pawpbd.scheme_id, pawpbd.major_component_id, pawpbd.sub_component_id, pawpbd.activity_master_id), (pawpbd.scheme_id, pawpbd.major_component_id, pawpbd.sub_component_id), (pawpbd.scheme_id, pawpbd.major_component_id), (pawpbd.scheme_id), ())
    ) 
    aa 
     left join prb_data pd on (pd.id= aa.activity_master_details_id)
     left join prb_activity_master pam on (pam.id= aa.activity_master_id)
     left join prb_sub_component psc on (psc.sub_component_id= aa.sub_component_id)
     left join prb_major_component pmc   on (pmc.prb_major_component_id = aa.major_component_id)
     left join prb_schemes ps on (ps.id= aa.scheme_id::numeric)
     order by aa.scheme_id , aa.major_component_id , aa.sub_component_id , aa.activity_master_id ,aa.activity_master_details_id`);

    return Response.handle(req, res, "stateCostingProposedSheetReport", 200, {
      status: true,
      message: true,
      data: object,
    });
  } catch (e) {
    return Exception.handle(e, res, req, "stateCostingProposedSheetReport");
  }
};

exports.interventionDetails = async (req, res) => {
  try {
    const { id, mode, states } = req.body;
    const created_by = req.auth.user.id;
    if (mode === "get_information") {
      const prbData = await Model.knx().raw(
        `select pd.* from prb_data pd where pd.id = ${id}`
      );

      const prbDataState = await Model.knx().raw(
        `select pds.*, ms.state_id as value, ms.state_name as label from prb_data_state pds inner join master_states ms on ms.state_id = pds.state_id where pds.activity_master_detail_id  = ${id}`
      );

      return Response.handle(req, res, "interventionDetails", 200, {
        status: true,
        message: true,
        data: {
          activity_details: prbData.rows[0],
          states: prbDataState.rows,
        },
      });
    } else if (mode === "update_state") {
      if (states.length > 0) {
        const activity_master_detail_id = states[0].activity_master_detail_id;
        if (activity_master_detail_id && activity_master_detail_id !== 0) {
          states.forEach((s) => {
            console.log(s);
            if (!s.hasOwnProperty("activity_master_detail_id")) {
              Model.queryState()
                .insert({
                  activity_master_detail_id: activity_master_detail_id,
                  state_id: s.value,
                  created_by,
                })
                .then(() => {});
            }
          });
          /* Model.queryState()
            .where({ activity_master_detail_id: activity_master_detail_id })
            .delete()
            .then(() => {
              states.forEach((s) => {
                Model.queryState()
                  .insert({
                    activity_master_detail_id: activity_master_detail_id,
                    state_id: s.value,
                  })
                  .then(() => {});
              });
            }); */
        }
      }
      return Response.handle(req, res, "interventionDetails", 200, {
        status: true,
        message: true,
      });
    }
  } catch (e) {
    return Exception.handle(e, res, req, "interventionDetails");
  }
};

exports.additionalStateProposalFilter = async (req, res) => {
  try {
    const {
      get,
      state_id,
      scheme_id,
      major_component_id,
      sub_component_id,
      activity_master_id,
      activity_master_detail_id,
      pawpbd_id,
      physical_quantity,
      unit_cost,
      financial_amount,
      user,
    } = req.body;

    const created_by = user?.id || 0;

    const apiYear = req?.headers?.api_year || "2024-2025";

    if (get === "schemes") {
      const data = await Model.knx().raw(
        `select pawpbd.scheme_id as id, pd.scheme_name as name from prb_ann_wrk_pln_bdgt_data pawpbd inner join prb_data pd on pd.scheme_id::numeric = pawpbd.scheme_id::numeric where pawpbd.state = '${state_id}' and pawpbd.plan_year = '${apiYear}' group by pawpbd.scheme_id, pd.scheme_name`
      );
      return Response.handle(req, res, "additionalStateProposalFilter", 200, {
        status: true,
        data: data?.rows || 0,
      });
    } else if (get === "major_component") {
      const data = await Model.knx().raw(
        `select pawpbd.major_component_id  as id, pd.major_component_name  as name from prb_ann_wrk_pln_bdgt_data pawpbd inner join prb_data pd  on pd.major_component_id::numeric = pawpbd.major_component_id::numeric where pawpbd.state = '${state_id}' and pawpbd.plan_year = '${apiYear}' and pawpbd.scheme_id  = '${scheme_id}' group by pawpbd.major_component_id, pd.major_component_name`
      );
      return Response.handle(req, res, "additionalStateProposalFilter", 200, {
        status: true,
        data: data?.rows || 0,
      });
    } else if (get === "sub_component") {
      const data = await Model.knx().raw(
        `select pawpbd.sub_component_id  as id, pd.sub_component_name  as name from prb_ann_wrk_pln_bdgt_data pawpbd inner join prb_data pd on pd.sub_component_id::numeric = pawpbd.sub_component_id::numeric where pawpbd.state = '${state_id}' and pawpbd.plan_year = '${apiYear}' and pawpbd.scheme_id  = '${scheme_id}' and pawpbd.major_component_id = '${major_component_id}' group by pawpbd.sub_component_id, pd.sub_component_name`
      );
      return Response.handle(req, res, "additionalStateProposalFilter", 200, {
        status: true,
        data: data?.rows || 0,
      });
    } else if (get === "activity") {
      const data = await Model.knx().raw(
        `select pawpbd.activity_master_id as id, pd.activity_master_name as name from prb_ann_wrk_pln_bdgt_data pawpbd inner join prb_data pd on pd.activity_master_id::numeric = pawpbd.activity_master_id::numeric where pawpbd.state = '${state_id}' and pawpbd.plan_year = '${apiYear}' and pawpbd.scheme_id  = '${scheme_id}' and pawpbd.major_component_id = '${major_component_id}' and pawpbd.sub_component_id = '${sub_component_id}' group by pawpbd.activity_master_id, pd.activity_master_name`
      );
      return Response.handle(req, res, "additionalStateProposalFilter", 200, {
        status: true,
        data: data?.rows || 0,
      });
    } else if (get === "activity_details") {
      const data = await Model.knx().raw(
        `select * from ( select activity_master_details_id, pd.activity_master_details_name as name , max(pawpbd.id ) as id , sum(pawpbd.financial_amount+pawpbd.physical_quantity) as totalsum from prb_ann_wrk_pln_bdgt_data pawpbd , prb_data pd  where  plan_year = '${apiYear}' and pawpbd.activity_master_id = '${activity_master_id}' and state = '${state_id}' and pd.id = pawpbd.activity_master_details_id  group by activity_master_details_id , activity_master_details_name )  aa  where aa.totalsum = 0`
      );
      return Response.handle(req, res, "additionalStateProposalFilter", 200, {
        status: true,
        data: data?.rows || 0,
      });
    } else if (get === "saved_budget_data") {
      const data = await Model.knx().raw(
        `select physical_quantity, unit_cost, financial_amount from prb_ann_wrk_pln_bdgt_data where id = '${pawpbd_id}'`
      );

      return Response.handle(req, res, "additionalStateProposalFilter", 200, {
        status: true,
        data: data?.rows || 0,
      });
    } else if (get === "update_budget_data") {
      const update = await Model.form()
        .where({ id: pawpbd_id })
        .andWhere({ plan_year: apiYear })
        .update({
          physical_quantity: physical_quantity,
          unit_cost: unit_cost,
          financial_amount: financial_amount,
          status: 6,
        })
        .then(() => {});

      const stateQry = await Model.knx().raw(`insert
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
        ${created_by} as created_by
      from
        view_state_cosolidated_plan
      where
        plan_year = '${apiYear}'
        and state = ${state_id}
        and activity_master_details_id in ( select activity_master_details_id from prb_ann_wrk_pln_bdgt_data where id = ${pawpbd_id})
        on
        conflict (state, activity_master_details_id, scheme_id, plan_year) do
      update
      set
        physical_quantity = excluded.physical_quantity,
        financial_amount = excluded.financial_amount,
        unit_cost = excluded.unit_cost,
        state_submission_status = excluded.state_submission_status,
        updated_by= ${created_by}`);

      return Response.handle(req, res, "additionalStateProposalFilter", 200, {
        status: true,
        data: `${pawpbd_id} updated successfully`,
      });
    }

    return Response.handle(req, res, "additionalStateProposalFilter", 200, {
      status: true,
      message: true,
    });
  } catch (e) {
    return Exception.handle(e, res, req, "additionalStateProposalFilter");
  }
};

exports.freezeSpillOverData = async (req, res) => {
  try {
    const { state_id } = req.body;

    let object = await Model.knx().raw(
      `update prb_ann_wrk_pln_bdgt_spill_over set status = 2 where state = ${state_id}`
    );

    return Response.handle(req, res, "freezeSpillOverData", 200, {
      status: true,
      data: object,
      message: "Data froze successfully.",
    });
  } catch (e) {
    return Exception.handle(e, res, req, "freezeSpillOverData");
  }
};

exports.freezeExpenditureData = async (req, res) => {
  try {
    const { state_id } = req.body;

    let object = await Model.knx().raw(
      `update prb_ann_wrk_pln_bdgt_prev_progress set status = 2 where state = ${state_id}`
    );

    return Response.handle(req, res, "freezeExpenditureData", 200, {
      status: true,
      data: object,
      message: "Data froze successfully.",
    });
  } catch (e) {
    return Exception.handle(e, res, req, "freezeExpenditureData");
  }
};

exports.expenditureActivityMasterList = async (req, res) => {
  try {
    const { schemeid, major_component_id, sub_component_id, state_id } =
      req.body;
    const apiYear = req?.headers?.api_year;

    const object = await Model.knx().raw(
      `select
      *
    from
      prb_activity_master pam
    where
      1 = 1
      and scheme_id = '${schemeid}'
      and major_component_id = '${major_component_id}'
      and sub_component_id = '${sub_component_id}'
      and pam.id in (
      select
        pawpbpp.activity_master_id
      from
        prb_ann_wrk_pln_bdgt_prev_progress pawpbpp
      where
        pawpbpp.state = '${state_id}'
    )`
    );

    return Response.handle(req, res, "activemasterdetaillist", 200, {
      status: true,
      data: object.rows,
    });
  } catch (e) {
    return Exception.handle(e, res, req, "activemasterdetaillist");
  }
};

exports.expenditureActivityMasterListDetails = async (req, res) => {
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
      `select
      *
    from
      prb_data pd
    where
      scheme_id = '${schemeid}'
      and major_component_id = '${major_component_id}'
      and sub_component_id = '${sub_component_id}'
      and activity_master_id = ${activity_master_id}
      and pd.id in (
      select
        distinct activity_master_details_id
      from
        prb_ann_wrk_pln_bdgt_prev_progress   pawpbd
      where
        state = ${state_id}
        and activity_master_id = ${activity_master_id})
    order by
      activity_master_details_name asc`
    );

    return Response.handle(req, res, "activemasterdetaillist", 200, {
      status: true,
      data: object.rows,
    });
  } catch (e) {
    return Exception.handle(e, res, req, "activemasterdetaillist");
  }
};

exports.allocationList = async (req, res) => {
  try {
    const { state_id, activity_master_details_id } = req.body;
    const apiYear = req?.headers?.api_year;

    const approved = await Model.knx().raw(
      `select proposed_physical_quantity , proposed_financial_amount, coalesce (eligible_for_allocation,0) as eligible_for_allocation from prb_state_ann_wrk_pln_bdgt_data psawpbd where psawpbd.activity_master_details_id = ${activity_master_details_id} and state = ${state_id} and plan_year ='${apiYear}'`
    );

    const object = await Model.knx().raw(
      `select pawpbdad.*, md.district_name from allocation.prb_ann_wrk_pln_bdgt_data_allocation_district pawpbdad inner join allocation.view_state_district_combined md  on (md.district_id = pawpbdad.district_id and md.district_state_id =  pawpbdad.state_id) where state_id = ${state_id} and plan_year = '${apiYear}' and activity_master_details_id = ${activity_master_details_id} order by pawpbdad.district_id`
    );

    const totalData = calculateTotalQtyAndAmt(object.rows);

    return Response.handle(req, res, "allocationList", 200, {
      status: true,
      data: { approved: approved.rows, data: object.rows, total: totalData },
      message: "Data froze successfully.",
    });
  } catch (e) {
    return Exception.handle(e, res, req, "allocationList");
  }
};

const calculateTotalQtyAndAmt = (data) => {
  let totalAMT = 0;
  let totalQTY = 0;
  data.forEach((entry) => {
    const quantity = parseFloat(entry.proposed_physical_quantity);
    const amount = parseFloat(entry.proposed_financial_amount);
    if (!isNaN(quantity) && !isNaN(amount)) {
      totalAMT += quantity;
      totalQTY += amount;
    }
  });
  return { amount: totalAMT, quantity: totalQTY };
};

exports.insertAllocationListForState = async (req, res) => {
  try {
    const { state_id } = req.body;
    const apiYear = req?.headers?.api_year;

    /*     let object = await Model.knx().raw(
      `select * from allocation.prb_ann_wrk_pln_bdgt_data_allocation where state = ${state_id} and plan_year = '${apiYear}'`
    ); */

    let object = null;

    return Response.handle(req, res, "allocationList", 200, {
      status: true,
      data: object.rows,
      message: "Data froze successfully.",
    });
  } catch (e) {
    return Exception.handle(e, res, req, "allocationList");
  }
};

exports.updateAllocationListForState = async (req, res) => {
  try {
    const { state_id, allocationList } = req.body;
    const apiYear = req?.headers?.api_year;

    const object = await Model.knx().transaction(async (trx) => {
      for (let i = 0; i < allocationList.length; i++) {
        let allocated_physical_quantity =
          allocationList[i]["allocated_physical_quantity"] || 0;
        let allocated_financial_amount =
          allocationList[i]["allocated_financial_amount"] || 0;
        await trx.raw(
          `update allocation.prb_ann_wrk_pln_bdgt_data_allocation_district pawbda set allocated_physical_quantity=${allocated_physical_quantity}, allocated_financial_amount=${allocated_financial_amount}, status = 1  
            where state_id=${state_id} and plan_year='${apiYear}' and prb_ann_wrk_pln_bdgt_data_allocation_district_id=${allocationList[i]["prb_ann_wrk_pln_bdgt_data_allocation_district_id"]}`
        );
      }
    });

    return Response.handle(req, res, "updateAllocationListForState", 200, {
      status: true,
      data: object,
      message: "Data Saved Successfully.",
    });
  } catch (e) {
    return Exception.handle(e, res, req, "updateAllocationListForState");
  }
};

exports.activityMasterDetailListByActiviId = async (req, res) => {
  try {
    const { id, recurring_type, state_id } = req.body;
    let andWhere = "";
    if (recurring_type && recurring_type != "0") {
      andWhere = `and recuring_nonrecuring=${recurring_type}`;
    }
    // let object = await Model.knx().raw(`select distinct id as activity_master_detail_id, activity_master_details_name from prb_data pd
    //     join prb_state_ann_wrk_pln_bdgt_data psawpbd on pd.id = psawpbd.activity_master_details_id
    //   where pd.activity_master_id =${id} ${andWhere} and state=${state_id}`);

    let object = await Model.knx().raw(`select distinct 
    id as activity_master_detail_id, 
    activity_master_details_name, 
    count(distinct pawpbda.prb_ann_wrk_pln_bdgt_data_allocation_id), 
    sum(distinct pawpbda.allocated_financial_amount) 
    from prb_data pd 
    join prb_state_ann_wrk_pln_bdgt_data psawpbd on 
    pd.id = psawpbd.activity_master_details_id 
    left join allocation.prb_ann_wrk_pln_bdgt_data_allocation_district pawpbda on 
    pawpbda.activity_master_details_id = psawpbd.activity_master_details_id 
    where pd.activity_master_id =${id} and state=${state_id} ${andWhere}
    group by (pd.id, pd.activity_master_details_name)`);

    return Response.handle(req, res, "allocationList", 200, {
      status: true,
      data: object.rows,
    });
  } catch (e) {
    return Exception.handle(e, res, req, "activityMasterDetailListByActiviId");
  }
};

exports.allocationActivityMasterList = async (req, res) => {
  try {
    const {
      schemeid,
      major_component_id,
      sub_component_id,
      state_id,
      district_id,
    } = req.body;
    const apiYear = req?.headers?.api_year;

    const query = Model.knx()
      .from("allocation.prb_ann_wrk_pln_bdgt_data_allocation_district")
      .where("state_id", state_id)
      .andWhere("plan_year", apiYear);

    if (district_id) {
      query.andWhere("district_id", district_id);
    }

    const object = await Model.knx()
      .from("prb_activity_master as pam")
      .where("scheme_id", schemeid)
      .where("major_component_id", major_component_id)
      .where("sub_component_id", sub_component_id)
      .whereIn("id", function () {
        this.select("activity_master_id").distinct().from(query.as("subquery"));
      });

    return Response.handle(req, res, "allocationActivityMasterList", 200, {
      status: true,
      data: object,
    });
  } catch (e) {
    return Exception.handle(e, res, req, "allocationActivityMasterList");
  }
};

exports.allocationActivityMasterListDistrict = async (req, res) => {
  try {
    const {
      schemeid,
      major_component_id,
      sub_component_id,
      state_id,
      district_id,
    } = req.body;
    const apiYear = req?.headers?.api_year;

    const query = Model.knx()
      .from("allocation.prb_ann_wrk_pln_bdgt_data_allocation_district")
      .where("state_id", state_id)
      .andWhere("district_id", district_id)
      .andWhere("plan_year", apiYear)
      .andWhereRaw(
        "coalesce(allocated_physical_quantity,0) + coalesce(allocated_financial_amount,0) > 0"
      );

    const object = await Model.knx()
      .from("prb_activity_master as pam")
      .where("scheme_id", schemeid)
      .where("major_component_id", major_component_id)
      .where("sub_component_id", sub_component_id)
      .whereIn("id", function () {
        this.select("activity_master_id").distinct().from(query.as("subquery"));
      });

    return Response.handle(req, res, "allocationActivityMasterList", 200, {
      status: true,
      data: object,
    });
  } catch (e) {
    return Exception.handle(e, res, req, "allocationActivityMasterList");
  }
};

exports.allocationActivityMasterDetailsList = async (req, res) => {
  try {
    const {
      schemeid,
      major_component_id,
      sub_component_id,
      activity_master_id,
      state_id,
      district_id,
      //  activity_group_code
    } = req.body;
    const apiYear = req?.headers?.api_year;
    const activity_group_code =
      req.body.activity_group_code === "null" ||
      req.body.activity_group_code === null ||
      req.body.activity_group_code === undefined
        ? null
        : `'${req.body.activity_group_code}'`;

    // const object = await Model.knx()
    //   .select("activity_master_id as id", "*")
    //   .from("prb_data")
    //   .where("scheme_id", schemeid)
    //   .andWhere("major_component_id", major_component_id)
    //   .andWhere("sub_component_id", sub_component_id)
    //   .andWhere("activity_master_id", activity_master_id)
    //   .whereIn("id", function () {
    //     this.select("activity_master_details_id")
    //       .distinct()
    //       .from("allocation.prb_ann_wrk_pln_bdgt_data_allocation_district")
    //       .where("state_id", state_id)
    //       .andWhere("plan_year", apiYear)
    //       .andWhere("proposed_financial_amount", ">", 0)
    //       .andWhere("activity_master_id", activity_master_id);
    //   });

    const query = Model.knx()
      .from("allocation.prb_ann_wrk_pln_bdgt_data_allocation_district")
      .where("state_id", state_id)
      .andWhere("plan_year", apiYear)
      .andWhere("proposed_financial_amount", ">", 0)
      .andWhere("activity_master_id", activity_master_id);

    if (district_id) {
      query.andWhere("district_id", district_id);
    }

    const object = await Model.knx()
      .select("activity_master_id as id", "*")
      .from("prb_data")
      .where("scheme_id", schemeid)
      .andWhere("major_component_id", major_component_id)
      .andWhere("sub_component_id", sub_component_id)
      .andWhere("activity_master_id", activity_master_id)
      .whereIn("id", function () {
        this.select("activity_master_details_id")
          .distinct()
          .from(query.as("subquery"));
      })
      .andWhereRaw(
        `id in (select activity_master_details_id from fetch_activity_master_details(${activity_group_code}))`
      );

    /*     console.log(object.toString());
    return false; */

    return Response.handle(
      req,
      res,
      "allocationActivityMasterDetailsList",
      200,
      { status: true, data: object }
    );
  } catch (e) {
    return Exception.handle(e, res, req, "allocationActivityMasterDetailsList");
  }
};

exports.allocationActivityMasterDetailsListDistrict = async (req, res) => {
  try {
    const {
      schemeid,
      major_component_id,
      sub_component_id,
      activity_master_id,
      state_id,
      district_id,
      //  activity_group_code
    } = req.body;
    const apiYear = req?.headers?.api_year;
    const activity_group_code =
      req.body.activity_group_code === "null" ||
      req.body.activity_group_code === null ||
      req.body.activity_group_code === undefined
        ? null
        : `'${req.body.activity_group_code}'`;

    const query = Model.knx()
      .from("allocation.prb_ann_wrk_pln_bdgt_data_allocation_district")
      .where("state_id", state_id)
      .andWhere("district_id", district_id)
      .andWhere("plan_year", apiYear)
      .andWhereRaw(
        "coalesce(allocated_physical_quantity,0) + coalesce(allocated_financial_amount,0) > 0"
      )
      .andWhere("activity_master_id", activity_master_id);

    const object = await Model.knx()
      .select("activity_master_id as id", "*")
      .from("prb_data")
      .where("scheme_id", schemeid)
      .andWhere("major_component_id", major_component_id)
      .andWhere("sub_component_id", sub_component_id)
      .andWhere("activity_master_id", activity_master_id)
      .whereIn("id", function () {
        this.select("activity_master_details_id")
          .distinct()
          .from(query.as("subquery"));
      })
      .andWhereRaw(
        `id in (select activity_master_details_id from fetch_activity_master_details(${activity_group_code}))`
      );

    return Response.handle(
      req,
      res,
      "allocationActivityMasterDetailsListDistrict",
      200,
      { status: true, data: object }
    );
  } catch (e) {
    return Exception.handle(
      e,
      res,
      req,
      "allocationActivityMasterDetailsListDistrict"
    );
  }
};

exports.allocationSchoolsList = async (req, res) => {
  try {
    const {
      state_id,
      dataObj: {
        scheme_id,
        major_component_id,
        sub_component_id,
        activity_master_id,
        activity_master_details_id,
        district_id,
      },
    } = req.body;

    const apiYear = req?.headers?.api_year;

    const object = await Model.knx()
      .select("pawpbdaa.*", "psm.school_name")
      .from("allocation.prb_ann_wrk_pln_bdgt_data_allocation_asset as pawpbdaa")
      .innerJoin(
        "prb_school_master as psm",
        "psm.udise_sch_code",
        "=",
        "pawpbdaa.asset_code"
      )
      .where("pawpbdaa.state_id", "=", state_id)
      .andWhere("psm.district_id", district_id)
      .andWhere("pawpbdaa.scheme_id", "=", scheme_id)
      .andWhere("pawpbdaa.major_component_id", "=", major_component_id)
      .andWhere("pawpbdaa.sub_component_id", "=", sub_component_id)
      .andWhere("pawpbdaa.activity_master_id", "=", activity_master_id)
      .andWhere(
        "pawpbdaa.activity_master_details_id",
        "=",
        activity_master_details_id
      )
      .andWhere("pawpbdaa.plan_year", apiYear);

    /*   console.log(object.toString());
    return false;
 */
    return Response.handle(req, res, "allocationSchoolsList", 200, {
      status: true,
      data: object,
    });
  } catch (e) {
    return Exception.handle(e, res, req, "allocationSchoolsList");
  }
};

exports.allocationSubComponentsList = async (req, res) => {
  try {
    const { schemeid, major_component_id, state_id } = req.body;
    const apiYear = req?.headers?.api_year;

    const object = await Model.knx().raw(
      `select * from prb_sub_component where sub_component_id in (select distinct sub_component_id from allocation.prb_ann_wrk_pln_bdgt_data_allocation_district pawpbdad where state_id = ${state_id} and plan_year = '${apiYear}' and scheme_id = ${schemeid} and major_component_id = ${major_component_id})`
    );

    return Response.handle(req, res, "allocationSchoolsList", 200, {
      status: true,
      data: object.rows,
    });
  } catch (e) {
    return Exception.handle(e, res, req, "allocationSchoolsList");
  }
};

exports.allocationSubComponentsListDistrict = async (req, res) => {
  try {
    const { schemeid, major_component_id, state_id, district_id } = req.body;
    const apiYear = req?.headers?.api_year;

    const object = await Model.knx().raw(
      `select * from prb_sub_component where sub_component_id in (select distinct sub_component_id from allocation.prb_ann_wrk_pln_bdgt_data_allocation_district pawpbdad where state_id = ${state_id} and district_id = ${district_id} and plan_year = '${apiYear}' and scheme_id = ${schemeid} and major_component_id = ${major_component_id} and coalesce (allocated_physical_quantity,0) +  coalesce (allocated_financial_amount,0)>0)`
    );

    return Response.handle(req, res, "allocationSchoolsList", 200, {
      status: true,
      data: object.rows,
    });
  } catch (e) {
    return Exception.handle(e, res, req, "allocationSchoolsList");
  }
};

exports.finalizeAllocationdashboard = async (req, res) => {
  try {
    const { state_id } = req.body;
    const apiYear = req?.headers?.api_year;
    console.log(apiYear);
    const object = await Model.knx()
      .raw(`INSERT INTO allocation.prb_ann_wrk_pln_bdgt_data_allocation_district
    (district_id , district_type ,
    scheme_id , major_component_id , sub_component_id , activity_master_id ,activity_master_details_id,
    state_id, plan_year) select c.district_id,3,  scheme_id , major_component_id , sub_component_id , activity_master_id,activity_master_details_id ,state ,'${apiYear}' from prb_state_ann_wrk_pln_bdgt_data psawpbd  , allocation.view_state_district_combined   c where c.district_state_id = psawpbd.state  and  proposed_financial_amount > 0 and district_state_id = ${state_id} on conflict(state_id, district_id, district_type ,activity_master_details_id, plan_year) do   nothing`);

    await Model.knx().raw(`
    INSERT INTO allocation.prb_ann_wrk_pln_bdgt_data_allocation_district
    (district_id , district_type , scheme_id, major_component_id, sub_component_id, activity_master_id,
    activity_master_details_id,    proposed_physical_quantity,proposed_financial_amount,state_id,plan_year)
    select district , 3, scheme_id::numeric , major_component_id , sub_component_id , activity_master_id ,
    activity_master_details_id ,physical_quantity ,financial_amount ,${state_id},'${apiYear}' from prb_ann_wrk_pln_bdgt_data pawpbd
    where state = ${state_id} and  plan_year = '${apiYear}' on conflict(state_id, district_id, district_type ,activity_master_details_id, plan_year) do update set proposed_physical_quantity = excluded.proposed_physical_quantity, proposed_financial_amount = excluded.proposed_financial_amount
    `);

    await Model.knx()
      .raw(`update allocation.prb_ann_wrk_pln_bdgt_data_allocation_district pda set proposed_unit_cost = psd.unit_cost
    from prb_state_ann_wrk_pln_bdgt_data psd  where psd.state = pda.state_id and psd.plan_year = pda.plan_year
    and psd.activity_master_details_id = pda.activity_master_details_id and state = ${state_id} and  pda.plan_year  = '${apiYear}'`);

    await Model.knx()
      .raw(`update allocation.prb_ann_wrk_pln_bdgt_data_allocation_district pda set allocated_physical_quantity  = (pda.proposed_physical_quantity * (psd.proposed_physical_quantity/ psd.physical_quantity))::int, allocated_financial_amount  = pda.proposed_physical_quantity * (psd.proposed_physical_quantity/ psd.physical_quantity) * pda.proposed_unit_cost 
    from prb_state_ann_wrk_pln_bdgt_data psd where psd.state = ${state_id} and psd.plan_year = '${apiYear}' and psd.activity_master_details_id = pda.activity_master_details_id and psd.state = pda.state_id and  psd.plan_year = pda.plan_year and psd.physical_quantity > 0`);

    await Model.knx()
      .raw(`INSERT INTO allocation.prb_ann_wrk_pln_bdgt_data_allocation_asset
(asset_code, asset_type,scheme_id, major_component_id, sub_component_id, activity_master_id, activity_master_details_id,
allocated_physical_quantity, allocated_financial_amount,state_id, plan_year)
select asset_code , asset_type ,scheme_id, major_component_id, sub_component_id, activity_master_id, activity_master_details_id,
     quantity, financial_quantity , state , plan_year 
from public.prb_state_ann_wrk_pln_bdgt_data_physical_asset psawpbdpa 
where state = ${state_id} 
and plan_year = '${apiYear}'
on conflict do nothing`);

    await Model.knx()
      .raw(`update allocation.prb_ann_wrk_pln_bdgt_data_allocation_asset paasm 
set district_id = psm.district_id 
from prb_school_master psm where psm.udise_sch_code =  paasm.asset_code 
and paasm.state_id = ${state_id} 
and paasm.plan_year = '${apiYear}'`);

    await Model.knx()
      .raw(`update allocation.prb_ann_wrk_pln_bdgt_data_allocation_district
set  allocated_physical_quantity = 0 , allocated_financial_amount = 0 
where state_id  = ${state_id}  and plan_year = '${apiYear}' and activity_master_details_id  in ( select id from prb_data where allocation_asset_selection = 1)`);

    await Model.knx()
      .raw(` update allocation.prb_ann_wrk_pln_bdgt_data_allocation_asset paasm
set scheme_id = pd.scheme_id ,
major_component_id = pd.major_component_id ,
sub_component_id = pd.sub_component_id ,
activity_master_id =pd.activity_master_id 
from prb_data pd 
where pd.id = paasm.activity_master_details_id 

and paasm.plan_year = '${apiYear}'
and paasm.state_id = ${state_id}`);

    await Model.knx()
      .raw(` INSERT INTO allocation.prb_ann_wrk_pln_bdgt_data_allocation_district
(district_id, district_type, 
  scheme_id, major_component_id, sub_component_id, activity_master_id, activity_master_details_id, 
  allocated_physical_quantity, allocated_financial_amount,  
  state_id, plan_year,  no_of_asset)
select district_id , 3,
scheme_id, major_component_id, sub_component_id, activity_master_id , activity_master_details_id,
  sum(allocated_physical_quantity)  ,sum( allocated_financial_amount)  ,
  pawpbdaa.state_id ,  plan_year , count(*) as no_of_asset
  from allocation.prb_ann_wrk_pln_bdgt_data_allocation_asset pawpbdaa 
  where 
   state_id = ${state_id} and plan_year='${apiYear}'
group by scheme_id, major_component_id, sub_component_id, activity_master_id , activity_master_details_id,pawpbdaa.state_id , 
  plan_year ,district_id 
on conflict (state_id,district_id,district_type, activity_master_details_id,plan_year) do 
update 
set allocated_physical_quantity = excluded.allocated_physical_quantity,
    allocated_financial_amount = excluded.allocated_financial_amount ,
    no_of_asset = excluded.no_of_asset `);

    await Model.knx()
      .raw(`update allocation.prb_ann_wrk_pln_bdgt_data_allocation_district pwd
set  allocated_unit_cost = psd.proposed_unit_cost 
from public.prb_state_ann_wrk_pln_bdgt_data psd
where psd.state = pwd.state_id 
and psd.activity_master_details_id = pwd.activity_master_details_id
and pwd.no_of_asset > 0
and pwd.state_id = ${state_id}
and pwd.plan_year = psd.plan_year 
and pwd.plan_year = '${apiYear}'`);

    await Model.knx()
      .raw(`update allocation.prb_ann_wrk_pln_bdgt_data_allocation_district pwd
set  allocated_financial_amount  = allocated_physical_quantity * allocated_unit_cost 
where state_id = ${state_id}
     and plan_year = '${apiYear}'
     and no_of_asset > 0`);

    const inserted = await Model.knx()
      .raw(`update allocation.prb_ann_wrk_pln_bdgt_data_allocation_asset pwd
    set  allocated_financial_amount  = psd.proposed_unit_cost * allocated_physical_quantity 
    from public.prb_state_ann_wrk_pln_bdgt_data psd
    where psd.state = pwd.state_id 
    and psd.activity_master_details_id = pwd.activity_master_details_id
    and pwd.plan_year = psd.plan_year 
    and pwd.state_id = ${state_id}    
    and pwd.plan_year ='${apiYear}'
    and pwd.activity_master_details_id in ( select id  from prb_data pd where pd.finance_yn =0 )`);
    if (+inserted.rowCount > 0) {
      return Response.handle(req, res, "finalizeAllocationdashboard", 200, {
        status: 200,
        count: inserted.rowCount,
        data: object.rows,
      });
    } else {
      return Response.handle(req, res, "finalizeAllocationdashboard", 400, {
        status: 400,
        count: inserted.rowCount,
        data: object.rows,
      });
    }
  } catch (e) {
    return Exception.handle(e, res, req, "finalizeAllocationdashboard");
  }
};
exports.allocationFormLock = async (req, res) => {
  try {
    const {
      state_id,
      dataObj: {
        activityDetails: {
          scheme_id,
          major_component_id,
          sub_component_id,
          activity_master_id,
          id,
        },
      },
      allocationList,
    } = req.body;
    const apiYear = req?.headers?.api_year;

    const updateObj = await Model.knx().transaction(async (trx) => {
      for (let i = 0; i < allocationList.length; i++) {
        let allocated_physical_quantity =
          allocationList[i]["allocated_physical_quantity"] || 0;
        let allocated_financial_amount =
          allocationList[i]["allocated_financial_amount"] || 0;
        await trx.raw(
          `update allocation.prb_ann_wrk_pln_bdgt_data_allocation_district pawbda set allocated_physical_quantity=${allocated_physical_quantity}, allocated_financial_amount=${allocated_financial_amount}, status = 6 
            where 
            scheme_id = ${scheme_id}
            and major_component_id = ${major_component_id} 
            and sub_component_id = ${sub_component_id}
            and activity_master_id = ${activity_master_id}
            and activity_master_details_id = ${id}
            and state_id = ${state_id}
            and plan_year = '${apiYear}'
            and prb_ann_wrk_pln_bdgt_data_allocation_district_id=${allocationList[i]["prb_ann_wrk_pln_bdgt_data_allocation_district_id"]}`
        );
      }
    });

    //   const updateObj = await Model.knx().raw(`update
    //   allocation.prb_ann_wrk_pln_bdgt_data_allocation_district pawpbdad
    //    set status = 6
    // where
    //   scheme_id = ${scheme_id}
    //   and major_component_id = ${major_component_id}
    //   and sub_component_id = ${sub_component_id}
    //   and activity_master_id = ${activity_master_id}
    //   and activity_master_details_id = ${id}
    //   and state_id = ${state_id}
    //   and plan_year = '${apiYear}'`);
    return Response.handle(req, res, "allocationFormLock", 200, {
      status: true,
      data: updateObj?.rowCount === 1 ? "successfully updated" : "not updated",
    });
  } catch (e) {
    return Exception.handle(e, res, req, "allocationFormLock");
  }
};

exports.checkProgressData = async (req, res) => {
  try {
    const { data, activity_master_id, activity_master_details_id } = req.body;
    const apiYear = req?.headers?.api_year;
    let should_be = "";
    let resultObject = null;
    if (
      data.state !== "" &&
      activity_master_details_id !== "" &&
      apiYear !== "" &&
      data.month !== ""
    ) {
      const countObject = await Model.knx()
        .from(
          "progress.prb_ann_wrk_pln_bdgt_data_progress_district as pawpbdpd"
        )
        .count("*")
        .where({
          state_id: data.state,
          activity_master_details_id: activity_master_details_id,
          plan_year: apiYear,
          month_id: data.month,
        });

      if (+countObject[0].count === 0) {
        resultObject = await Model.knx().raw(
          `select *,md.district_name ,0 as physical_progress_yet_to_start, 0 as physical_progress_in_progress, 0 as physical_progress_completed, 0 as financial_expenditure from allocation.prb_ann_wrk_pln_bdgt_data_allocation_district ald left join public.master_districts md on ald.district_id = md.district_id where ald.state_id = ${data.state} and ald.activity_master_details_id = ${activity_master_details_id} and ald.plan_year ='${apiYear}'`
        );
        should_be = "insert";
      } else {
        resultObject = await Model.knx().raw(
          `select prd.prb_ann_wrk_pln_bdgt_data_progress_id , ald.allocated_physical_quantity , ald.allocated_financial_amount ,md.district_name ,md.district_id , prd.physical_progress_yet_to_start , prd.physical_progress_in_progress , prd.physical_progress_completed , prd.financial_expenditure from allocation.prb_ann_wrk_pln_bdgt_data_allocation_district ald  left join public.master_districts md  on ald.district_id = md.district_id  inner join  progress.prb_ann_wrk_pln_bdgt_data_progress_district prd on (ald.activity_master_details_id = prd.activity_master_details_id and ald.district_id = prd.district_id ) where ald.state_id = ${data.state} and ald.activity_master_details_id = ${activity_master_details_id} and ald.plan_year ='${apiYear}' and prd.month_id = ${data.month} `
        );
        should_be = "update";
      }
    }

    return Response.handle(req, res, "allocationFormLock", 200, {
      status: true,
      data: resultObject.rows ?? [],
      should_be: should_be,
    });
  } catch (e) {
    return Exception.handle(e, res, req, "allocationFormLock");
  }
};

exports.updateProgressList = async (req, res) => {
  try {
    const {
      data,
      progress_list,
      activity_master_id,
      activity_master_details_id,
      should_be,
    } = req.body;
    const apiYear = req?.headers?.api_year;

    if (should_be === "update") {
      const dataToUpdate = progress_list.map((pl) => {
        return {
          prb_ann_wrk_pln_bdgt_data_progress_id:
            pl.prb_ann_wrk_pln_bdgt_data_progress_id,
          allocated_physical_quantity: pl.allocated_physical_quantity,
          allocated_financial_amount: pl.allocated_financial_amount,
          district_id: pl.district_id,
          physical_progress_yet_to_start: pl.physical_progress_yet_to_start,
          physical_progress_in_progress: pl.physical_progress_in_progress,
          physical_progress_completed: pl.physical_progress_completed,
          financial_expenditure: pl.financial_expenditure,
        };
      });

      const update_status = await Model.knx().transaction(async (trx) => {
        for (const item of dataToUpdate) {
          await trx("progress.prb_ann_wrk_pln_bdgt_data_progress_district")
            .where(
              "prb_ann_wrk_pln_bdgt_data_progress_id",
              item.prb_ann_wrk_pln_bdgt_data_progress_id
            )
            .update({
              allocated_physical_quantity: item.allocated_physical_quantity,
              allocated_financial_amount: item.allocated_financial_amount,
              district_id: item.district_id,
              physical_progress_yet_to_start:
                item.physical_progress_yet_to_start,
              physical_progress_in_progress: item.physical_progress_in_progress,
              physical_progress_completed: item.physical_progress_completed,
              financial_expenditure: item.financial_expenditure,
            });
        }
      });

      return Response.handle(req, res, "updateProgressList", 200, {
        status: true,
        data: update_status,
      });
    } else {
      const insertData = progress_list.map((pl) => {
        return {
          district_id: pl.district_id,
          district_type: pl.district_type,
          scheme_id: pl.scheme_id,
          major_component_id: pl.major_component_id,
          sub_component_id: pl.sub_component_id,
          activity_master_id: pl.activity_master_id,
          activity_master_details_id: pl.activity_master_details_id,
          status: pl.status,
          state_id: data.state,
          plan_year: apiYear,
          month_id: data.month,
          allocated_physical_quantity: pl.allocated_physical_quantity,
          physical_progress_yet_to_start: pl.physical_progress_yet_to_start,
          physical_progress_in_progress: pl.physical_progress_in_progress,
          physical_progress_completed: pl.physical_progress_completed,
          financial_expenditure: pl.financial_expenditure,
        };
      });

      const insert_status = await Model.knx().transaction(async (trx) => {
        await trx
          .insert(insertData)
          .into("progress.prb_ann_wrk_pln_bdgt_data_progress_district");
      });
      return Response.handle(req, res, "updateProgressList", 200, {
        status: true,
        data: insert_status,
      });
    }
  } catch (e) {
    return Exception.handle(e, res, req, "updateProgressList");
  }
};

exports.districtWiseAllocationData = async (req, res) => {
  try {
    const { data } = req.body;
    const apiYear = req?.headers?.api_year;

    const {
      filter: { state },
      activityDetails: { id },
    } = data;

    if (state && id && apiYear) {
      /* object = await Model.knx().raw(
        `select pawpbdad.allocated_physical_quantity, pawpbdad.allocated_financial_amount::numeric(20,5), vsdc.district_id, pawpbdad.state_id, vsdc.district_name from allocation.prb_ann_wrk_pln_bdgt_data_allocation_district pawpbdad, allocation.view_state_district_combined vsdc where state_id = ${state} and plan_year ='${apiYear}' and activity_master_details_id = ${id} and pawpbdad.district_id = vsdc.district_id and vsdc.district_state_id = state_id and (allocated_physical_quantity + allocated_financial_amount) > 0`
      ); */

      object = await Model.knx().raw(`with allocation as (
  select
    pawpbdad.allocated_physical_quantity,
    pawpbdad.allocated_financial_amount::numeric(16,
    5),
    activity_master_details_id,
    vsdc.district_id,
    pawpbdad.state_id,
    vsdc.district_name
  from
    allocation.prb_ann_wrk_pln_bdgt_data_allocation_district pawpbdad,
    allocation.view_state_district_combined vsdc
  where
    state_id = ${state}
    and plan_year = '${apiYear}'
    and activity_master_details_id = ${id}
    and pawpbdad.district_id = vsdc.district_id
    and vsdc.district_state_id = state_id
    and (allocated_physical_quantity + allocated_financial_amount) > 0),
    progression as (
    select
    state_id ,
    district_id ,
    activity_master_details_id,
    SUM(physical_progress_completed)  as physical_progress_completed,
    sum(financial_expenditure) as financial_expenditure,
    status
  from
    progress.prb_ann_wrk_pln_bdgt_data_progress_district pawpbdpd
  where
    state_id = ${state}
    and plan_year = '${apiYear}'
    and activity_master_details_id = ${id}
    group by state_id,
    district_id ,activity_master_details_id,status
    ) 
    select allocation.* ,physical_progress_completed , financial_expenditure,progression.status from allocation left join progression 
    on (allocation.district_id=progression.district_id and allocation.activity_master_details_id= progression.activity_master_details_id )  order by district_name`);
    } else {
      object = { rows: [] };
    }

    /*     console.log(object.toString());
    return false; */

    return Response.handle(req, res, "districtWiseAllocationData", 200, {
      status: true,
      data: object.rows,
    });
  } catch (e) {
    return Exception.handle(e, res, req, "districtWiseAllocationData");
  }
};

exports.districtWiseAllocationDataDistrict = async (req, res) => {
  try {
    const { data } = req.body;
    const apiYear = req?.headers?.api_year;
    const {
      filter: { state, district },
      activityDetails: { id },
    } = data;

    if (state && district && id && apiYear) {
      object = await Model.knx().raw(`with allocation as (
  select
    pawpbdad.allocated_physical_quantity,
    pawpbdad.allocated_financial_amount::numeric(16,
    5),
    activity_master_details_id,
    vsdc.district_id,
    pawpbdad.state_id,
    vsdc.district_name
  from
    allocation.prb_ann_wrk_pln_bdgt_data_allocation_district pawpbdad,
    allocation.view_state_district_combined vsdc
  where
    state_id = ${state}
    and vsdc.district_id = ${district}
    and plan_year = '${apiYear}'
    and activity_master_details_id = ${id}
    and pawpbdad.district_id = vsdc.district_id
    and vsdc.district_state_id = state_id
    and (allocated_physical_quantity + allocated_financial_amount) > 0),
    progression as (
    select
    state_id ,
    district_id ,
    activity_master_details_id,
    SUM(physical_progress_completed)  as physical_progress_completed,
    sum(financial_expenditure) as financial_expenditure
  from
    progress.prb_ann_wrk_pln_bdgt_data_progress_district pawpbdpd
  where
    state_id = ${state}
    and pawpbdpd.district_id = ${district}
    and plan_year = '${apiYear}'
    and activity_master_details_id = ${id}
    group by state_id,
    district_id ,activity_master_details_id
    ) 
    select allocation.* ,physical_progress_completed , financial_expenditure from allocation left join progression 
    on (allocation.district_id=progression.district_id and allocation.activity_master_details_id= progression.activity_master_details_id )`);
    } else {
      object = { rows: [] };
    }

    return Response.handle(
      req,
      res,
      "districtWiseAllocationDataDistrict",
      200,
      {
        status: true,
        data: object.rows,
      }
    );
  } catch (e) {
    return Exception.handle(e, res, req, "districtWiseAllocationDataDistrict");
  }
};

exports.districtWiseProgressDataByAsset = async (req, res) => {
  try {
    const { data, active_month } = req.body;
    const apiYear = req?.headers?.api_year;
    const {
      filter: { state },
      activityDetails: { id },
    } = data;

    if (state && id && apiYear) {
      /* object = await Model.knx().raw(
        `select pawpbdad.allocated_physical_quantity, pawpbdad.allocated_financial_amount::numeric(20,5), vsdc.district_id, pawpbdad.state_id, vsdc.district_name from allocation.prb_ann_wrk_pln_bdgt_data_allocation_district pawpbdad, allocation.view_state_district_combined vsdc where state_id = ${state} and plan_year ='${apiYear}' and activity_master_details_id = ${id} and pawpbdad.district_id = vsdc.district_id and vsdc.district_state_id = state_id and (allocated_physical_quantity + allocated_financial_amount) > 0`
      ); */

      object = await Model.knx().raw(`with allocation as (
  select
    pawpbdad.allocated_physical_quantity,
    pawpbdad.allocated_financial_amount::numeric(16,
    5),
    activity_master_details_id,
    vsdc.district_id,
    pawpbdad.state_id,
    vsdc.district_name
  from
    allocation.prb_ann_wrk_pln_bdgt_data_allocation_district pawpbdad,
    allocation.view_state_district_combined vsdc
  where
    state_id = ${state}
    and plan_year = '${apiYear}'
    and activity_master_details_id = ${id}
    and pawpbdad.district_id = vsdc.district_id
    and vsdc.district_state_id = state_id
    and (allocated_physical_quantity + allocated_financial_amount) > 0),
    progression as (
    select
    state_id ,
    district_id ,
    activity_master_details_id,
    sum(physical_progress_yet_to_start) filter (where month_id = ${active_month})  as physical_progress_yet_to_start,
    sum(physical_progress_in_progress) filter (where month_id = ${active_month})  as physical_progress_in_progress,
    sum(physical_progress_completed) filter (where month_id = ${active_month})  as physical_progress_completed, 
    sum(financial_expenditure) filter (where month_id = ${active_month})  as current_financial_expenditure,
    sum(financial_expenditure) as cumulative_financial_expenditure
  from
    progress.prb_ann_wrk_pln_bdgt_data_progress_district pawpbdpd
  where
    state_id = ${state}
    and plan_year = '${apiYear}'
    and activity_master_details_id = ${id}
    group by state_id,
    district_id ,activity_master_details_id
    ) 
    select allocation.* , physical_progress_yet_to_start,physical_progress_in_progress, physical_progress_completed , current_financial_expenditure,cumulative_financial_expenditure from allocation left join progression 
    on (allocation.district_id=progression.district_id and allocation.activity_master_details_id= progression.activity_master_details_id ) order by district_name`);
    } else {
      object = { rows: [] };
    }

    /*     console.log(object.toString());
    return false; */

    return Response.handle(req, res, "districtWiseAllocationData", 200, {
      status: true,
      data: object.rows,
    });
  } catch (e) {
    return Exception.handle(e, res, req, "districtWiseAllocationData");
  }
};

exports.saveProgressData = async (req, res) => {
  try {
    const { payload } = req.body;
    const {
      physicalProgressCompleted,
      financialExpenditure,
      activeMonth,
      activeDistrict: { district_id, state_id },
      activityDetails: {
        id,
        scheme_id,
        major_component_id,
        sub_component_id,
        activity_master_id,
      },
      status,
    } = payload;
    const apiYear = req?.headers?.api_year;

    const query = await Model.knx()
      .raw(`INSERT INTO progress.prb_ann_wrk_pln_bdgt_data_progress_district ( district_id, scheme_id, major_component_id, sub_component_id, activity_master_id, activity_master_details_id, state_id, plan_year, month_id, physical_progress_completed, financial_expenditure,status)
	VALUES ('${district_id}', '${scheme_id}', '${major_component_id}', '${sub_component_id}', '${activity_master_id}', '${id}', '${state_id}', '${apiYear}', '${activeMonth}', '${physicalProgressCompleted}', '${financialExpenditure}', '${status}' ) 	on conflict(state_id, district_id, plan_year, month_id, activity_master_details_id) do update 
  set physical_progress_completed = excluded.physical_progress_completed,
  financial_expenditure = excluded.financial_expenditure,
  status=excluded.status`);

    return Response.handle(req, res, "saveProgressData", 200, {
      status: true,
      data: +query.rowCount === 1 ? "Inserted Successfully" : "Not Inserted",
    });
  } catch (e) {
    return Exception.handle(e, res, req, "saveProgressData");
  }
};

exports.monthWiseProgressData = async (req, res) => {
  try {
    const { payload } = req.body;

    const {
      activeDistrict: { district_id, state_id },
      activityDetails: { id },
    } = payload;
    const apiYear = req?.headers?.api_year;
    const progress_month = req?.headers?.progress_month;

    // District Data
    const districtQuery = await Model.knx().raw(
      `select *,SUM(physical_progress_completed) OVER (ORDER BY month_id) AS running_physical_progress_completed,
      sum(financial_expenditure) OVER (ORDER BY month_id) as  running_financial_expenditure from progress.prb_ann_wrk_pln_bdgt_data_progress_district pawpbdpd where state_id = ${state_id} and plan_year ='${apiYear}' and activity_master_details_id = ${id} and district_id = ${district_id}`
    );

    //State Data
    const stateQuery = await Model.knx().raw(
      `
      with cte as (
      select  coalesce (SUM(physical_progress_in_progress),0) as physical_progress_in_progress,
      SUM(physical_progress_completed) as physical_progress_completed, 
             sum(financial_expenditure) as financial_expenditure,
             month_id 
       from
      progress.prb_ann_wrk_pln_bdgt_data_progress_district pawpbdpd
    where
      state_id = ${state_id}
      and plan_year = '${apiYear}'
      and activity_master_details_id = ${id}
      group by month_id
      )
      select
       month_id,
       physical_progress_in_progress,
       physical_progress_completed,
       financial_expenditure,
      SUM(physical_progress_completed) over (
      order by month_id) as running_physical_progress_completed,
      sum(financial_expenditure) over (
      order by month_id) as running_financial_expenditure
    from cte order by month_id
    `
    );

    //Current Month Data
    const monthQuery = await Model.knx().raw(`select*,
    SUM(physical_progress_completed) over (
    order by month_id) as running_physical_progress_completed,
          sum(financial_expenditure) over (
    order by month_id) as running_financial_expenditure
    from
    progress.prb_ann_wrk_pln_bdgt_data_progress_district pawpbdpd
    where
    state_id = ${state_id}
    and plan_year = '${apiYear}'
    and activity_master_details_id = ${id}
    and district_id = ${district_id}
    and month_id = ${progress_month}
    `);

    return Response.handle(req, res, "monthWiseProgressData", 200, {
      status: true,
      district_data: districtQuery.rows,
      state_data: stateQuery.rows,
      current_month_data: monthQuery.rows,
    });
  } catch (e) {
    return Exception.handle(e, res, req, "monthWiseProgressData");
  }
};
exports.monthWiseProgressDataByAsset = async (req, res) => {
  try {
    const { payload } = req.body;

    const {
      activeDistrict: { district_id, state_id },
      activityDetails: { id },
    } = payload;
    const apiYear = req?.headers?.api_year;
    const progress_month = req?.headers?.progress_month;

    // District Data
    const districtQuery = await Model.knx().raw(
      `select *,
      sum(financial_expenditure) OVER (ORDER BY month_id) as  running_financial_expenditure from progress.prb_ann_wrk_pln_bdgt_data_progress_district pawpbdpd where state_id = ${state_id} and plan_year ='${apiYear}' and activity_master_details_id = ${id} and district_id = ${district_id}`
    );

    //State Data
    const stateQuery = await Model.knx().raw(
      ` with cte as (
        select  
        coalesce (SUM(physical_progress_yet_to_start),0) as physical_progress_yet_to_start,
        coalesce (SUM(physical_progress_in_progress),0) as physical_progress_in_progress,
        coalesce (SUM(physical_progress_completed),0) as physical_progress_completed,
        coalesce (SUM(financial_expenditure),0) as financial_expenditure,
          month_id 
         from
        progress.prb_ann_wrk_pln_bdgt_data_progress_district pawpbdpd
      where
      state_id = ${state_id}
      and plan_year = '${apiYear}'
      and activity_master_details_id = ${id}
        group by month_id
        )
        select
         month_id,
         physical_progress_yet_to_start,
         physical_progress_in_progress,
         physical_progress_completed,
         financial_expenditure as current_financial_expenditure,
        sum(financial_expenditure) over (
        order by month_id) as cumalative_financial_expenditure
      from cte order by month_id
    `
    );

    //Current Month Data
    const monthQuery = await Model.knx().raw(`select*,
    SUM(physical_progress_completed) over (
    order by month_id) as running_physical_progress_completed,
          sum(financial_expenditure) over (
    order by month_id) as running_financial_expenditure
    from
    progress.prb_ann_wrk_pln_bdgt_data_progress_district pawpbdpd
    where
    state_id = ${state_id}
    and plan_year = '${apiYear}'
    and activity_master_details_id = ${id}
    and district_id = ${district_id}
    and month_id = ${progress_month}
    `);

    return Response.handle(req, res, "monthWiseProgressData", 200, {
      status: true,
      district_data: districtQuery.rows,
      state_data: stateQuery.rows,
      current_month_data: monthQuery.rows,
    });
  } catch (e) {
    return Exception.handle(e, res, req, "monthWiseProgressData");
  }
};

exports.configureProgressActiveMonth = async (req, res) => {
  try {
    const {
      payload: { activeState, month, monthFrom, monthTo },
    } = req.body;
    const apiYear = req?.headers?.api_year;

    /*    const query = await Model.knx().raw(
      `INSERT INTO progress.state_progress_active_month (state_id, month_id, progress_from_date, progress_to_date,plan_year) 
      VALUES ('${state}', '${month}', '${monthFrom}', '${monthTo}', '${apiYear}') ON CONFLICT(state_id, month_id,plan_year)  do UPDATE set progress_from_date = '${monthFrom}',  progress_to_date = '${monthTo}'`
    ); */

    const query = await Model.knx().raw(
      `UPDATE progress.state_progress_active_month SET month_id = '${month}', progress_from_date = '${monthFrom}', progress_to_date = '${monthTo}' WHERE plan_year = '${apiYear}' and state_id = '${activeState}'`
    );

    return Response.handle(req, res, "saveProgressData", 200, {
      status: true,
      data: +query.rowCount === 1 ? "Inserted Successfully" : "Not Inserted",
    });
  } catch (e) {
    return Exception.handle(e, res, req, "monthWiseProgressData");
  }
};

exports.progressActiveMonthData = async (req, res) => {
  try {
    const { state } = req.body;
    const query = await Model.knx().raw(
      `select * from progress.state_progress_active_month where state_id = ${state} order by month_id`
    );

    return Response.handle(req, res, "progressActiveMonthData", 200, {
      status: true,
      data: query.rows,
    });
  } catch (e) {
    return Exception.handle(e, res, req, "progressActiveMonthData");
  }
};

exports.progressMonthData = async (req, res) => {
  try {
    const apiYear = req?.headers?.api_year;
    const query = await Model.knx().raw(
      `select * from progress.state_progress_active_month spam
      inner join public.master_states ms on ms.state_id = spam.state_id 
      where spam.plan_year = '${apiYear}' order by spam.state_id`
    );

    return Response.handle(req, res, "progressMonthData", 200, {
      status: true,
      data: query.rows,
    });
  } catch (e) {
    return Exception.handle(e, res, req, "progressMonthData");
  }
};

exports.allocationDashboardData = async (req, res) => {
  try {
    const { state } = req.body;
    const apiYear = req?.headers?.api_year;

    if (state && apiYear) {
      object = await Model.knx().raw(`with recomend as (
        select
          case
            when status > 4 then 'Recomended'
            else 'Pending at State Co-ordinator'
          end
                   as recomend_status,
          activity_master_details_id,
          state
        from
          public.prb_state_ann_wrk_pln_bdgt_data
        where
          state = ${state}
          and plan_year = '${apiYear}'
          and coalesce(proposed_physical_quantity,
          0) + coalesce (proposed_financial_amount,
          0) > 0
                   ) , 
                    alloc as (
        select
          distinct pawpbdad.activity_master_details_id ,
          case
            when status = '1' then 'Allocation In Progress '
            when status = '6' then 'Allocation Finalized'
            else 'Allocation Not Started'
          end
                             
                     as alloc_status ,
          state_id
        from
          allocation.prb_ann_wrk_pln_bdgt_data_allocation_district pawpbdad
        where
          state_id = ${state}
          and plan_year = '${apiYear}'
          and coalesce (allocated_physical_quantity,
          0) + coalesce (allocated_financial_amount,
          0) >0 )
                   
                   select
          recomend.*,
          alloc.*,
          pd.scheme_id ,
          pd.scheme_name ,
          pd.major_component_id ,
          pd.major_component_name ,
          pd.sub_component_id ,
          pd.sub_component_name ,
          pd.activity_master_id ,
          pd.activity_master_name ,
          pd.id ,
          pd.activity_master_details_name
        from
          recomend
        left join alloc on
          (recomend.activity_master_details_id = alloc.activity_master_details_id)
        inner join prb_data pd on
          (recomend.activity_master_details_id = pd.id )
          order by 
          pd.scheme_name ,
          pd.major_component_name ,
          pd.sub_component_name ,
          pd.activity_master_name ,
          pd.activity_master_details_name`);
    } else {
      object = { rows: [] };
    }

    return Response.handle(req, res, "allocationDashboardData", 200, {
      status: true,
      data: object.rows,
    });
  } catch (e) {
    return Exception.handle(e, res, req, "allocationDashboardData");
  }
};

exports.progressStateData = async (req, res) => {
  try {
    const { state, scheme } = req.body;
    const apiYear = req?.headers?.api_year;

    if (state && apiYear) {
      object = await Model.knx().raw(`with all_rec as (
        with alloc as (
        select coalesce (sum(allocated_physical_quantity),0)  as allocated_physical_quantity , 
             coalesce( sum(allocated_financial_amount),0) as allocated_financial_amount , activity_master_details_id 
        from allocation.prb_ann_wrk_pln_bdgt_data_allocation_district pawpbdad 
        where state_id = ${state} and plan_year = '${apiYear}' 
        group by activity_master_details_id 
        ), 
         recomend as  (
        select  sum(pawpbdpd.physical_progress_completed) filter (where month_id = 1) as  physical_progress_completed , 
        coalesce(sum(pawpbdpd.financial_expenditure),0) as  financial_expenditure, activity_master_details_id  
        from progress.prb_ann_wrk_pln_bdgt_data_progress_district pawpbdpd 
        where state_id = ${state} and plan_year = '${apiYear}'
        group by activity_master_details_id
        )
        select  (100* physical_progress_completed/allocated_physical_quantity) as prcnt_physical ,
                (100* financial_expenditure / allocated_financial_amount) as prcnt_financial,
                alloc.activity_master_details_id 
        from alloc left join recomend on (alloc.activity_master_details_id = recomend.activity_master_details_id )
        where allocated_financial_amount > 0 and allocated_physical_quantity > 0)
        select pd.scheme_id, 
        pd.major_component_name, 
        pd.sub_component_name, 
        pd.activity_master_name, 
        pd.activity_master_details_name, 
        round(coalesce (prcnt_physical,0),2) as prcnt_physical, 
        round(coalesce (prcnt_financial,0),2) as prcnt_financial
        from all_rec inner join  
        public.prb_data pd on 
        (all_rec.activity_master_details_id= pd.id) 
        where scheme_id = ${scheme}
        order by pd.scheme_id, pd.major_component_name, pd.sub_component_name, pd.activity_master_name, pd.activity_master_details_name`);
    } else {
      object = { rows: [] };
    }

    return Response.handle(req, res, "allocationDashboardData", 200, {
      status: true,
      data: object.rows,
    });
  } catch (e) {
    return Exception.handle(e, res, req, "allocationDashboardData");
  }
};

exports.dietList = async (req, res) => {
  try {
    const { state_id } = req.body;
    // const apiYear = req?.headers?.api_year;

    object = await Model.knx().raw(
      `select * from master_diet where district_state_id=${state_id} order by diet_name ASC`
    );

    return Response.handle(req, res, "dietconfigureplan", 200, {
      status: true,
      data: object.rows,
    });
  } catch (e) {
    return Exception.handle(e, res, req, "dietconfigureplan");
  }
};

exports.dietActivityList = async (req, res) => {
  try {
    const { state_id, diet_id } = req.body;
    const apiYear = req?.headers?.api_year;
    const created_by = req.auth.user.id;

    objecta = await Model.knx()
      .raw(`INSERT INTO public.prb_ann_wrk_pln_bdgt_data
    (state, district,   scheme_id, sub_component_id, major_component_id, activity_master_id, activity_master_details_id ,status,physical_quantity,financial_amount,plan_year, created_by )
    select md.district_state_id ,md.district_id , scheme_id, sub_component_id, major_component_id, activity_master_id, pd.id as activity_master_details_id, 4,0,0, '${apiYear}', ${created_by}
    from master_diet md,  prb_data pd
    where md.diet_id = ${diet_id} and  sub_component_id = 222 
    on conflict (activity_master_details_id, state, district, plan_year)
    do nothing `);
    objects = await Model.knx()
      .raw(`INSERT INTO public.prb_ann_wrk_pln_bdgt_data_physical_asset
    (asset_code, asset_type, state, district, block, scheme_id,major_component_id, sub_component_id,  activity_master_id,activity_master_details_id,  plan_year, created_by )
    select md.diet_code,3,md.district_state_id , md.district_id  ,0,
    scheme_id,major_component_id, sub_component_id,  activity_master_id,pd.id as activity_master_details_id,'${apiYear}', ${created_by}
    from master_diet md , prb_data pd
    where md.diet_id = ${diet_id}  and  sub_component_id = 222 
    on conflict do nothing `);
    object = await Model.knx()
      .raw(`select * from public.prb_ann_wrk_pln_bdgt_data_physical_asset ast , prb_data pd
    where asset_code in (select md.diet_code  from master_diet md where md.diet_id = ${diet_id} )
    and pd.id = ast.activity_master_details_id and plan_year ='${apiYear}'`);

    let activityStatus = await Model.knx()
      .raw(`select min(status) as status from prb_ann_wrk_pln_bdgt_data pawpbd 
    where pawpbd.district in ((select md.district_id from master_diet md where md.diet_id = ${diet_id}) :: bigint)
    and pawpbd.sub_component_id = 222 and plan_year = '${apiYear}';`);

    return Response.handle(req, res, "dietActivityList", 200, {
      status: true,
      data: object.rows,
      activity_status: activityStatus.rows[0].status,
    });
  } catch (e) {
    return Exception.handle(e, res, req, "dietActivityList");
  }
};

exports.approvedDietActivityList = async (req, res) => {
  try {
    const { diet_id } = req.body;
    const plan_year = req?.headers?.api_year;
    const created_by = req.auth.user.id;
    // const object = await Model.knx().raw(`select * from public.prb_state_ann_wrk_pln_bdgt_data_physical_asset    ast , prb_data pd
    // where asset_code in (select md.diet_code  from master_diet md where md.diet_id = 1011 )
    // and pd.id = ast.activity_master_details_id  and plan_year ='${plan_year}'`);

    const insert = await Model.knx()
      .raw(`INSERT INTO public.prb_state_ann_wrk_pln_bdgt_data_physical_asset
    (asset_code, asset_type, state, district, activity_master_details_id, scheme_id, sub_component_id, major_component_id, activity_master_id, 
    block, quantity, financial_quantity, plan_year, status, unit_cost, created_by)

    select asset_code, asset_type, state, district, activity_master_details_id, scheme_id, sub_component_id, major_component_id, activity_master_id,
    block,quantity , financial_quantity , plan_year ,1, unit_cost, ${created_by}
    from prb_ann_wrk_pln_bdgt_data_physical_asset pawpbdpa where sub_component_id = 222 and plan_year = '${plan_year}'
    and asset_code in (select md.diet_code  from master_diet md where md.diet_id = ${diet_id} )
    on conflict (asset_code, state, district, activity_master_details_id, plan_year) do nothing`);

    const object = await Model.knx()
      .raw(`select psawpbdpa.prb_state_ann_wrk_pln_bdgt_data_physical_asset_id as id, psawpbdpa.activity_master_details_id, pd.activity_master_details_name , 
      pawpbdpa.quantity  as proposed_quantity, pawpbdpa.financial_quantity as proposed_financial_amount, pawpbdpa.unit_cost as proposed_unit_cost,
      psawpbdpa.quantity as recomended_quantity, psawpbdpa.financial_quantity as recomended_financial_amount, psawpbdpa.unit_cost as recomended_unit_cost, psawpbdpa.status
    from public.prb_ann_wrk_pln_bdgt_data_physical_asset pawpbdpa, public.prb_state_ann_wrk_pln_bdgt_data_physical_asset psawpbdpa, prb_data pd 
    where pawpbdpa.sub_component_id = 222 and pawpbdpa.plan_year = '${plan_year}'
    and pawpbdpa.asset_code = psawpbdpa.asset_code 
    and pawpbdpa.activity_master_details_id = psawpbdpa.activity_master_details_id 
    and pawpbdpa.plan_year = psawpbdpa.plan_year 
    and pawpbdpa.asset_code in (select md.diet_code from master_diet md where md.diet_id = ${diet_id} ) 
    and pd.id = pawpbdpa.activity_master_details_id`);

    return Response.handle(req, res, "approvedDietActivityList", 200, {
      status: true,
      data: object.rows,
    });
  } catch (e) {
    return Exception.handle(e, res, req, "approvedDietActivityList");
  }
};

exports.updatedietList = async (req, res) => {
  const { update, diet_id } = req.body;
  //const updated_by = req.auth.user.id;
  const updated_at = DTime.create().format("Y-m-d H:M:S");
  const apiYear = req?.headers?.api_year;
  const created_by = req.auth.user.id;
  try {
    //const id = update.map((c) => c.prb_ann_wrk_pln_bdgt_data_physical_asset_id);

    //const inClause = id?.join(", ");
    if (diet_id && apiYear) {
      const updateOtherRecordsQuery = await Model.knx().raw(
        `update public.prb_ann_wrk_pln_bdgt_data_physical_asset ast set applicable_yn = '0',quantity=0, unit_cost=0, financial_quantity=0, updated_by=${created_by}, updated_at='${updated_at}'  where asset_code in (select md.diet_code  from master_diet md where md.diet_id = ${diet_id} ) and plan_year ='${apiYear}'`
      );

      if (update.length !== 0) {
        for (let i = 0; i < update.length; i++) {
          const object = await Model.knx().raw(
            `update public.prb_ann_wrk_pln_bdgt_data_physical_asset ast set applicable_yn = '1', quantity=${update[i]["quantity"]}, unit_cost=${update[i]["unit_cost"]}, financial_quantity=${update[i]["financial_quantity"]}, updated_by=${created_by}, updated_at='${updated_at}'  where prb_ann_wrk_pln_bdgt_data_physical_asset_id = ${update[i]["prb_ann_wrk_pln_bdgt_data_physical_asset_id"]} and plan_year = '${apiYear}'`
          );

          await Model.knx().raw(`INSERT INTO public.prb_ann_wrk_pln_bdgt_data 
                                (state,district, activity_master_details_id, 
                                status, scheme_id, sub_component_id, major_component_id, activity_master_id, 
                                physical_quantity, financial_amount,unit_cost, 
                                plan_year, created_by)
                                select state,district , activity_master_details_id, 
                                6,scheme_id, sub_component_id, major_component_id, activity_master_id,
                                coalesce (sum(quantity),0) ,coalesce (sum( financial_quantity),0) ,sum( financial_quantity)/nullif(sum(quantity),0),
                                '${apiYear}', ${created_by}
                                from public.prb_ann_wrk_pln_bdgt_data_physical_asset pawpbdpa   
                                where asset_code in (select md.diet_code  from master_diet md where md.diet_id = ${diet_id} ) and plan_year ='${apiYear}'
                                group by state,district, activity_master_details_id, scheme_id, plan_year,  sub_component_id, major_component_id, activity_master_id
                                on conflict (activity_master_details_id, state, district, plan_year)
                                do update 
                                set physical_quantity = excluded.physical_quantity,
                                financial_amount = excluded.financial_amount,
                                unit_cost= excluded.unit_cost,
                                updated_by=  ${created_by}`);
          // const object = await Model.knx().raw(`update public.prb_ann_wrk_pln_bdgt_data_physical_asset ast set applicable_yn = '1'  where prb_ann_wrk_pln_bdgt_data_physical_asset_id in (${ inClause }) and plan_year = '${apiYear}'`
          // );
        }
      }
    }
    return Response.handle(req, res, "updatedietList", 200, {
      status: true,
      message: "Data Updated Successfully",
    });
  } catch (e) {
    return Exception.handle(e, res, req, "updatedietList");
  }
};

exports.updateDietApprovePlan = async (req, res) => {
  const data = req.body;
  const updated_by = req.auth.user.id;
  const updated_at = DTime.create().format("Y-m-d H:M:S");
  const plan_year = req?.headers?.api_year;

  try {
    const afterUpdate = await Model.stateAssetForm()
      .where("prb_state_ann_wrk_pln_bdgt_data_physical_asset_id", data.id)
      .update({
        quantity: data.recomended_quantity,
        financial_quantity: data.recomended_financial_amount,
        unit_cost: data.recomended_unit_cost,
        updated_by: updated_by,
        updated_at: updated_at
      });

    const insert = await Model.knx()
      .raw(`INSERT INTO public.prb_state_ann_wrk_pln_bdgt_data
                          (state, activity_master_details_id, 
                          status,state_submission_status, scheme_id, sub_component_id, major_component_id, activity_master_id,  
                          proposed_physical_quantity, proposed_financial_amount, proposed_unit_cost,
                          plan_year, created_by)
                          
                          select state , activity_master_details_id, 
                          4,6,scheme_id, sub_component_id, major_component_id, activity_master_id,
                          sum(quantity) ,sum( financial_quantity) ,sum( financial_quantity)/nullif (sum(quantity) ,0),
                          '${plan_year}', ${updated_by}
                          from prb_state_ann_wrk_pln_bdgt_data_physical_asset psawpbdpa 
                          where asset_code in (select md.diet_code  from master_diet md where md.diet_id = ${data.diet_id} ) and plan_year ='${plan_year}'
                          group by state, activity_master_details_id, scheme_id, plan_year,  sub_component_id, major_component_id, activity_master_id
                          on conflict (state, activity_master_details_id, scheme_id, plan_year)
                          do update 
                          set proposed_physical_quantity = excluded.proposed_physical_quantity,
                          proposed_financial_amount = excluded.proposed_financial_amount,
                          proposed_unit_cost= excluded.proposed_unit_cost,
                          updated_by= ${updated_by},
                          updated_at= '${updated_at}'`);

    await Model.knx().raw(`with cte as (
                            select sum(physical_quantity) as physical_quantity, sum(financial_amount) as financial_amount, plan_year, activity_master_details_id, state 
                            from prb_ann_wrk_pln_bdgt_data pwd
                            where  pwd.sub_component_id = 222
                            and pwd.plan_year ='${plan_year}'
                            and pwd.state in (select state  from master_diet md where md.diet_id= ${data.diet_id})
                            group by plan_year, activity_master_details_id, state 
                             )
                             update prb_state_ann_wrk_pln_bdgt_data psad
                             set physical_quantity = cte.physical_quantity , 
                                 financial_amount = cte.financial_amount
                             from  cte 
                             where cte.state = psad.state 
                             and cte.activity_master_details_id = psad.activity_master_details_id 
                             and cte.plan_year = psad.plan_year 
                             and psad.sub_component_id = 222`);

    // const insert = await Model.knx().raw(`INSERT INTO public.prb_state_ann_wrk_pln_bdgt_data
    //                       (state, activity_master_details_id, status, scheme_id, sub_component_id, major_component_id, activity_master_id,

    //                         physical_quantity,financial_amount,unit_cost,

    //                       proposed_physical_quantity, proposed_financial_amount, proposed_unit_cost,
    //                        plan_year)

    //                       select psawpbdpa.state , psawpbdpa.activity_master_details_id,
    //                       1,psawpbdpa.scheme_id, psawpbdpa.sub_component_id, psawpbdpa.major_component_id, psawpbdpa.activity_master_id,

    //                       sum(pawpbdpa.quantity), sum(pawpbdpa.financial_quantity), sum(pawpbdpa.unit_cost),

    //                       sum(psawpbdpa.quantity) ,sum( psawpbdpa.financial_quantity) ,sum( psawpbdpa.financial_quantity)/nullif (sum(psawpbdpa.quantity) ,0),
    //                       '2024-2025'
    //                       from prb_ann_wrk_pln_bdgt_data_physical_asset pawpbdpa, prb_state_ann_wrk_pln_bdgt_data_physical_asset psawpbdpa
    //                       where psawpbdpa.asset_code in (select md.diet_code  from master_diet md where md.diet_id = 4501 )
    //                       group by psawpbdpa.state, psawpbdpa.activity_master_details_id, psawpbdpa.scheme_id, psawpbdpa.plan_year,  psawpbdpa.sub_component_id, psawpbdpa.major_component_id, psawpbdpa.activity_master_id
    //                       on conflict (state, activity_master_details_id, scheme_id, plan_year)
    //                       do update
    //                       set
    //                       physical_quantity = excluded.physical_quantity,
    //                       financial_amount = excluded.financial_amount,
    //                       unit_cost = excluded.unit_cost,
    //                       proposed_physical_quantity = excluded.proposed_physical_quantity,
    //                       proposed_financial_amount = excluded.proposed_financial_amount,
    //                       proposed_unit_cost= excluded.proposed_unit_cost`);

    return Response.handle(req, res, "updateDietApprovePlan", 200, {
      status: true,
      message: "Data Updated Successfully",
    });
  } catch (e) {
    return Exception.handle(e, res, req, "updateDietApprovePlan");
  }
};

exports.approveDietPlan = async (req, res) => {
  const data = req.body;
  const updated_by = req.auth.user.id;
  const updated_at = DTime.create().format("Y-m-d H:M:S");
  const plan_year = req?.headers?.api_year;

  try {
    const afterUpdate = await Model.stateAssetForm()
      .where("prb_state_ann_wrk_pln_bdgt_data_physical_asset_id", data.id)
      .update({
        quantity: data.recomended_quantity,
        financial_quantity: data.recomended_financial_amount,
        updated_by,
        updated_at,
      });

    const insert = await Model.knx()
      .raw(`INSERT INTO public.prb_state_ann_wrk_pln_bdgt_data
                          (state, activity_master_details_id, 
                          status, scheme_id, sub_component_id, major_component_id, activity_master_id, 
                          proposed_physical_quantity, proposed_financial_amount, 
                           plan_year)
                          
                          select state , activity_master_details_id, 
                          1,scheme_id, sub_component_id, major_component_id, activity_master_id,
                          sum(quantity) ,sum( financial_quantity) ,
                          '${plan_year}'
                          from prb_state_ann_wrk_pln_bdgt_data_physical_asset psawpbdpa 
                          where asset_code in (select md.diet_code  from master_diet md where md.diet_id = ${data.diet_id} )
                          group by state, activity_master_details_id, scheme_id, plan_year,  sub_component_id, major_component_id, activity_master_id
                          on conflict (state, activity_master_details_id, scheme_id, plan_year)
                          do update 
                          set proposed_physical_quantity = excluded.proposed_physical_quantity,
                          proposed_financial_amount = excluded.proposed_financial_amount`);

    return Response.handle(req, res, "approveDietPlan", 200, {
      status: true,
      message: "Data Updated Successfully",
    });
  } catch (e) {
    return Exception.handle(e, res, req, "approveDietPlan");
  }
};

exports.approveDIETConfigurationList = async (req, res) => {
  const { diet_id } = req.body;
  const updated_by = req.auth.user.id;
  const updated_at = DTime.create().format("Y-m-d H:M:S");
  const apiYear = req?.headers?.api_year;

  try {
    if (diet_id && apiYear) {
      await Model.knx().raw(`update prb_ann_wrk_pln_bdgt_data set status = 6 
                             where district in (select md.district_id from master_diet md where md.diet_id = ${diet_id} )
                             and plan_year = '${apiYear}' and sub_component_id = 222`);
    }
    return Response.handle(req, res, "approveDIETConfigurationList", 200, {
      status: true,
      message: "Data Approved Successfully",
    });
  } catch (e) {
    return Exception.handle(e, res, req, "approveDIETConfigurationList");
  }
};

exports.dietFundList = async (req, res) => {
  const { diet_id, state_id } = req.body;
  const updated_by = req.auth.user.id;
  const updated_at = DTime.create().format("Y-m-d H:M:S");
  const apiYear = req?.headers?.api_year;

  try {
    const object = await Model.knx().raw(
      `select * from diet_budget_received where plan_year = '${apiYear}' and diet_id =${diet_id} and state_id=${state_id}`
    );

    return Response.handle(req, res, "dietFundList", 200, {
      status: true,
      data: object.rows,
    });
  } catch (e) {
    return Exception.handle(e, res, req, "dietFundList");
  }
};

exports.draftPABData = async (req, res) => {
  try {
    const { state_id } = req.body;
    const planYear = req?.headers?.api_year;
    const stateID = state_id;
    if (stateID && planYear) {
      object = await Model.knx().raw(`select dd.*, bb.coordinatorRemarks
			from
				( (
				select
					round(bb.financial_amount, 5) as financialAmount,
					round(bb.unit_cost, 5)as unitCost,
					bb.physical_quantity::numeric as physicalQuantity,
					round(bb.proposed_financial_amount, 5) as proposedFinancialAmount,
					round(bb.proposed_unit_cost, 5)as proposedUnitCost,
					bb.proposed_physical_quantity::numeric as proposedPhysicalQuantity,
					case
						when (bb.activity_master_id is null ) then 888888
						else bb.activity_master_id
					end as activityMasterId,
					case
						when (bb.sub_component_id is null ) then 777777
						else bb.sub_component_id
					end as subComponentId,
					case
						when (bb.major_component_id is null ) then 666666
						else bb.major_component_id
					end as majorComponentId,
					case
						when (bb.scheme_id is null ) then '555555'
						else bb.scheme_id
					end as schemeId,
					case
						when (bb.activity_master_details_id is null ) then 999999
						else bb.activity_master_details_id
					end as activityMasterDetailsId,
					case
						when (pd.recuring_nonrecuring = 1 ) then 'R'
						when (pd.recuring_nonrecuring = 2) then 'NR'
						else 'NA'
					end as recuringNonrecuring,
					ps.title as schemeName,
					pmc.title as majorComponentName ,
					psc.title as subComponentName ,
					pam.title as activityMasterName ,
					pd.activity_master_details_name as activityMasterDetailName,
					pd.serial_order
				from
					(
					select
						cc.scheme_id,
						cc.major_component_id,
						cc.sub_component_id,
						cc.activity_master_id,
						cc.activity_master_details_id,
						sum(financial_amount) as financial_amount,
						sum(physical_quantity) as physical_quantity,
						sum(financial_amount)/ nullif(sum(physical_quantity), 0) as unit_cost,
						sum(proposed_financial_amount) as proposed_financial_amount,
						sum(proposed_physical_quantity) as proposed_physical_quantity,
						sum(proposed_financial_amount)/ nullif(sum(proposed_physical_quantity), 0) as proposed_unit_cost
					from
						(
						select
							pawpbd.scheme_id,
							pawpbd.major_component_id,
							pawpbd.sub_component_id,
							pawpbd.activity_master_id,
							pawpbd.activity_master_details_id,
							pawpbd.financial_amount as financial_amount,
							pawpbd.physical_quantity as physical_quantity,
							pawpbd.financial_amount / nullif(pawpbd.physical_quantity, 0) as unit_cost,
							pawpbd.proposed_financial_amount as proposed_financial_amount,
							pawpbd.proposed_physical_quantity as proposed_physical_quantity,
							pawpbd.proposed_financial_amount / nullif(pawpbd.proposed_physical_quantity, 0) as proposed_unit_cost
						from
							prb_state_ann_wrk_pln_bdgt_data pawpbd
						where
							pawpbd.state = ${stateID}
							and pawpbd.plan_year = '${planYear}'
							 ) cc
					group by
						grouping sets ((cc.scheme_id,
						cc.major_component_id,
						cc.sub_component_id,
						cc.activity_master_id,
						cc.activity_master_details_id),
						(cc.scheme_id,
						cc.major_component_id,
						cc.sub_component_id,
						cc.activity_master_id),
						(cc.scheme_id,
						cc.major_component_id,
						cc.sub_component_id),
						(cc.scheme_id,
						cc.major_component_id),
						(cc.scheme_id),
						()) ) bb
				left join prb_data pd on
					(pd.id = bb.activity_master_details_id)
				left join prb_activity_master pam on
					(pam.id = bb.activity_master_id)
				left join prb_sub_component psc on
					(psc.sub_component_id = bb.sub_component_id)
				left join prb_major_component pmc on
					(pmc.prb_major_component_id = bb.major_component_id)
				left join prb_schemes ps on
					(ps.id = bb.scheme_id::numeric)) dd
			left join (
				select
					activity_master_details_id,
					coordinator_remarks as coordinatorRemarks
				from
					prb_state_ann_wrk_pln_bdgt_data ab
				where
					ab.plan_year = '${planYear}'
					and ab.state = ${stateID}) bb on
				(bb.activity_master_details_id = dd.activityMasterDetailsId))
				where proposedfinancialamount >0
			order by
				dd.schemeId ,
				dd.majorComponentId ,
				dd.subComponentId ,
				dd.activityMasterId ,
				dd.activityMasterDetailsId,
				dd.serial_order`);
    } else {
      object = { rows: [] };
    }

    return Response.handle(req, res, "draftPABData", 200, {
      status: true,
      data: object.rows,
    });
  } catch (e) {
    return Exception.handle(e, res, req, "draftPABData");
  }
};

exports.submitApprovedDIETPlan = async (req, res) => {
  const data = req.body;
  const updated_by = req.auth.user.id;
  const updated_at = DTime.create().format("Y-m-d H:M:S");
  const plan_year = req?.headers?.api_year;

  try {
    const insert = await Model.knx()
      .raw(`update prb_state_ann_wrk_pln_bdgt_data_physical_asset set status = 6, updated_by = ${updated_by}, updated_at = '${updated_at}'
                          where district in (select md.district_id from master_diet md where md.diet_id = ${data.diet_id} )
                          and plan_year = '${plan_year}' and sub_component_id = 222`);

    return Response.handle(req, res, "submitApprovedDIETPlan", 200, {
      status: true,
      message: "Data Approved Successfully",
    });
  } catch (e) {
    return Exception.handle(e, res, req, "submitApprovedDIETPlan");
  }
};
