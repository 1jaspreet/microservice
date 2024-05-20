const Model = require("../../models").School;
const Message = require("../../helpers/Message");
const Exception = require("../Assets/ExceptionHandler");
const ApiLog = require("../Logs/ApiLogHandler");
const Response = require("../Assets/ResponseHandler");

exports.index = async (req, res) => {
  const request = req.body;
  const token = req.headers.authorization.split(" ")[1];
  try {
    var where = {};
    let responseFromApiLogger;

    const select = [
      "ms.id",
      "udise_code",
      "school_name",
      "school_profile_image",
      "school_email",
      "school_mobile",
      "school_type",
      "school_address",
      "school_postal_code",
      "school_postal_address",
      "school_category",
      "school_management_center",
      "school_class_from",
      "school_class_to",
      "school_location_type",
      "school_ori_state_id",
      "school_ori_district_id",
      "sm.state_name",
      "dm.district_name",
      "bm.block_name",
      "school_onboard",
    ];

    var Query = Model.query()
      .join("master_states as sm", "sm.id", "=", "school_state_id")
      .join("master_districts as dm", "dm.id", "=", "school_district_id")
      .join("master_blocks as bm", "bm.id", "=", "school_block_id");

    if (request.udicecode > 0 && request.udicecode.length === 11) {
      var where = { ...where, ...{ udise_code: request.udicecode } };
    } else {
      if (request.state > 0) {
        var where = { ...where, ...{ school_state_id: request.state } };
      }
      if (request.district > 0) {
        var where = { ...where, ...{ school_district_id: request.district } };
      }
      if (request.block > 0) {
        var where = { ...where, ...{ school_block_id: request.block } };
      }
      if (request.management_center > 0) {
        var where = {
          ...where,
          ...{ school_management_center: request.management_center },
        };
      }
      if (request.locationtype > 0) {
        var where = {
          ...where,
          ...{ school_location_type: request.locationtype },
        };
      }
      if (request.schooltype > 0) {
        var where = { ...where, ...{ school_type: request.schooltype } };
      }
      if (request.category > 0) {
        var where = { ...where, ...{ school_category: request.category } };
      }
      if (request.onboard !== undefined) {
        var where = { ...where, ...{ school_onboard: 1 } };
      }
    }

    const object = await Query.select(select)
      .where(where)
      .limit(request.limit)
      .offset(request.limit * (request.page - 1));

    const count = await Model.count(where);

    responseFromApiLogger = await ApiLog.create(
      token,
      req.originalUrl,
      "index",
      request,
      { status: true, data: object, count: count }
    );
    res.status(200).json({ status: true, data: object, count: count });
  } catch (e) {
    return Exception.handle(e, res, req, "index");
  }
};

exports.onboardSchool = async (req, res) => {
  const request = req.body;
  const token = req.headers.authorization.split(" ")[1];
  try {
    let responseFromApiLogger;

    const school = await Model.findOne({ udise_code: request.udise });
    if (school != null) {
      if (school.school_onboard == 1) {
        responseFromApiLogger = await ApiLog.create(
          token,
          req.originalUrl,
          "onboardSchool",
          request,
          { status: false, message: Message.AOnboard() }
        );
        return res
          .status(200)
          .json({ status: false, message: Message.AOnboard() });
      } else {
        const object = await Model.update(
          {
            school_email: request.email,
            school_mobile: request.mobile,
            school_onboard: 1,
          },
          school.id
        );
        if (object) {
          responseFromApiLogger = await ApiLog.create(
            token,
            req.originalUrl,
            "onboardSchool",
            request,
            { status: true, message: Message.schoolOnboard() }
          );
          return res
            .status(200)
            .json({ status: true, message: Message.schoolOnboard() });
        }
      }
    } else {
      responseFromApiLogger = await ApiLog.create(
        token,
        req.originalUrl,
        "onboardSchool",
        request,
        { status: false, message: Message.notFound("Record") }
      );
      return res
        .status(200)
        .json({ status: false, message: Message.notFound("Record") });
    }
  } catch (e) {
    return Exception.handle(e, res, req, "onboardSchool");
  }
};

exports.update = async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  try {
    const { state_name, id } = req.body;
    let responseFromApiLogger;

    const result = await Model.findOne({ id });
    if (result != null) {
      const object = await Model.update({ state_name }, id);
      const message = object ? Message.updated(state_name) : Message.default();

      responseFromApiLogger = await ApiLog.create(
        token,
        req.originalUrl,
        "update",
        req.body,
        { status: true, message: message }
      );
      res.status(200).json({ status: true, message: message });
    } else {
      responseFromApiLogger = await ApiLog.create(
        token,
        req.originalUrl,
        "update",
        req.body,
        { status: false, message: Message.notFound("Record") }
      );
      res
        .status(200)
        .json({ status: false, message: Message.notFound("Record") });
    }
  } catch (e) {
    return Exception.handle(e, res, req, "update");
  }
};

exports.updateStatus = async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  try {
    const { id } = req.body;
    let responseFromApiLogger;

    const object = await Model.findOne({ id });
    if (object != null) {
      const status = object.state_status == 1 ? 0 : 1;
      const result = await Model.update({ state_status: status }, id);
      const message = result
        ? Message.status("Record", status)
        : Message.default();

      responseFromApiLogger = await ApiLog.create(
        token,
        req.originalUrl,
        "updateStatus",
        req.body,
        { status: true, message: message }
      );
      res.status(200).json({ status: true, message: message });
    } else {
      responseFromApiLogger = await ApiLog.create(
        token,
        req.originalUrl,
        "updateStatus",
        req.body,
        { status: false, message: Message.notFound("Record") }
      );
      res
        .status(404)
        .json({ status: false, message: Message.notFound("Record") });
    }
  } catch (e) {
    return Exception.handle(e, res, req, "updateStatus");
  }
};

exports.find = async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  try {
    const object = await Model.find(req.body);
    let responseFromApiLogger;

    if (object != null) {
      responseFromApiLogger = await ApiLog.create(
        token,
        req.originalUrl,
        "find",
        req.body,
        { status: true, data: object }
      );
      res.status(200).json({ status: true, data: object });
    } else {
      responseFromApiLogger = await ApiLog.create(
        token,
        req.originalUrl,
        "find",
        req.body,
        { status: false, message: Message.notFound("Record") }
      );
      res
        .status(404)
        .json({ status: false, message: Message.notFound("Record") });
    }
  } catch (e) {
    return Exception.handle(e, res, req, "find");
  }
};

exports.prabandhSchoolFind = async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  try {
    let responseFromApiLogger;
    const object = await Model.prbFind(req);
    if (object != null) {
      responseFromApiLogger = await ApiLog.create(
        token,
        req.originalUrl,
        "prabandhSchoolFind",
        req.body,
        { status: true, data: object }
      );
      res.status(200).json({ status: true, data: object });
    } else {
      responseFromApiLogger = await ApiLog.create(
        token,
        req.originalUrl,
        "prabandhSchoolFind",
        req.body,
        { status: false, message: Message.notFound("Record") }
      );
      res
        .status(404)
        .json({ status: false, message: Message.notFound("Record") });
    }
  } catch (e) {
    return Exception.handle(e, res, req, "prabandhSchoolFind");
  }
};

exports.list = async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  try {
    const { id } = req.body;
    const object = await Model.list();
    let responseFromApiLogger;
    if (object != null) {
      responseFromApiLogger = await ApiLog.create(
        token,
        req.originalUrl,
        "list",
        req.body,
        { status: true, data: object }
      );
      res.status(200).json({ status: true, data: object });
    } else {
      responseFromApiLogger = await ApiLog.create(
        token,
        req.originalUrl,
        "list",
        req.body,
        { status: false, message: Message.notFound("Record") }
      );
      res
        .status(404)
        .json({ status: false, message: Message.notFound("Record") });
    }
  } catch (e) {
    return Exception.handle(e, res, req, "list");
  }
};

exports.filteredSchools = async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  try {
    const { block_id, form_global_code } = req.body;
    let responseFromApiLogger;
    const object = await Model.knx()
      .select("*")
      .from("prb_school_master")
      .where(function () {
        this.where(
          "school_activity_assoc",
          "@>",
          JSON.stringify([{ activity_global_code: form_global_code }])
        ).andWhere("block_id", block_id);
      });
    responseFromApiLogger = await ApiLog.create(
      token,
      req.originalUrl,
      "filteredSchools",
      req.body,
      { status: true, data: object }
    );
    res.status(200).json({ status: true, data: object });
  } catch (e) {
    return Exception.handle(e, res, req, "filteredSchools");
  }
};

exports.pagedSchools = async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  try {
    const { page, limit, get, where } = req.body;
    const filteredObject = {};
    const keysToRemove = ["page", "limit", "reload", "get"];
    for (const key in req.body) {
      if (req.body.hasOwnProperty(key)) {
        if (
          !keysToRemove.includes(key) &&
          req.body[key] !== null &&
          req.body[key] !== undefined
        ) {
          filteredObject[key] = req.body[key];
        }
      }
    }

    const offset = (page - 1) * limit;

    const obj = await Model.knx()
      .select([
        Model.knx().raw(
          "ROW_NUMBER() OVER (ORDER BY prb_school_master.udise_sch_code) as row_number"
        ),
        "prb_school_master.udise_sch_code as id",
        "prb_school_master.school_name as name",
        "prb_school_master.ele_additional_class_room",
        "prb_school_master.ele_boys_toilet",
        "prb_school_master.ele_girls_toilet",
        "prb_school_master.ele_drinking_water",
        "prb_school_master.ele_boundary_wall",
        "prb_school_master.ele_electrification",
        "prb_school_master.ele_handrails",
        "prb_school_master.ele_cwsn_toilet",
        "prb_school_master.ele_major_repair",
        "prb_school_master.ele_furniture",
        "prb_school_master.ele_ramps_handrails",
        "prb_school_master.ele_solar_panel",
        "prb_school_master.ele_incinerator_machine",
        "prb_school_master.c_ele_upgradation_ps_ups",
        "prb_school_master.c_ele_buildingless",
        "prb_school_master.c_ele_dilapidated_building",
        "prb_school_master.c_ele_smart_class_room",
        "prb_school_master.c_additional_ict_lab",
        "prb_school_master.c_ele_digital_hardware_software",
        "prb_school_master.c_ele_child_friendly_furniture",
        "prb_school_master.c_ele_bala_feature",
        "prb_school_master.c_ele_outdoor_play_material",
        "prb_school_master.ele_kgbv_construction_building",
        "prb_school_master.ele_kgbv_boundary_wall",
        "prb_school_master.ele_kgbv_boring_handpump",
        "prb_school_master.ele_kgbv_furniture_equip_kitchen",
        "prb_school_master.ele_kgbv_tlm_library_books",
        "prb_school_master.ele_kgbv_bedding",
        "prb_school_master.ele_kgbv_incinerator",
        "prb_school_master.ele_kgbv_replace_bedding",
        "prb_school_master.ele_kgbv_vending_machine",
      ])
      .from("prb_school_master")
      .where(function () {
        if (filteredObject.block_id !== undefined) {
          this.where("block_id", filteredObject.block_id);
        }
        if (filteredObject.district_id !== undefined) {
          this.where("district_id", filteredObject.district_id);
        }
        if (filteredObject.state_id !== undefined) {
          this.where("state_id", filteredObject.state_id);
        }

        if (get === "Major Component") {
          this.whereIn("prband_category", [1, 2, 4]);
        }
        if (get === "KGBV") {
          this.where("kgbv_yn", 1);
        }
        if (get === "Netaji Shubhash") {
          this.where("ns_yn", 1);
        }
        if (where !== "") {
          const likeConditions = where
            .filter((condition) => condition.condition === "like")
            .map((condition) => {
              return condition.columns.map((column) => ({
                column,
                value: condition.value,
              }));
            })
            .flat();

          if (likeConditions.length > 0) {
            this.where((builder) => {
              builder.andWhere((likeBuilder) => {
                likeConditions.forEach((likeCondition, index) => {
                  if (index > 0) {
                    likeBuilder.orWhereRaw(
                      `LOWER(${likeCondition.column}) LIKE LOWER(?)`,
                      [`%${likeCondition.value}%`]
                    );
                  } else {
                    likeBuilder.andWhereRaw(
                      `LOWER(${likeCondition.column}) LIKE LOWER(?)`,
                      [`%${likeCondition.value}%`]
                    );
                  }
                });
              });
            });
          }
        }
      })
      .orderBy("prb_school_master.udise_sch_code", "asc")
      .offset(offset)
      .limit(limit);

    /*  .select([
        Model.knx().raw(
          "ROW_NUMBER() OVER (ORDER BY prb_school_master.udise_sch_code) AS row_number"
        ),
        "prb_school_master.udise_sch_code as id",
        "prb_school_master.school_name as name",
      ])
      .leftJoin(
        "public.prb_ann_wrk_pln_bdgt_data_physical_asset prbbdgta",
        "prbbdgta.asset_code",
        "prb_school_master.udise_sch_code"
      )
      .from("prb_school_master")
      .where({ block_id: block_id })
      .offset(offset)
      .limit(limit); */

    let countObj = await Model.knx()
      .count("* as count")
      .from("prb_school_master")
      .where(function () {
        if (filteredObject.block_id !== undefined) {
          this.where("block_id", filteredObject.block_id);
        }
        if (filteredObject.district_id !== undefined) {
          this.where("district_id", filteredObject.district_id);
        }
        if (filteredObject.state_id !== undefined) {
          this.where("state_id", filteredObject.state_id);
        }
        if (get === "Major Component") {
          this.whereIn("prband_category", [1, 2, 4]);
        }
        if (get === "KGBV") {
          this.where("kgbv_yn", 1);
        }
        if (get === "Netaji Shubhash") {
          this.where("ns_yn", 1);
        }
        if (where !== "") {
          const likeConditions = where
            .filter((condition) => condition.condition === "like")
            .map((condition) => {
              return condition.columns.map((column) => ({
                column,
                value: condition.value,
              }));
            })
            .flat();

          if (likeConditions.length > 0) {
            this.where((builder) => {
              builder.andWhere((likeBuilder) => {
                likeConditions.forEach((likeCondition, index) => {
                  if (index > 0) {
                    likeBuilder.orWhereRaw(
                      `LOWER(${likeCondition.column}) LIKE LOWER(?)`,
                      [`%${likeCondition.value}%`]
                    );
                  } else {
                    likeBuilder.andWhereRaw(
                      `LOWER(${likeCondition.column}) LIKE LOWER(?)`,
                      [`%${likeCondition.value}%`]
                    );
                  }
                });
              });
            });
          }
        }
      })
      .first();

    object = { count: countObj.count, data: obj };
    let responseFromApiLogger = await ApiLog.create(
      token,
      req.originalUrl,
      "pagedSchools",
      req.body,
      { status: true, data: object }
    );
    res.status(200).json({ status: true, data: object });
  } catch (e) {
    return Exception.handle(e, res, req, "pagedSchools");
  }
};

exports.bdgtSelectedSchools = async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  try {
    const { block_id, params, schools_list, activityMasterDetail, user_data } =
      req.body;
    const { user_state_id, user_district_id } = user_data;
    const {
      scheme_id,
      sub_component_id,
      major_component_id,
      activity_master_id,
      activity_master_details_id,
      id,
    } = activityMasterDetail;
    const apiYear = req.headers?.api_year;
    const apiVersion = req.headers?.api_version;
    let responseData = [];

    if (schools_list.length > 0) {
      await schools_list.forEach((s) => {
        if (s.action === "Add") {
          let object = Model.bdgt()
            .insert({
              asset_code: s.id,
              asset_type: 5,
              state: user_state_id,
              district: user_district_id,
              block: block_id,
              activity_master_details_id: activity_master_details_id,
              scheme_id: scheme_id,
              sub_component_id: sub_component_id,
              major_component_id: major_component_id,
              activity_master_id: activity_master_id,
              prb_ann_wrk_pln_bdgt_data_id: id,
              applicable_yn: 1,
              plan_year: apiYear,
            })
            .onConflict([
              "asset_code",
              "activity_master_details_id",
              "state",
              "district",
              "block",
            ])
            .merge()
            .then(() => {
              responseData.push(s);
            })
            .catch((error) => {
              console.error("Error inserting data:", error);
            });
        } else {
          let object = Model.bdgt()
            .where({
              asset_code: s.id,
              activity_master_details_id: activity_master_details_id,
              state: user_state_id,
              district: user_district_id,
              block: block_id,
            })
            .update({ applicable_yn: 0 })
            .then(() => {
              console.log("Update successful");
            })
            .catch((error) => {
              console.error("Error updating data:", error);
            });
        }
      });
      let responseFromApiLogger = await ApiLog.create(
        token,
        req.originalUrl,
        "bdgtSelectedSchools",
        req.body,
        { status: true, data: true }
      );
      res.status(200).json({ status: true, data: true });
    }
  } catch (e) {
    return Exception.handle(e, res, req, "bdgtSelectedSchools");
  }
};

// BY NITIN

exports.masterSchool = async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  try {
    const request = req.body;
    const object = await Model.query().select().orderBy("school_id").limit(100);
    // const count = await Model.count();
    let responseFromApiLogger = await ApiLog.create(
      token,
      req.originalUrl,
      "masterSchool",
      req.body,
      { status: true, data: true }
    );
    res.status(200).json({ status: true, data: object });
  } catch (e) {
    return Exception.handle(e, res, req, "masterSchool");
  }
};

exports.updateAll = async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  try {
    let responseFromApiLogger;
    const { school_id } = req.body;
    const result = await Model.findOne({ school_id });
    console.log("req.body", req.body);
    if (result != null) {
      const object = await Model.updateAll(req.body, school_id);
      responseFromApiLogger = await ApiLog.create(
        token,
        req.originalUrl,
        "updateAll",
        req.body,
        {
          status: true,
          message: Message.updated("Master School Detail Updated"),
        }
      );
      res.status(200).json({
        status: true,
        message: Message.updated("Master School Detail Updated"),
      });
    } else {
      responseFromApiLogger = await ApiLog.create(
        token,
        req.originalUrl,
        "updateAll",
        req.body,
        { status: false, message: Message.notFound("No Record Found") }
      );
      res
        .status(200)
        .json({ status: false, message: Message.notFound("No Record Found") });
    }
  } catch (e) {
    return Exception.handle(e, res, req, "updateAll");
  }
};

exports.reportData = async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  let responseFromApiLogger;
  try {
    const { state_id, district_id } = req.body;
    console.log("stat district school handler", state_id, district_id);
    if (state_id === 0 && district_id === 0) {
      const object = await Model.ReportDatas({});
      responseFromApiLogger = await ApiLog.create(
        token,
        req.originalUrl,
        "reportData",
        req.body,
        { status: true, data: object }
      );
      res.status(200).json({ status: true, data: object });
    } else if (state_id !== 0 && district_id === 0) {
      const object = await Model.ReportDtstate(state_id);
      responseFromApiLogger = await ApiLog.create(
        token,
        req.originalUrl,
        "reportData",
        req.body,
        { status: true, data: object }
      );
      res.status(200).json({ status: true, data: object });
    } else {
      const object = await Model.ReportDt(state_id, district_id);
      responseFromApiLogger = await ApiLog.create(
        token,
        req.originalUrl,
        "reportData",
        req.body,
        { status: true, data: object }
      );
      res.status(200).json({ status: true, data: object });
    }
  } catch (e) {
    return Exception.handle(e, res, req, "reportData");
  }
};

exports.newReportData = async (req, res) => {
  const { state_id, district_id } = req.body;
  const year = req?.headers?.api_year;
  const object = await Model.NewReportData({ state_id, year });
  // responseFromApiLogger = await ApiLog.create(token, req.originalUrl, 'reportData', req.body, { status: true, data: object });
  res.status(200).json({ status: true, data: object });
};

exports.schoolDetail = async (req, res) => {

  // const { user_master_id } = req.body;
  const { udise_sch_code } = req.body;
  // const object = await Model.knx().raw(`select * from school_users su left join prb_school_master psm on su.user_id=psm.udise_sch_code where user_master_id=${user_master_id}`);
  
  let object = await Model.knx().raw(
    `SELECT ms.state_name, md.district_name, mb.block_name, psm.school_name, psm.class_to, psm.class_frm
    FROM pmshri_school_master AS psm 
    JOIN master_states AS ms 
        ON psm.state_id = ms.state_id 
    JOIN master_districts AS md 
        ON psm.district_id = md.district_id 
    JOIN master_blocks AS mb 
        ON psm.block_id = mb.block_id 
    WHERE udise_sch_code = '${udise_sch_code}'`
);
  res.status(200).json({
    status: true,
    data: object.rows && object.rows.length > 0 ? object.rows[0] : null,
  });
};

exports.activityList = async (req, res) => {
  try {   
    const request = req.body;
    const role = request.role;

    const apiYear = req.headers?.api_year;

    let object = {};

    // object = await Model.knx().raw(`select * from prb_ann_wrk_pln_bdgt_data_physical_asset pawpbdpa where asset_code = '${request.udise_sch_code}'`);//10191917201
    // object = await Model.knx().raw(`select * from prb_state_ann_wrk_pln_bdgt_data_physical_asset pawpbdpa where asset_code = '${request.udise_sch_code}'`);//28212800505
    object = await Model.knx()
      .raw(`select * from prb_state_ann_wrk_pln_bdgt_data_physical_asset psawpbdpa 
        left join prb_state_ann_wrk_pln_bdgt_data psawpbd on psawpbd.prb_state_ann_wrk_pln_bdgt_data_id = psawpbdpa.prb_ann_wrk_pln_bdgt_data_id 
        where asset_code = '${request.udise_sch_code}'`); //28212800505
    // .select(
    //   "pd.scheme_id",
    //   "pd.scheme_name",
    //   "pd.major_component_id",
    //   "pd.major_component_name",
    //   "pd.sub_component_id",
    //   "pd.sub_component_name",
    //   "pd.activity_master_id",
    //   "pd.activity_master_name"
    // )
    // .from("prb_data as pd")
    // .innerJoin(
    //   "prb_ann_wrk_pln_bdgt_data as pawpbd",
    //   "pd.id",
    //   "=",
    //   "pawpbd.activity_master_details_id"
    // )
    // .where("pawpbd.state", "=", request.stateid)
    // .where("pawpbd.plan_year", "=", apiYear)
    // .where("pd.component_type", "=", 2)
    // .where((builder) => {
    //   builder.andWhere("pawpbd.district", request.districtid);
    // })
    // .orderBy("pd.scheme_id", "asc")
    // .orderBy("pd.activity_master_name", "asc")
    // .distinct();

    return Response.handle(req, res, "getSavedPlan", 200, {
      status: true,
      data: object.rows,
    });
  } catch (e) {
    return Exception.handle(e, res, req, "getSavedPlan");
  }
};
