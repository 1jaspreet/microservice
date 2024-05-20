const express = require("express");
const routers = express.Router();
const Model = require("../../models");
const PDF = require("../../handlers").Pdf;
const Helper = require("../../helpers/Common");
const THelper = require("../../helpers/Helper");
const Handler = require("../../handlers").School;
const Models = require("../../models").School;
const SCRModel = require("../../models").Prabandh;

routers.post("/users", async (req, res) => {
  const request = req.body;
  //const udise     =   ['udise_code as UdiseCode'];
  const state = ["ms.name as StateName"];
  const district = ["md.name as DistrictName"];
  var select = [
    "u.name as Name",
    "email as Email",
    "mobile as Mobile",
    "mr.name as Role",
    "u.permission",
  ];
  var Query = Model.User.query().join(
    "master_roles as mr",
    "mr.id",
    "=",
    "u.role_id"
  );
  var SName = null;
  var DName = null;

  if (request.role > 2) {
    var Query = Query.join("master_states as ms", "ms.id", "=", "u.state_id");
    var select = [...select, ...state];
    if (request.role > 5) {
      var select = [...select, ...district];
      var Query = Query.join(
        "master_districts as md",
        "md.id",
        "=",
        "u.district_id"
      );
    }
    if (request.state > 0) {
      var SName = (await Model.State.findOne({ id: request.state })).name;
      var Query = Query.where("u.state_id", request.state);
    }
    if (request.district > 0) {
      var DName = (
        await Model.District.findOne({
          id: request.district,
          state_id: request.state,
        })
      ).name;
      var Query = Query.where("u.district_id", request.district).orderBy(
        "md.name",
        "ASC"
      );
    }
  }

  const data = await Query.select(select)
    .whereNot({ "u.role_id": 7 })
    .orderBy("u.udise_code", "ASC");
  const role = (await Model.Role.findOne({ id: request.role })).name;

  req.data = {
    fname: "users",
    list: data,
    role: role,
    state: SName,
    district: DName,
    role_id: request.role,
    district_id: request.district,
    state_id: request.state,
    template: "users",
  };
  return PDF.handle(req, res);
});

routers.post("/schools-selected", async (req, res) => {
  const request = req.body;
  const select = [
    "udise_code",
    "school_name",
    "district_name",
    "block_name",
    "class_frm",
    "class_to",
    "mc.name as category_name",
    "location_type",
  ];
  var Query = Model.Benchmark.query().join(
    "master_categories as mc",
    "mc.id",
    "=",
    "bs.pmshri_category_id"
  );
  var SName = null;
  var DName = null;
  var FName = "schools-selected";

  if (request.state > 0) {
    var SName = (await Model.State.findOne({ id: request.state })).name;
    var Query = Query.where("state_id", request.state);
    var FName = SName;
  }
  if (request.district > 0) {
    var DName = (
      await Model.District.findOne({
        id: request.district,
        state_id: request.state,
      })
    ).name;
    var Query = Query.where("district_id", request.district);
    var FName = SName + "-" + DName;
  }

  var Query =
    request.district == 0
      ? Query.orderBy("district_name", "ASC")
      : Query.orderBy("udise_code", "ASC");

  const data = await Query.select(select).where("district_selection", 1);

  req.data = {
    fname: FName,
    list: data,
    state: SName,
    district: DName,
    template: "schools-selected",
    role_id: request.role,
    district_id: request.district,
    state_id: request.state,
  };
  return PDF.handle(req, res);
});

routers.post("/school-sample-form", async (req, res) => {
  const { udise } = req.body;
  const select = [
    "udise_code",
    "school_name",
    "block_name",
    "district_name",
    "state_name",
    "mgmt_center_id",
    "location_type",
    "final_flag",
    "school_medium",
    "drink_water",
    "pucca_building",
    "electricity",
    "toilet_functional",
    "class_frm",
    "class_to",
    "total_enrolment",
    "school_type",
    "total_teacher",
    "email",
    "mobile",
    "school_head",
    "msd.name as head_designation",
    "mc.name as category_name",
    "pmshri_category_id",
    "schemes_id",
    "mc.slug as cat_slug",
  ];

  const data = await Model.Benchmark.query()
    .select(select)
    .where({ udise_code: udise })
    .join("master_categories as mc", "mc.id", "=", "bs.pmshri_category_id")
    .join(
      "master_school_designations as msd",
      "msd.id",
      "=",
      "bs.head_designation"
    );

  const LScheme = JSON.parse("[" + data[0].schemes_id + "]");
  const schemes = await Model.Scheme.query()
    .select("id", "name", "hindi_name")
    .whereIn("id", LScheme)
    .orderBy("order");

  const questions = await Model.SchemeQuestion.query()
    .select(
      "msq.id",
      "msq.schemes_id",
      "msq.name",
      "msq.hindi_question",
      `${data[0].cat_slug}_mark as marks`
    )
    .join(
      "scheme_question_markings as sqm",
      "sqm.scheme_questions_id",
      "=",
      "msq.id"
    )
    .whereIn("msq.schemes_id", LScheme)
    .orderBy("msq.order");

  req.data = {
    fname: "school-sample-form",
    list: data,
    template: "school-sample-form",
    schemes: schemes,
    questions: questions,
  };

  return PDF.handle(req, res);
});

routers.post("/school-application-field", async (req, res) => {
  const { udise } = req.body;
  const select = [
    "bs.udise_code",
    "school_name",
    "block_name",
    "district_name",
    "state_name",
    "mgmt_center_id",
    "location_type",
    "final_flag",
    "su.id as school_id",
    "school_medium",
    "drink_water",
    "pucca_building",
    "electricity",
    "toilet_functional",
    "class_frm",
    "class_to",
    "total_enrolment",
    "school_declaration",
    "school_type",
    "total_teacher",
    "bs.email",
    "bs.mobile",
    "school_head",
    "msd.name as head_designation",
    "mc.name as category_name",
    "pmshri_category_id",
    "schemes_id",
    "back_image",
    "front_image",
    "panchayat_letter",
    "commitment_letter",
  ];

  const data = await Model.Benchmark.query()
    .select(select)
    .where({ "bs.udise_code": udise })
    .join("master_categories as mc", "mc.id", "=", "bs.pmshri_category_id")
    .join(
      "master_school_designations as msd",
      "msd.id",
      "=",
      "bs.head_designation"
    )
    .join("school_users as su", "su.udise_code", "=", "bs.udise_code");

  const LScheme = JSON.parse("[" + data[0].schemes_id + "]");
  const schemes = await Model.Scheme.query()
    .select(
      "sc.id",
      "sc.name",
      "sc.hindi_name",
      "sc.score",
      "sc.question_count",
      "ssw.school_marks as obtain_marks",
      "ssw.created_at as submit_date"
    )
    .join("school_section_wises as ssw", "ssw.schemes_id", "=", "sc.id")
    .whereIn("sc.id", LScheme)
    .orderBy("sc.order")
    .where("ssw.udise_code", data[0].udise_code);

  const questions = await Model.SchemeQuestion.query()
    .select(
      "msq.id",
      "msq.schemes_id",
      "msq.name",
      "msq.hindi_question",
      "sqm.marks",
      "sqm.answer"
    )
    .join("school_question_markings as sqm", "sqm.questions_id", "=", "msq.id")
    .where("sqm.udise_code", data[0].udise_code);

  req.data = {
    fname: data[0].school_name + "-" + udise,
    list: data,
    template: "school-application-field",
    schemes: schemes,
    questions: questions,
  };

  return PDF.handle(req, res);
});

routers.post("/volunteer-activitiy-certificate", async (req, res) => {
  const request = req.body;
  const auth = THelper.decodeToken(req);
  const select = [
    "ac.id",
    "ms.udise_code",
    "ms.school_name",
    "ms.school_state_id",
    "ms.school_district_id",
    "mac.activity_sub_category_name as contribution_name",
    "ac.activity_last_reciving_date as LDate",
    "ac.activity_tentative_start_date as TDate",
  ];

  var Query = Model.VolunteersActivities.query()
    .leftJoin(
      "school_activities_posts as ac",
      "ac.id",
      "=",
      "av.school_activity_post_id"
    )
    .leftJoin("master_schools as ms", "ms.id", "=", "ac.school_id")
    .leftJoin(
      "master_activity_sub_categories as mac",
      "mac.id",
      "=",
      "ac.activity_sub_category_id"
    );

  const object = await Query.select(select).where({
    "av.id": request.id,
    "av.volunteer_id": request.volunteerId,
    "av.application_status": request.status,
  });
  const activitiy = object[0];
  const date =
    activitiy.TDate === null ||
    activitiy.TDate === "" ||
    activitiy.TDate === "0000-00-00"
      ? activitiy.LDate
      : activitiy.TDate;

  //: UID/ACT/DIS/ST/UDISE
  const values = {
    school_name: activitiy.school_name,
    contribution_name: activitiy.contribution_name,
    complete_date: Helper.getDate("d f, Y", date),
    volunteer_name: request.volunteer_name,
    crt_number: `${auth.user.id}/${activitiy.id}/${activitiy.school_district_id}/${activitiy.school_state_id}/${activitiy.udise_code}`,
  };

  req.data = {
    fname: "certificate",
    value: values,
    template: "volunteer-certificate",
  };

  return PDF.certificate(req, res);
});

routers.post("/volunteer-contribution-certificate", async (req, res) => {
  const request = req.body;
  const auth = THelper.decodeToken(req);
  const select = [
    "acp.id",
    "ms.udise_code",
    "ms.school_name",
    "ms.school_state_id",
    "ms.school_district_id",
    "ms.school_name",
    "mac.asset_sub_category_name as contribution_name",
    "acp.asset_expected_date as LDate",
    "acp.asset_last_application_date as TDate",
  ];

  var Query = Model.ContributionVolunteers.query()
    .leftJoin(
      "school_assets_posts as acp",
      "acp.id",
      "=",
      "cv.school_assets_post_id"
    )
    .leftJoin("master_schools as ms", "ms.id", "=", "acp.school_id")
    .leftJoin(
      "master_asset_sub_categories as mac",
      "mac.id",
      "=",
      "acp.asset_sub_category_id"
    );

  const object = await Query.select(select).where({
    "cv.id": request.id,
    "cv.volunteer_id": request.volunteerId,
    "cv.application_status": request.status,
  });

  if (object !== null) {
    const contribution = object[0];
    const date =
      contribution.TDate === null ||
      contribution.TDate === "" ||
      contribution.TDate === "0000-00-00"
        ? contribution.LDate
        : contribution.TDate;
    const values = {
      school_name: contribution.school_name,
      contribution_name: contribution.contribution_name,
      complete_date: Helper.getDate("d f, Y", date),
      volunteer_name: request.volunteer_name,
      crt_number: `${auth.user.id}/${contribution.id}/${contribution.school_district_id}/${contribution.school_state_id}/${contribution.udise_code}`,
    };

    req.data = {
      fname: "certificate",
      value: values,
      template: "volunteer-certificate",
    };

    return PDF.certificate(req, res);
  }
});

routers.post("/acknowledgement", async (req, res) => {
  res.download(
    req.ENV.DOWNLOAD_PATH + "2023-02-19-11-49-03-school-sample-form.pdf"
  );
});

// NTIIN WORK THIS PART
routers.get("/mastercommondatapdf", async (req, res) => {
  const select = [
    "title",
    "type_code",
    "district_id",
    "state_id",
    "block_id",
    "links_to_school",
    "description",
    "status",
    "udise_code",
  ];

  const data = await Model.Mastercommondata.query().select(select);
  req.data = {
    fname: "mastercommondata",
    list: data,
    template: "mastercommondata",
    schemes: data,
    questions: data,
  };
  return PDF.handle(req, res);
});

routers.post("/annualreport", async (req, res) => {
  const { state_id, district_id } = req.body;
  if (state_id === 0 && district_id === 0) {
    const data = await Models.ReportDatas({});
    req.data = { fname: "annualReport", list: data, template: "annualreport" };
    return PDF.handleReport(req, res);
  } else if (state_id !== 0 && district_id === 0) {
    const data = await Models.ReportDtstate(state_id);
    req.data = { fname: "annualReport", list: data, template: "annualreport" };
    return PDF.handleReport(req, res);
  } else {
    const data = await Models.ReportDt(state_id, district_id);
    req.data = { fname: "annualReport", list: data, template: "annualreport" };
    return PDF.handleReport(req, res);
  }
});

routers.post("/report", async (req, res) => {
  return PDF.handlePdfReport(req, res);
});

routers.post("/submitedplans", async (req, res) => {
  const apiYear = req.headers?.api_year;
  const apiVersion = req.headers?.api_version;

  const request = req.body;

  const { state_id, district_id } = request;
  const object = await Model.Prabandh.knx().raw(`select pd.scheme_name , 
            pd.major_component_name , 
            pd.sub_component_name , 
            pd.activity_master_name, 
            pd.activity_master_details_name ,
            sum(pawpbd.financial_amount) financial_amount, 
            sum(pawpbd.physical_quantity) physical_quantity ,
            max(pawpbd.uom) as uom, 
            max(pawpbd.unit_cost) as unit_cost, 
            max(pawpbd.status) as status
    from public.prb_ann_wrk_pln_bdgt_data pawpbd , prb_data pd 
    where pd.id = pawpbd.activity_master_details_id and pawpbd.state = ${state_id} and pawpbd.district = ${district_id} and pawpbd.plan_year = '${apiYear}'
    group by pd.serial_order, pd.scheme_name , pd.major_component_name , pd.sub_component_name , pd.activity_master_name, pd.activity_master_details_name  
    order by pd.serial_order, pd.scheme_name , pd.major_component_name , pd.sub_component_name , pd.activity_master_name, pd.activity_master_details_name `);
  req.data = {
    fname: "annualReport",
    list: object.rows,
    template: "annualreport",
  };

  return PDF.handleReport(req, res);
});

routers.post("/submitstateplan", async (req, res) => {
  // const {
  //     state_id,
  //     scheme_id,
  //     major_component_id,
  //     // sub_component_id,
  //     // activity_master_id,
  //     // activity_master_details_id,
  // } = req.body;
  // console.log("req.body=====>>>", req.body)
  // let where = ``;
  // if (state_id) {
  //     where += ` and pawpbso.state = ${state_id}`;
  // }
  // if (+scheme_id > 0) {
  //     where += ` and pawpbso.scheme_id = '${scheme_id}'`;
  // }
  // if (+major_component_id > 0) {
  //     where += ` and pawpbso.major_component_id = ${major_component_id}`;
  // }
  // // if (sub_component_id) {
  // //     where += ` and pawpbso.sub_component_id = ${sub_component_id}`;
  // // }
  // // if (activity_master_id) {
  // //     where += ` and pawpbso.activity_master_id = ${activity_master_id}`;
  // // }
  // // if (activity_master_details_id) {
  // //     where += ` and pawpbso.activity_master_details_id = ${activity_master_details_id}`;
  // // }
  // const data = await Model.Prabandh.knx().raw(`
  //                     select
  //                     pawpbso.prb_ann_wrk_pln_bdgt_prev_progress_id,
  //                     pawpbso.budget_quantity,
  //                     pawpbso.budget_amount,
  //                     pawpbso.progress_quantity,
  //                     pawpbso.progress_amount,
  //                     pd.scheme_name , pd.major_component_name , pd.sub_component_name , pd.activity_master_name , pd.activity_master_details_name
  //                     from prb_ann_wrk_pln_bdgt_prev_progress pawpbso , prb_data pd
  //                     where pawpbso.activity_master_details_id = pd.id ${where}`);
  // console.log("data:::::",data)

  const {
    user: { user_role_id },
    state_id,
    district_id,
    scheme_id,
    major_component_id: mcid,
    sub_component_id: scid,
    activity_master_id,
    activity_master_details_id,
  } = req.body;

  const apiYear = req.headers?.api_year;
  const apiVersion = req.headers?.api_version;
  const subquery = Model.Prabandh.knx()
    .select([
      Model.Prabandh.knx().raw("sum(physical_quantity) as physical_quantity"),
      Model.Prabandh.knx().raw("sum(financial_amount) as financial_amount"),
      Model.Prabandh.knx().raw(
        "sum(proposed_financial_amount) as proposed_financial_amount"
      ),
      Model.Prabandh.knx().raw("max(pawpbd.status) as status"),
      Model.Prabandh.knx().raw(
        "sum(proposed_physical_quantity) as proposed_physical_quantity"
      ),
      Model.Prabandh.knx().raw("max(proposed_unit_cost) as proposed_unit_cost"),
      Model.Prabandh.knx().raw(
        "sum(financial_amount) / nullif( sum(physical_quantity),0) as unit_cost "
      ),
      "activity_master_details_id",
      // Model.Prabandh.knx().raw("md.district_name as district_name"),
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
        builder.andWhere("pawpbd.activity_master_id", "=", activity_master_id);
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

  let object = await Model.Prabandh.knx()
    .select("*")
    .from(function () {
      this.from(subquery).as("sq");
    })
    .leftJoin("prb_data as pd", "pd.id", "=", "sq.activity_master_details_id")
    .orderBy("pd.serial_order", "asc");

  // let object = await Model.Prabandh.knx()
  //   .select("*")
  //   .from(function () {
  //     this.from(subquery).as("sq");
  //   })
  //   .leftJoin("prb_data as pd", "pd.id", "=", "sq.activity_master_details_id")
  //   .orderBy("pd.serial_order", "asc");
  const quantity =
    object &&
    object.reduce((accumulator, currentValue) => {
      return accumulator + +currentValue.physical_quantity;
    }, 0);
  const financial_amount =
    object &&
    object.reduce((accumulator, currentValue) => {
      return accumulator + +currentValue.financial_amount;
    }, 0);
  // res
  //     .status(200)
  //     .json({ status: true, data: object && object });
  req.data = {
    fname: "submittedstateplan",
    list: object && object,
    quantity: quantity,
    financial_amount: financial_amount,
    template: "submittedstateplan",
  };
  return PDF.handleReport(req, res);
});

routers.post("/submitstateactivity", async (req, res) => {
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

  let object = await Model.Prabandh.knx()
    .select([
      "dd_school",
      "activity_master_details_id",
      "district",
      "district_name",
      "physical_quantity",
      "unit_cost",
      Model.Prabandh.knx().raw(
        `financial_amount::numeric(16,5) as financial_amount`
      ),
      "pawpbd.id",
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
        builder.andWhere("pawpbd.activity_master_id", "=", activity_master_id);
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

  const object2 = await Model.Prabandh.knx()
    .raw(
      `select min(status) as approved_status from prb_ann_wrk_pln_bdgt_data where state= ${state_id} and district = ${
        district_id == null ? 0 : district_id
      } and plan_year = '${apiYear}'`
    )
    .then();
  // let object = await Model.Prabandh.knx()
  //   .select("*")
  //   .from(function () {
  //     this.from(subquery).as("sq");
  //   })
  //   .leftJoin("prb_data as pd", "pd.id", "=", "sq.activity_master_details_id")
  //   .orderBy("pd.serial_order", "asc");
  const quantity =
    object &&
    object.reduce((accumulator, currentValue) => {
      return accumulator + +currentValue.physical_quantity;
    }, 0);
  const financial_amount =
    object &&
    object.reduce((accumulator, currentValue) => {
      return accumulator + +currentValue.financial_amount;
    }, 0);
  // res
  //     .status(200)
  //     .json({ status: true, data: object && object });
  req.data = {
    fname: "vieweditactivityplan",
    list: object && object,
    quantity: quantity,
    financial_amount: financial_amount,
    template: "vieweditactivityplan",
  };
  return PDF.handleReport(req, res);
});
routers.post("/snodistrictreport", async (req, res) => {
  const { state_id, district_id } = req.body;
  const apiYear = req.headers?.api_year;
  const apiVersion = req.headers?.api_version;

  const object = await Model.Prabandh.knx().raw(`select pd.scheme_name , 
                                            pd.major_component_name , 
                                            pd.sub_component_name , 
                                            pd.activity_master_name, 
                                            pd.activity_master_details_name ,
                                            sum(pawpbd.financial_amount) financial_amount, 
                                            sum(pawpbd.physical_quantity) physical_quantity ,
                                            max(pawpbd.uom) as uom, 
                                            max(pawpbd.unit_cost) as unit_cost, 
                                            max(pawpbd.status) as status
                                            from public.prb_ann_wrk_pln_bdgt_data pawpbd , prb_data pd 
                                            where pd.id = pawpbd.activity_master_details_id and pawpbd.state = ${state_id} and pawpbd.district = ${district_id} and pawpbd.plan_year = '${apiYear}'
                                            group by pd.serial_order, pd.scheme_name , pd.major_component_name , pd.sub_component_name , pd.activity_master_name, pd.activity_master_details_name  
                                            order by pd.serial_order, pd.scheme_name , pd.major_component_name , pd.sub_component_name , pd.activity_master_name, pd.activity_master_details_name `);
  // res
  //     .status(200)
  //     .json({ status: true, data: object && object.rows });
  req.data = {
    fname: "annualReport",
    list: object && object?.rows,
    template: "annualReport",
  };
  return PDF.handleReport(req, res);
});

routers.post("/financialpdf", async (req, res) => {
  const { state_id, district_id, state_name, district_name } = req.body;
  const apiYear = req.headers?.api_year;
  const apiVersion = req.headers?.api_version;

  let dt = [
    {
      id: 1,
      value: "Nodal officer",
      label: "D.N.O.",
      email: "email123@gmail.com",
      mobile: "7894561230",
    },
    {
      id: 1,
      value: "District",
      label: "Data Entry Operator",
      email: "email123@gmail.com",
      mobile: "7894561230",
    },
    {
      id: 1,
      value: "District",
      label: "Data Approver",
      email: "email123@gmail.com",
      mobile: "7894561230",
    },
    {
      id: 1,
      value: "District",
      label: "Data Viewer",
      email: "email123@gmail.com",
      mobile: "7894561230",
    },
  ];
  let d = { id: 1, state_name: state_name, district_name: district_name };
  let whereQ = "";
  // if (where && where.value) {
  //   whereQ = `and (pd.scheme_name ilike '%${where?.value}%' or pd.major_component_name ilike '%${where?.value}%') `;
  // }

  if (apiYear !== "") {
    whereQ += `and pawpbd.plan_year ='${apiYear}'`;
  }

  if (state_id) {
    whereQ += `and pawpbd.state ='${state_id}'`;
  }

  if (district_id) {
    whereQ += `and pawpbd.district ='${district_id}'`;
  }

  // const object = await Model.Prabandh.knx()
  //   .raw(`select pmc.*,pmc.title  as major_component_name, aa.financial_amount ,
  //   case
  //   when pmc.scheme_id ='1' then 'Elementary Education'
  //   when pmc.scheme_id ='2' then 'Secondary Education'
  //   when pmc.scheme_id ='3' then 'Teacher'
  //   else 'Other' end as scheme_name
  // from
  // (select sum(financial_amount) as financial_amount , scheme_id ,major_component_id
  //     from prb_ann_wrk_pln_bdgt_data pawpbd
  //     where 1 =  1
  //     ${whereQ}
  //     group by scheme_id , major_component_id
  //   ) aa left join  prb_major_component pmc
  //   on(aa.scheme_id::numeric= pmc.scheme_id and aa.major_component_id= pmc.prb_major_component_id)`);

  const select = await Model.Prabandh.knx().raw(`select
    pmc.*,
    pmc.title as major_component_name,
    aa.financial_amount_recuring ,
    aa.financial_amount_nonrecuring,
    case
      when pmc.scheme_id = '1' then 'Elementary Education'
      when pmc.scheme_id = '2' then 'Secondary Education'
      when pmc.scheme_id = '3' then 'Teacher'
      else 'Other'
    end as scheme_name from
    (
    select
      sum(financial_amount) filter(
      where pd.recuring_nonrecuring = 1) as financial_amount_recuring ,
      sum(financial_amount) filter(
      where pd.recuring_nonrecuring = 2) as financial_amount_nonrecuring ,
      pd.scheme_id ,
      pd.major_component_id
    from
      prb_ann_wrk_pln_bdgt_data pawpbd ,
      public.prb_data pd
    where
      pawpbd.activity_master_details_id = pd.id
      ${whereQ}
    group by
      pd.scheme_id ,
      pd.major_component_id 
        ) aa
  left join prb_major_component pmc 
        on
    (aa.scheme_id::numeric = pmc.scheme_id
      and aa.major_component_id = pmc.prb_major_component_id)`);
  req.data = {
    fname: "financialsheet",
    list: select && select?.rows,
    template: "financialsheet",
    domy: dt,
    header: d,
  };
  return PDF.handleReport(req, res);
});

routers.post("/viewplans", async (req, res) => {
  const request = req.body;
  const { state_id, district_id, get, role } = request;
  const apiYear = req.headers?.api_year;
  let col;
  // if (getType === "all") {
  //   col = [
  //     { id: 1, label: "Scheme" },
  //     { id: 2, label: "Major Component" },
  //     { id: 3, label: "Sub Component" },
  //     { id: 4, label: "Activity Master" },
  //     { id: 5, label: "Activity Master Detail" },
  //     { id: 5, label: "Recurring Type" },
  //   ];
  //   obj = await Model.Prabandh.knx()
  //     .select(
  //       Model.Prabandh.knx().raw(
  //         "ROW_NUMBER() OVER (ORDER BY pd.serial_order) AS row_number"
  //       ),
  //       "pd.scheme_name",
  //       "pd.major_component_name",
  //       "pd.sub_component_name",
  //       "pd.activity_master_name",
  //       "pd.activity_master_details_name",
  //       Model.Prabandh.knx().raw(
  //         "CASE WHEN pd.recuring_nonrecuring = 1 THEN 'RECURRING' ELSE 'NON RECURRING' END AS recuring_nonrecuring"
  //       )
  //     )
  //     .from("prb_plan_configurator as ppc")
  //     .join("prb_data as pd", function () {
  //       this.on(
  //         Model.Prabandh.knx().raw(
  //           "pd.id::numeric = ppc.activity_detail_id::numeric"
  //         )
  //       );
  //     })
  //     .where("ppc.state_id", state_id)
  //     .andWhere("ppc.district_id", district_id)
  //     .andWhere("ppc.final_submit", "2")
  //     .orderBy("pd.serial_order");

  //   let countObj = await Model.Prabandh.knx()
  //     .count("* as count")
  //     .from("prb_plan_configurator as ppc")
  //     .join("prb_data as pd", function () {
  //       this.on(
  //         Model.Prabandh.knx().raw(
  //           "pd.id::numeric = ppc.activity_detail_id::numeric"
  //         )
  //       );
  //     })
  //     .where("ppc.state_id", state_id)
  //     .andWhere("ppc.district_id", district_id)
  //     .andWhere("ppc.final_submit", "2")
  //     .first();
  //   object = { count: countObj.count, data: obj };
  //   req.data = {
  //     fname: "viewplanfile",
  //     list: obj,
  //     column: col,
  //     template: "viewplanfile",
  //   };
  //   return PDF.handleReport(req, res);
  // } else if (getType === "allgrouped") {
  //   if ([8, 9, 10].includes(role)) {
  //     col = [
  //       { id: 1, label: "Scheme Name" },
  //       { id: 2, label: "Major Component " },
  //       { id: 3, label: "Sub Component " },
  //       { id: 4, label: "Activity" },
  //     ];
  //     obj = await Model.Prabandh.knx()
  //       .select(
  //         "pd.scheme_id",
  //         "pd.scheme_name",
  //         "pd.major_component_id",
  //         "pd.major_component_name",
  //         "pd.sub_component_id",
  //         "pd.sub_component_name",
  //         "pd.activity_master_id",
  //         "pd.activity_master_name",
  //         "pam.drill_down_flag",
  //         "pd.dd_national as drill_down_national",
  //         "pd.dd_state as drill_down_state",
  //         "pd.dd_district as drill_down_district",
  //         "pd.dd_block as drill_down_block",
  //         "pd.dd_school as drill_down_school",
  //         "pd.dd_hostel as drill_down_hostel",
  //         "pd.dd_child as drill_down_child"
  //       )
  //       .from("prb_plan_configurator as ppc")
  //       .join("prb_data as pd", "ppc.activity_detail_id", "=", "pd.id")
  //       .join(
  //         "prb_activity_master as pam",
  //         "pam.id",
  //         "=",
  //         "pd.activity_master_id"
  //       )
  //       .where("ppc.state_id", request.state_id)
  //       .andWhere("ppc.district_id", request.district_id)
  //       .andWhere("ppc.final_submit", 2)
  //       .andWhere("ppc.prb_year", apiYear)
  //       .distinct();
  //   }
  //   if ([1, 2, 3, 4, 5, 6, 7, 13, 14].includes(role)) {
  //     col = [
  //       { id: 1, label: "Scheme Name" },
  //       { id: 2, label: "Major Component " },
  //       { id: 3, label: "Sub Component " },
  //       { id: 4, label: "Activity" },
  //     ];
  //     obj = await Model.Prabandh.knx()
  //       .select(
  //         "pd.scheme_id",
  //         "pd.scheme_name",
  //         "pd.major_component_id",
  //         "pd.major_component_name",
  //         "pd.sub_component_id",
  //         "pd.sub_component_name",
  //         "pd.activity_master_id",
  //         "pd.activity_master_name",
  //         "pam.drill_down_flag",
  //         "pd.dd_national as drill_down_national",
  //         "pd.dd_state as drill_down_state",
  //         "pd.dd_district as drill_down_district",
  //         "pd.dd_block as drill_down_block",
  //         "pd.dd_school as drill_down_school",
  //         "pd.dd_hostel as drill_down_hostel",
  //         "pd.dd_child as drill_down_child",
  //         "pd.recuring_nonrecuring",
  //         "pd.serial_order"
  //       )
  //       .from("prb_data as pd")
  //       .innerJoin("prb_activity_master as pam", function () {
  //         this.on("pam.id", "=", "pd.activity_master_id").andOn(
  //           "pd.component_type",
  //           "=",
  //           2
  //         );
  //       })
  //       .where((builder) => {
  //         if ([13, 14].includes(role)) {
  //           builder.andWhere("pd.scheme_id", 3);
  //         }
  //       })
  //       .orderBy("pd.scheme_id")
  //       .orderBy("pd.recuring_nonrecuring")
  //       .orderBy("pd.serial_order")
  //       .distinct();
  //   }
  //   // res.status(200).json({
  //   //     status: true,
  //   //     data: obj,
  //   // });
  //   object = { data: obj };
  //   req.data = {
  //     fname: "fillplanfile",
  //     list: obj,
  //     column: col,
  //     template: "fillplanfile",
  //   };
  //   return PDF.handleReport(req, res);
  // }
  // console.log("object:::>>>", object.data)
  // res.status(200).json({
  //     status: true,
  //     data: object,
  // });
  const apiVersion = req.headers?.api_version;

  let object = {};
  col = [
    { id: 1, label: "Scheme Name" },
    { id: 2, label: "Major Component " },
    { id: 3, label: "Sub Component " },
    { id: 4, label: "Activity" },
  ];
  // if(get ==="allgrouped"){
  // }else {
  //     col = [
  //       { id: 1, label: "Scheme" },
  //       { id: 2, label: "Major Component" },
  //       { id: 3, label: "Sub Component" },
  //       { id: 4, label: "Activity Master" },
  //       { id: 5, label: "Activity Master Detail" },
  //       { id: 5, label: "Recurring Type" },
  //     ];
  // }

  if ([8, 9, 10].includes(role)) {
    object = await Model.Prabandh.knx()
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
        "pd.dd_child as drill_down_child"
      )
      .from("prb_plan_configurator as ppc")
      .join("prb_data as pd", "ppc.activity_detail_id", "=", "pd.id")
      .join(
        "prb_activity_master as pam",
        "pam.id",
        "=",
        "pd.activity_master_id"
      )
      .where("ppc.state_id", request.state_id)
      .andWhere("ppc.district_id", request.district_id)
      .andWhere("ppc.final_submit", 2)
      .andWhere("ppc.prb_year", apiYear)
      .distinct();
  }
  if ([1, 2, 3, 4, 5, 6, 7, 13, 14].includes(role)) {
    object = await Model.Prabandh.knx()
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
      .where("pawpbd.state", "=", request.state_id)
      .where("pawpbd.plan_year", "=", apiYear)
      .where("pd.component_type", "=", 2)
      .where((builder) => {
        if ([13, 14].includes(role)) {
          builder.andWhere("pd.scheme_id", 3);
        }
      })
      .orderBy("pd.scheme_id", "asc")
      .orderBy("pd.activity_master_name", "asc")
      .distinct();
  }
  let obj = { count: object.length, data: object };
  req.data = {
    fname: "fillplanfile",
    list: object,
    column: col,
    template: "fillplanfile",
  };
  return PDF.handleReport(req, res);
});
routers.post("/fillplan", async (req, res) => {
  let col = [
    { id: 1, label: "Scheme" },
    { id: 2, label: "Major Component" },
    { id: 3, label: "Sub Component" },
    { id: 4, label: "Activity Master" },
    { id: 5, label: "Activity Master Detail" },
    { id: 5, label: "Recurring Type" },
  ];
  const request = req.body;

  const apiYear = req.headers?.api_year;
  //const apiVersion = req.headers?.api_version;
  let object = {};

  //const { page, limit, districtid, stateid } = request;
  //const offset = (page - 1) * limit;

  obj = await Model.Prabandh.knx()
    .select(
      Model.Prabandh.knx().raw(
        "ROW_NUMBER() OVER (ORDER BY pd.serial_order) AS row_number"
      ),
      "pd.scheme_name",
      "pd.major_component_name",
      "pd.sub_component_name",
      "pd.activity_master_name",
      "pd.activity_master_details_name",
      Model.Prabandh.knx().raw(
        "CASE WHEN pd.recuring_nonrecuring = 1 THEN 'RECURRING' ELSE 'NON RECURRING' END AS recuring_nonrecuring"
      )
    )
    .from("prb_plan_configurator as ppc")
    .join("prb_data as pd", function () {
      this.on(
        Model.Prabandh.knx().raw(
          "pd.id::numeric = ppc.activity_detail_id::numeric"
        )
      );
    })
    .where("ppc.state_id", request.state_id)
    .andWhere("ppc.district_id", request.district_id)
    .andWhere("ppc.final_submit", "2")
    .andWhere("ppc.prb_year", apiYear)
    .orderBy("pd.serial_order");

  // let countObj = await Model.Prabandh.knx()
  //   .count("* as count")
  //   .from("prb_plan_configurator as ppc")
  //   .join("prb_data as pd", function () {
  //     this.on(
  //       Model.Prabandh.knx().raw("pd.id::numeric = ppc.activity_detail_id::numeric")
  //     );
  //   })
  //   .where("ppc.state_id", request.state_id)
  //   .andWhere("ppc.district_id", request.district_id)
  //   .andWhere("ppc.prb_year", apiYear)
  //   .andWhere("ppc.final_submit", "2")
  //   .first();
  // object = {  data: obj };
  req.data = {
    fname: "viewplanfile",
    list: obj,
    column: col,
    template: "viewplanfile",
  };
  return PDF.handleReport(req, res);

  return res.status(200).json({ status: true, result: object });
});
routers.post("/allusers", async (req, res) => {
  const request = req.body;
  var where = request.where;
  result = await adminUserList(req, where);
  req.data = { fname: "allusers", list: result.data, template: "allusers" };
  return PDF.handleReport(req, res);
});

const adminUserList = async (req, where) => {
  const request = req.body;
  // let user_role_id = req?.auth?.user?.user_role_id;
  let user_role_id;
  if (!user_role_id && request.where) {
    user_role_id = request.where.user_role_id;
    delete request.where.user_role_id;
  }
  var Query = Model.AdminUser.query()
    .leftJoin("master_roles as mr", "mr.id", "=", "user_role_id")
    .leftJoin("master_states as ms", "ms.id", "=", "user_state_id")
    .leftJoin("master_districts as md", "md.id", "=", "user_district_id");
  let object;
  let count;

  if (where?.operator && (where.operator == ">" || where.operator == "<")) {
    object = await Query.select([
      "ms.state_name",
      "md.district_name",
      "u.id",
      "u.user_name",
      "u.user_email",
      "u.user_mobile",
      "mr.role_name",
      "u.user_role_id",
      "u.user_status",
    ])
      .where(where.key, where.operator, where.value)
      .limit(request.limit)
      .offset(request.limit * (request.page - 1))
      .orderBy("u.user_role_id", "asc")
      .orderBy("id", "desc");

    count = (
      await Model.AdminUser.query()
        .join("master_roles as mr", "mr.id", "=", "user_role_id")
        .count("u.id")
        .where(where.key, where.operator, where.value)
    )[0].count;
  } else {
    object = await Query.select([
      "ms.state_name",
      "md.district_name",
      "u.id",
      "u.user_name",
      "u.user_email",
      "u.user_mobile",
      "mr.role_name",
      "u.user_role_id",
      "u.user_status",
    ])
      .where((builder) => {
        builder.where(where);
        builder.andWhere("u.user_role_id", ">=", user_role_id);
      })
      .limit(request.limit)
      .offset(request.limit * (request.page - 1))
      .orderBy("id", "desc");
    count = (
      await Model.AdminUser.query()
        .leftJoin("master_roles as mr", "mr.id", "=", "user_role_id")
        .count("u.id")
        .where((builder) => {
          builder.where(where);
          builder.andWhere("u.user_role_id", ">=", user_role_id);
        })
    )[0].count;
  }

  return {
    data: object,
    count: count,
  };
};

routers.post(
  "/major-component-district-matrix-report",
  PDF.downloadMajorComponentDistrictReportPDF
);

routers.post("/download-state-report", async (req, res) => {
  const { state_id } = req.body;
  const apiYear = req.headers?.api_year;
  const apiVersion = req.headers?.api_version;
  console.log(state_id, apiYear);
  let result = await SCRModel.knx().raw(`select 
  ps.title  as scheme_name, pmc.title as  major_component_name , psc.title as  sub_component_name , pam.title as activity_master_name , pd.activity_master_details_name ,
    physical_quantity,unit_cost,financial_amount,
    case when (aa.activity_master_id is null ) then 888888 else aa.activity_master_id end activity_master_id,
    case when (aa.sub_component_id is null ) then 777777 else aa.sub_component_id end sub_component_id,
    case when (aa.major_component_id is null ) then 666666 else aa.major_component_id end major_component_id,
    case when (aa.scheme_id is null ) then '555555' else aa.scheme_id end scheme_id,
    case when (aa.activity_master_details_id is null ) then 999999 else aa.activity_master_details_id end activity_master_details_id 
   
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

  const scheme = [];
  const schemes = [];
  const majorComponent = [];
  const majorComponents = [];
  const majorSubComponent = [];
  const majorSubComponents = [];

  const activityMaster = [];
  const activityMasters = [];

  if (result.rows.length > 0) {
    result.rows.map((row) => {
      if (!scheme.includes(row.scheme_id) && row.scheme_name !== null) {
        scheme.push(row.scheme_id);
        schemes.push({
          id: row.scheme_id,
          scheme_name: row.scheme_name,
        });
      }

      if (
        !majorComponent.includes(row.major_component_id) &&
        row.major_component_name !== null
      ) {
        majorComponent.push(row.major_component_id);
        majorComponents.push({
          id: row.major_component_id,
          scheme_id: row.scheme_id,
          major_component_name: row.major_component_name,
        });
      }

      if (
        !majorSubComponent.includes(row.sub_component_id) &&
        row.sub_component_name !== null
      ) {
        majorSubComponent.push(row.sub_component_id);
        majorSubComponents.push({
          id: row.sub_component_id,
          scheme_id: row.scheme_id,
          major_component_id: row.major_component_id,
          sub_component_name: row.sub_component_name,
        });
      }

      if (
        !activityMaster.includes(row.activity_master_id) &&
        row.activity_master_name !== null
      ) {
        activityMaster.push(row.activity_master_id);
        activityMasters.push({
          id: row.activity_master_id,
          scheme_id: row.scheme_id,
          major_component_id: row.major_component_id,
          sub_component_id: row.sub_component_id,
          activity_master_name: row.activity_master_name,
          activity_detials: getActivityDetials(row.activity_master_id, result),
        });
      }
    });
  }

  //return res.status(200).json({ status: false, schemes: schemes,majorComponents:majorComponents,majorSubComponents:majorSubComponents,activityMasters:activityMasters });
  // return res.status(200).json({ status: false, result: result.rows,state_id:state_id });
  // const request = req.body;
  // var where = request.where;
  // result = await adminUserList(req, where);

  req.data = {
    fname: "download-state-report",
    list: result.rows,
    schemes: schemes,
    majorComponents: majorComponents,
    majorSubComponents: majorSubComponents,
    activityMasters: activityMasters,
    template: "download-state-report",
  };
  return await PDF.handle(req, res);
});

const getActivityDetials = (id, result) => {
  const data = [];
  if (result.rows.length > 0) {
    result.rows.map((row) => {
      if (row.activity_master_id === id) {
        data.push({
          id: row.activity_master_id,
          financial_amount: row.financial_amount,
          physical_quantity: row.physical_quantity,
          unit_cost: row.unit_cost,
          activity_master_details_name: row.activity_master_details_name,
        });
      }
    });
  }
  return data;
};

module.exports = routers;
