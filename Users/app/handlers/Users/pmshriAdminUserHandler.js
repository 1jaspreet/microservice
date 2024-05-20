const Message = require("../../helpers/Message");
const Model = require("../../models").AdminUser;
const Hash = require("../../libraries").Hash;
const Exception = require("../Assets/ExceptionHandler");
const Helper = require("../../helpers/Helper");
const ConsultantModel = require("../../models/ConsultantMapping/ConsultantMappingModel");
const ApiLog = require("../Logs/ApiLogHandler");
const MailerHandler = require("../../mails");
const ModelConsult = require("../../models").ConsultantMapping;

exports.index = async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const request = req.body;
  var where = request.where;
  try {
    var result;
    if (where.searchParams && where.searchParams.operator == "ILIKE") {
      delete where.user_role_id;
      result = await filteredAdminUserList(request, where);
    } else if (
      where.operator &&
      (where.operator == ">" || where.operator == "<")
    ) {
      result = await adminUserList(req, where);
    } else {
      result = await adminUserList(req, where);
    }

    let response = {
      status: true,
      message: "success",
      data: result.data,
      count: result.count,
    };

    let responseFromApiLogger = await ApiLog.create(
      token,
      req.originalUrl,
      "index",
      request,
      response
    );

    res.status(200).json(response);
  } catch (e) {
    return Exception.handle(e, res, req, "index");
  }
};

exports.create = async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const request = req.body;
  const created_by = req.auth.user.id;
  try {
    const userData = await Model.knx()
      .select(["au.*", Model.knx().raw(`
        CASE
          WHEN au.user_email = '${request.email}' THEN 'Email ID already exists.'
          WHEN au.user_mobile = '${request.mobile}' THEN 'Mobile number already exists.'
          ELSE 'User details do not exist.'
        END as condition_result`),
      ])
      .from("admin_users as au").where(function () { this.where("au.user_email", request.email).orWhere("au.user_mobile", request.mobile); });

    let message;
    let responseFromApiLogger;

    if (userData.length === 0) {
      let pass = Helper.otpMaker(6);
      let hashPass = Helper.makeHash(pass);
      const result = await Model.create({
        user_name: request.name,
        user_email: request.email.trim(),
        user_mobile: request.mobile,
        user_role_id: request.role,
        user_state_id: request.state,
        user_district_id: request.district,
        designation_code: request.designation,
        user_status: 1,
        user_password: hashPass,
        user_roles: request.user_roles,
        activity_group_code: request.activity_group_code,
        diet_id: request.diet,
        created_by
      });

      const data = await Model.findExistingUser(request);
      if (result) {
        await MailerHandler.createUser(req, {
          to: request.email,
          ...data,
          password: pass,
        });
      }

      if (request.role == 16 || request.role == 17 || request.role == 23 || request.role == 24) {
        const iteratorForArray = Object.keys(request).filter((x) =>
          x.startsWith("state")
        );
        const dbValues = [];
        if (iteratorForArray && iteratorForArray.length > 0) {
          iteratorForArray.forEach((item, index) => {
            if (item == 'statesc') {
              dbValues.push({
                role_code: request.role == 16 ? 15 : request.role,
                state_ids: JSON.stringify(request[item]),
                major_component_ids: null,
                sub_component_ids: null,
                activity_ids: null,
                component: null,
                user_id: data.id,
              });
            } else {
              dbValues.push({
                role_code: item.startsWith("statenfc") ? 2 : 3,
                state_ids: JSON.stringify(request[item]),
                major_component_ids: JSON.stringify(item.startsWith("statenfc") ? request[`majorcomponentnfc${item.charAt(item.length - 1)}`] : request[`majorcomponentnic${item.charAt(item.length - 1)}`]),
                sub_component_ids: JSON.stringify(item.startsWith("statenfc") ? request[`submajorcomponentnfc${item.charAt(item.length - 1)}`] : request[`submajorcomponentnic${item.charAt(item.length - 1)}`]),
                activity_ids: JSON.stringify(item.startsWith("statenfc") ? request[`activitynfc${item.charAt(item.length - 1)}`] : request[`activitynic${item.charAt(item.length - 1)}`]),
                component: JSON.stringify(item.startsWith("statenfc") ? request[`componentnfc${item.charAt(item.length - 1)}`] : request[`componentnfc${item.charAt(item.length - 1)}`]),
                user_id: data.id,
              });
            }
          });
          const consultantMappingResult = ConsultantModel.create(dbValues);
        }
      }
      message = result ? Message.created("User") : Message.default();

      responseFromApiLogger = await ApiLog.create(
        token,
        req.originalUrl,
        "create",
        request,
        { status: true, message: message }
      );
      res.status(200).json({ status: true, message: message });
    } else {
      message = userData[0]?.condition_result;

      responseFromApiLogger = await ApiLog.create(
        token,
        req.originalUrl,
        "create",
        request,
        { status: false, message: message }
      );
      res.status(200).json({ status: false, message: message });
    }
  } catch (e) {
    return Exception.handle(e, res, req, "create");
  }
};

exports.update = async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const request = req.body;
  try {
    const userData = await Model.knx().select(["au.*", Model.knx().raw(`CASE
      WHEN au.user_email = '${request.data.email}' THEN 'Email ID already exists.'
      WHEN au.user_mobile = '${request.data.mobile}' THEN 'Mobile number already exists.'
      ELSE 'User details do not exist.'
    END as condition_result`),
    ]).from("admin_users as au").where("au.id", "!=", request.id).andWhere(function () {
      this.where("au.user_email", request.data.email).orWhere("au.user_mobile", request.data.mobile);
    });

    if (userData.length === 0) {
      const result = await Model.findOneUser({ id: request.id });
      if (result != null) {
        const user_name = request.data && request.data.name ? request.data.name : result.user_name;
        const user_email = request.data && request.data.email ? request.data.email.trim() : result.user_email.trim();
        const user_mobile = request.data && request.data.mobile ? request.data.mobile : result.user_mobile;
        const user_state_id = request.data && request.data.state ? request.data.state : result.user_state_id;
        const user_district_id = request.data && request.data.district ? request.data.district : result.user_district_id;
        const user_status = request.data && (request.data.user_status == 0 || request.data.user_status == 1) ? request.data.user_status : result.user_status;
        const designation_code = request.data && request.data.designation ? request.data.designation : result.designation_code;
        const user_roles = request.data && request.data.user_roles ? request.data.user_roles : result.user_roles;
        const diet_id = request.data && request.data.diet ? request.data.diet : result.diet_id;
        const activity_group_code = request.data && request.data.activity_group_code ? request.data.activity_group_code : result.activity_group_code;
      
        const updated_by = req.auth.user.id;
        const update_data = { user_name, user_email, user_mobile, user_state_id, user_district_id, user_status, designation_code, user_roles, activity_group_code, diet_id, updated_by };

        const object = await Model.update(update_data, request.id);
        if (object) {
          await MailerHandler.updateUser(req, { subject: "Profile Update PRABANDH", msg: "Profile updated successfully.", to: user_email, user_name, user_email, user_mobile });
        }

        const message = object ? Message.updated("User") : Message.default();

        if (+result.user_role_id === 16 || +result.user_role_id === 17 || +result.user_role_id === 23 || +result.user_role_id === 24) {
          if (request.data && request.data.user_roles && request.data.user_roles != result.user_roles) {
            let idsArray = request.data.user_roles.split(',').map(Number);

            if (idsArray.length > 0) {
              let where = idsArray.length === 3 ? `(${idsArray[0]}, ${idsArray[1]}, ${idsArray[2]})` : idsArray.length == 2 ? `(${idsArray[0]}, ${idsArray[1]})` : `(${idsArray[0]})`;

              let deleteQuery = `delete from consultant_mapping where role_code not in ${where} and user_id = ${request.id}`;
              const consultantMappingResult = await ConsultantModel.raw(deleteQuery);
            }
          }

          const iteratorForArray = Object.keys(request.data).filter((x) => x.startsWith("state"));

          let insertQueryString = `insert into consultant_mapping (id, role_code, state_ids, major_component_ids, sub_component_ids, activity_ids, component, user_id) values`;
          let valuesString = ``;
          let insertConflictString = ` on conflict(id) do update set component = excluded.component, state_ids = excluded.state_ids, major_component_ids = excluded.major_component_ids, sub_component_ids = excluded.sub_component_ids,activity_ids=excluded.activity_ids`;

          iteratorForArray.forEach((item, index) => {
            let dbObj = {}
            if (item == 'statesc') {
              dbObj = {
                role_code: +result.user_role_id === 16 ? 15 : result.user_role_id,
                state_ids: JSON.stringify(request.data[item]),
                user_id: request.id,
                id: request.data["consultantscid"] || "default",
                major_component_ids: JSON.stringify(request.data[`majorcomponentsc`]) || null,
                sub_component_ids: JSON.stringify(request.data[`submajorcomponentsc`]) || null,
                activity_ids: JSON.stringify(request.data[`activitysc`]) || null,
                component: JSON.stringify(request.data[`componentsc`]) || null,
              };
            }
            else {
              dbObj = {
                role_code: item.startsWith("statenfc") ? 2 : 3,
                state_ids: JSON.stringify(request.data[item]),
                major_component_ids: JSON.stringify(item.startsWith("statenfc") ? request.data[`majorcomponentnfc${item.charAt(item.length - 1)}`] : request.data[`majorcomponentnic${item.charAt(item.length - 1)}`]) || null,
                sub_component_ids: JSON.stringify(item.startsWith("statenfc") ? request.data[`submajorcomponentnfc${item.charAt(item.length - 1)}`] : request.data[`submajorcomponentnic${item.charAt(item.length - 1)}`]) || null,
                activity_ids: JSON.stringify(item.startsWith("statenfc") ? request.data[`activitynfc${item.charAt(item.length - 1)}`] : request.data[`activitynic${item.charAt(item.length - 1)}`]) || null,
                component: JSON.stringify(item.startsWith("statenfc") ? request.data[`componentnfc${item.charAt(item.length - 1)}`] : request.data[`componentnic${item.charAt(item.length - 1)}`]) || null,
                user_id: request.id,
                id: request.data[item.startsWith("statenfc") ? `consultantnfc${item.charAt(item.length - 1)}id` : `consultantnic${item.charAt(item.length - 1)}id`] || "default",
              };
            }

            valuesString += `(${dbObj.id}, ${dbObj.role_code}, '${dbObj.state_ids}', '${dbObj.major_component_ids}', '${dbObj.sub_component_ids}', '${dbObj.activity_ids}','${dbObj.component}', ${dbObj.user_id})`;
            valuesString += index + 1 == iteratorForArray.length ? `` : `,`;
          });

          if (valuesString) {
            const consultantMappingResult = ConsultantModel.raw(insertQueryString + valuesString + insertConflictString);
            console.log("consultantMappingResult==>", consultantMappingResult, insertQueryString + valuesString + insertConflictString);
          }
        }
        let responseFromApiLogger = await ApiLog.create(token, req.originalUrl, "update", request, { status: true, message: message });
        res.status(200).json({ status: true, message: message });
      } else {
        let responseFromApiLogger = await ApiLog.create(token, req.originalUrl, "update", request, { status: false, message: Message.notFound("Record") });
        res.status(200).json({ status: false, message: Message.notFound("Record") });
      }
    } else {
      let message = userData[0]?.condition_result;
      let responseFromApiLogger = await ApiLog.create(token, req.originalUrl, "update", request, { status: false, message: message });
      res.status(200).json({ status: false, message: message });
    }
  } catch (e) {
    return Exception.handle(e, res, req, "update");
  }
};

exports.updateStatus = async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const request = req.body;
  try {
    let responseFromApiLogger;

    const result = await Model.findOneUser({ id: request.id });
    if (result != null) {
      const user_name = request.data && request.data.name ? request.data.name : result.user_name;
      const user_email = request.data && request.data.email ? request.data.email.trim() : result.user_email.trim();
      const user_mobile = request.data && request.data.mobile ? request.data.mobile : result.user_mobile;
      const user_state_id = request.data && request.data.state ? request.data.state : result.user_state_id;
      const user_district_id = request.data && request.data.district ? request.data.district : result.user_district_id;
      const user_status = request.data && (request.data.user_status == 0 || request.data.user_status == 1) ? request.data.user_status : result.user_status;
      const designation_code = request.data && request.data.designation ? request.data.designation : result.designation_code;
      const user_roles = request.data && request.data.user_roles ? request.data.user_roles : result.user_roles;
      const updated_by = req.auth.user.id;
      const update_data = { user_name, user_email, user_mobile, user_state_id, user_district_id, user_status, designation_code, user_roles, };

      const object = await Model.update(update_data, request.id);
      if (object) {
        await MailerHandler.updateUser(req, { subject: "Profile Status Update PRABANDH", msg: "Profile status updated successfully.", to: user_email, user_name, user_email, user_mobile });
      }

      const message = object ? Message.updated("User") : Message.default();

      responseFromApiLogger = await ApiLog.create(token, req.originalUrl, "update", request, { status: true, message: message });
      res.status(200).json({ status: true, message: message });
    } else {
      responseFromApiLogger = await ApiLog.create(token, req.originalUrl, "update", request, { status: false, message: Message.notFound("Record") });
      res.status(200).json({ status: false, message: Message.notFound("Record") });
    }
  } catch (e) {
    return Exception.handle(e, res, req, "update");
  }
};

// exports.userPer = async (req, res) => {
//   const token = req.headers.authorization.split(" ")[1];
//   try {
//     const { user_id } = req.body;
//     let responseFromApiLogger;
//     const result = await Models.knx().raw(`select * from (
//                     SELECT 
//                 (json_array_elements(major_component_ids)->>'id')::int AS activity_id,
//                 json_array_elements(major_component_ids)->>'label' AS activity_name,
//                 id
//                 FROM 
//                 public.consultant_mapping cm where user_id = ${user_id}
//                 ) aa , 
                
//                 ( SELECT 
//                 (json_array_elements(state_ids)->>'id')::int AS state_id,
//                 json_array_elements(state_ids)->>'name' AS state_name,
//                 id as idk 
//             FROM 
//                 public.consultant_mapping cm where user_id = ${user_id}
//                 ) bb ,
//                 ( 
//                 SELECT 
//                 (json_array_elements(component)->>'id')::int AS scheme_id,
//                 json_array_elements(component)->>'scheme_name' AS scheme_name,
//                 id as idn 
//             FROM 
//                 public.consultant_mapping cm where user_id = ${user_id}
//                 ) cc 
//                     where aa.id = bb.idk
//                     and cc.idn = aa.id`);
//     if (result != null) {
//       responseFromApiLogger = await ApiLog.create(
//         token,
//         req.originalUrl,
//         "userPer",
//         req.body,
//         { status: true, data: result.rows }
//       );
//       res.status(200).json({ status: true, data: result.rows });
//     }
//   } catch (e) {
//     return Exception.handle(e, res, req, "userPer");
//   }
// };

exports.profileUpdate = async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const request = req.body;
  const updated_by = req.auth.user.id;
  try {
    const parseToken = Helper.decodeToken(req);
    const result = await Model.findOneUser({ id: parseToken.user.id });
    let responseFromApiLogger;
    if (result != null) {
      const user_name = request.data.name
        ? request.data.name
        : result.user_name;
      const user_email = request.data.email
        ? request.data.email
        : result.user_email;
      const user_mobile = request.data.mobile
        ? request.data.mobile
        : result.user_mobile;
      const update_data = { user_name, user_email, user_mobile, updated_by };
      const object = await Model.update(update_data, parseToken.user.id);
      const user = await Model.findOneUser({ id: parseToken.user.id });
      const message = object ? Message.updated("User") : Message.default();
      const token = {
        status: true,
        token: Helper.token(req, user, parseToken.session_id, parseToken.flag),
      };
      responseFromApiLogger = await ApiLog.create(
        token,
        req.originalUrl,
        "profileUpdate",
        request,
        { status: true, message: message, token: token }
      );
      res.status(200).json({ status: true, message: message, token: token });
    } else {
      responseFromApiLogger = await ApiLog.create(
        token,
        req.originalUrl,
        "profileUpdate",
        request,
        { status: false, message: Message.notFound("Record") }
      );
      res
        .status(200)
        .json({ status: false, message: Message.notFound("Record") });
    }
  } catch (e) {
    return Exception.handle(e, res, req, "profileUpdate");
  }
};

exports.findById = async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  try {
    const { id, role } = req.body;
    let responseFromApiLogger;

    const data = await Model.findOneUser({ id });

    if (role == 16 || role == 17 || role == 23 || role == 24) {
      // data.consultant;
      // MappingData = await ConsultantModel.find({ user_id: id });
      data.consultantMappingData = await ConsultantModel.find({ user_id: id });
    }

    let response = {
      status: true,
      message: "success",
      data: data,
      token: Helper.decodeToken(req).user,
    };

    responseFromApiLogger = await ApiLog.create(
      token,
      req.originalUrl,
      "findById",
      req.body,
      response
    );

    res.status(200).json(response);
  } catch (e) {
    return Exception.handle(e, res, req, "findById");
  }
};

exports.findUserByRole = async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  try {
    const data = await Model.findAllRelated(req);
    let responseFromApiLogger;

    let response = {
      status: true,
      message: "success",
      data: data,
      token: Helper.decodeToken(req).user,
    };

    responseFromApiLogger = await ApiLog.create(
      token,
      req.originalUrl,
      "findUserByRole",
      req.body,
      response
    );
    res.status(200).json(response);
  } catch (e) {
    return Exception.handle(e, res, req, "findUserByRole");
  }
};

const adminUserList = async (req, where) => {
  const request = req.body;
  let user_role_id;

  if (!user_role_id && request.where) {
    if ([1, 2, 3, 15].includes(+request.where.user_role_id)) {
      delete request.where.user_state_id;
      delete request.where.user_district_id;
    }

    user_role_id = request.where.user_role_id;
    delete request.where.user_role_id;
  }

  if (request.where.user_district_id === 0) {
    delete request.where.user_district_id;
  }

  if (request.where.user_state_id === 0) {
    delete request.where.user_state_id;
  }

  console.log("where condition:", request.where);

  var Query = Model.query()
    .leftJoin("master_roles as mr", "mr.id", "=", "user_role_id")
    .leftJoin("master_states as ms", "ms.id", "=", "user_state_id")
    .leftJoin("master_districts as md", "md.id", "=", "user_district_id");
  let object;
  let count;

  if (where.operator && (where.operator == ">" || where.operator == "<")) {
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
      // .limit(request.limit)
      // .offset(request.limit * (request.page - 1))
      .orderBy("u.user_role_id", "asc")
      .orderBy("id", "desc");

    count = (
      await Model.query()
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
      .orderBy("u.user_role_id", "asc")
      .orderBy("id", "desc");
    count = (
      await Model.query()
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

const filteredAdminUserList = async (request, where) => {
  var roleData = Object.keys(where)
    .filter((key) => key !== "searchParams")
    .reduce((obj, key) => {
      obj[key] = where[key];
      return obj;
    }, {});

  var Query = Model.query()
    .leftJoin("master_roles as mr", "mr.id", "=", "u.user_role_id")
    .leftJoin("master_states as ms", "ms.id", "=", "u.user_state_id")
    .leftJoin("master_districts as md", "md.id", "=", "u.user_district_id");

  let object;
  let count;

  if (roleData.operator) {
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
      // .where('user_role_id', '>', roleData.value)
      .where(roleData.key, roleData.operator, roleData.value)
      .andWhere((query) =>
        query
          .where(
            where.searchParams.user_name,
            where.searchParams.operator,
            where.searchParams.value
          )
          .orWhere(
            where.searchParams.user_email,
            where.searchParams.operator,
            where.searchParams.value
          )
          .orWhere(
            where.searchParams.user_mobile,
            where.searchParams.operator,
            where.searchParams.value
          )
          .orWhere(
            where.searchParams.role_name,
            where.searchParams.operator,
            where.searchParams.value
          )
          .orWhere(
            where.searchParams.state_name,
            where.searchParams.operator,
            where.searchParams.value
          )
          .orWhere(
            where.searchParams.district_name,
            where.searchParams.operator,
            where.searchParams.value
          )
      )
      .orderBy("u.user_role_id", "asc")
      .orderBy("id", "desc")
      .limit(request.limit)
      .offset(request.limit * (request.page - 1));

    count = (
      await Model.query()
        .join("master_roles as mr", "mr.id", "=", "u.user_role_id")
        .count("u.id")
        .where(roleData.key, roleData.operator, roleData.value)
        .andWhere((query) =>
          query
            .where(
              where.searchParams.user_name,
              where.searchParams.operator,
              where.searchParams.value
            )
            .orWhere(
              where.searchParams.user_email,
              where.searchParams.operator,
              where.searchParams.value
            )
            .orWhere(
              where.searchParams.user_mobile,
              where.searchParams.operator,
              where.searchParams.value
            )
            .orWhere(
              where.searchParams.role_name,
              where.searchParams.operator,
              where.searchParams.value
            )
            .orWhere(
              where.searchParams.state_name,
              where.searchParams.operator,
              where.searchParams.value
            )
            .orWhere(
              where.searchParams.district_name,
              where.searchParams.operator,
              where.searchParams.value
            )
        )
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
      .where(roleData)
      .andWhere((query) =>
        query
          .where(
            where.searchParams.user_name,
            where.searchParams.operator,
            where.searchParams.value
          )
          .orWhere(
            where.searchParams.user_email,
            where.searchParams.operator,
            where.searchParams.value
          )
          .orWhere(
            where.searchParams.user_mobile,
            where.searchParams.operator,
            where.searchParams.value
          )
          .orWhere(
            where.searchParams.role_name,
            where.searchParams.operator,
            where.searchParams.value
          )
      )
      .orderBy("id", "desc")
      .limit(request.limit)
      .offset(request.limit * (request.page - 1));

    count = (
      await Model.query()
        .join("master_roles as mr", "mr.id", "=", "user_role_id")
        .count("u.id")
        .where(roleData)
        .andWhere((query) =>
          query
            .where(
              where.searchParams.user_name,
              where.searchParams.operator,
              where.searchParams.value
            )
            .orWhere(
              where.searchParams.user_email,
              where.searchParams.operator,
              where.searchParams.value
            )
            .orWhere(
              where.searchParams.user_mobile,
              where.searchParams.operator,
              where.searchParams.value
            )
            .orWhere(
              where.searchParams.role_name,
              where.searchParams.operator,
              where.searchParams.value
            )
        )
    )[0].count;
  }

  return {
    data: object,
    count: count,
  };
};



exports.loggedUsersList = async (req, res) => {
  const request = req.body;
  const where = request.where;
  const token = req.headers.authorization.split(" ")[1];
  try {
    let responseFromApiLogger;

    let object = await Model.query()
      .leftJoin("master_designations as md", function () {
        this.on(
          Model.knx().raw("CAST(md.id AS varchar)"),
          "=",
          "u.designation_code"
        );
      })
      .leftJoin("master_roles as mr", "u.user_role_id", "=", "mr.id")
      .leftJoin("master_states as ms", "u.user_state_id", "=", "ms.id")
      .leftJoin("master_districts as md2", "u.user_district_id", "=", "md2.id")
      .join("log_users as lu", "u.id", "=", "lu.users_id")
      .select([
        "u.id",
        "u.user_name",
        "u.user_email",
        "u.user_mobile",
        "u.user_role_id",
        "mr.role_name",
        "u.user_state_id",
        "ms.state_name",
        "u.user_district_id",
        "md2.district_name",
        "u.designation_code",
        "md.designation_title",
        "lu.*",
      ])
      .where((builder) => {
        builder.where(1, "=", 1);
        if (+request.role_id_1 !== 1) {
          builder.andWhere("u.user_role_id", ">=", request.role_id_1);
        }
        if (+request.role_id_1 !== 1) {
          builder.andWhere("u.user_role_id", "<=", request.role_id_2);
        }
        if (+request.state_id !== 0) {
          builder.andWhere("u.user_state_id", +request.state_id);
        }
        if (+request.district_id !== 0) {
          builder.andWhere("u.user_district_id", +request.district_id);
        }
        if (request.where && request.where.searchParams != null) {
          builder.andWhere((query) =>
            query
              .where(
                where.searchParams.user_name,
                where.searchParams.operator,
                where.searchParams.value
              )
              .orWhere(
                where.searchParams.user_email,
                where.searchParams.operator,
                where.searchParams.value
              )
              .orWhere(
                where.searchParams.user_mobile,
                where.searchParams.operator,
                where.searchParams.value
              )
              .orWhere(
                where.searchParams.role_name,
                where.searchParams.operator,
                where.searchParams.value
              )
              .orWhere(
                where.searchParams.designation,
                where.searchParams.operator,
                where.searchParams.value
              )
              .orWhere(
                where.searchParams.district_name,
                where.searchParams.operator,
                where.searchParams.value
              )
              .orWhere(
                where.searchParams.state_name,
                where.searchParams.operator,
                where.searchParams.value
              )
          );
        }
      })
      .orderBy("lu.created_at", "desc")
      .orderBy("lu.updated_at", "desc");
    //  .limit(request.limit)
    //  .offset(request.limit * (request.page - 1));

    let count = await Model.query()
      .count("* as logged_users_count")
      // .leftJoin("master_designations as md", "u.designation_code", "=", "md.id")
      .leftJoin("master_designations as md", function () {
        this.on(
          Model.knx().raw("CAST(md.id AS varchar)"),
          "=",
          "u.designation_code"
        );
      })
      .leftJoin("master_roles as mr", "u.user_role_id", "=", "mr.id")
      .leftJoin("master_states as ms", "u.user_state_id", "=", "ms.id")
      .leftJoin("master_districts as md2", "u.user_district_id", "=", "md2.id")
      .join("log_users as lu", "u.id", "=", "lu.users_id")
      .where((builder) => {
        builder.where(1, "=", 1);
        if (+request.role_id_1 !== 1) {
          builder.andWhere("u.user_role_id", ">=", request.role_id_1);
        }
        if (+request.role_id_1 !== 1) {
          builder.andWhere("u.user_role_id", "<=", request.role_id_2);
        }
        if (+request.state_id !== 0) {
          builder.andWhere("u.user_state_id", +request.state_id);
        }
        if (+request.district_id !== 0) {
          builder.andWhere("u.user_district_id", +request.district_id);
        }
        if (request.where && request.where.searchParams != null) {
          builder.andWhere((query) =>
            query
              .where(
                where.searchParams.user_name,
                where.searchParams.operator,
                where.searchParams.value
              )
              .orWhere(
                where.searchParams.user_email,
                where.searchParams.operator,
                where.searchParams.value
              )
              .orWhere(
                where.searchParams.user_mobile,
                where.searchParams.operator,
                where.searchParams.value
              )
              .orWhere(
                where.searchParams.role_name,
                where.searchParams.operator,
                where.searchParams.value
              )
              .orWhere(
                where.searchParams.designation,
                where.searchParams.operator,
                where.searchParams.value
              )
              .orWhere(
                where.searchParams.district_name,
                where.searchParams.operator,
                where.searchParams.value
              )
              .orWhere(
                where.searchParams.state_name,
                where.searchParams.operator,
                where.searchParams.value
              )
          );
        }
      });

    let response = {
      status: true,
      data: {
        users: object,
        count: count[0].logged_users_count,
      },
    };

    responseFromApiLogger = await ApiLog.create(
      token,
      req.originalUrl,
      "loggedUsersList",
      req.body,
      response
    );

    res.status(200).json(response);
  } catch (e) {
    return Exception.handle(e, res, req, "loggedUsersList");
  }
};
