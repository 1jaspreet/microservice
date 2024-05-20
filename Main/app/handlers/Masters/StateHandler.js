const Model = require("../../models").State;
const PModel = require("../../models").Prabandh;
const Message = require("../../helpers/Message");
const Exception = require("../Assets/ExceptionHandler");
const ApiLog = require("../Logs/ApiLogHandler");

exports.index = async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const request = req.body;
  try {
    const object = await Model.query()
      .select(["id", "state_name", "state_status"])
      .orderBy("state_name")
      .limit(request.limit)
      .offset(request.limit * (request.page - 1));
    const count = await Model.count();
    let responseFromApiLogger = await ApiLog.create(
      token,
      req.originalUrl,
      "index",
      req.body,
      { status: true, data: object, count: count }
    );
    res.status(200).json({ status: true, data: object, count: count });
  } catch (e) {
    return Exception.handle(e, res, req, "index");
  }
};

exports.coordinatorStateList = async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  try {
    const {
      user: { id, user_role_id },
    } = req.body;

    let query = 'select * from master_states';
    if([2,3,15,16,17].indexOf(user_role_id)>-1){
      query = `select distinct ms.* from 
      ( select (json_array_elements(state_ids)->>'id')::int as state_id from consultant_mapping where user_id = ${id} 
      and role_code = ${user_role_id} ) st , master_states ms where st.state_id = ms.state_id order by ms.state_name`;
    }

    const data = await Model.knx().raw(query);

    //const object = await Model.list();
    /*     let responseFromApiLogger = await ApiLog.create(
      token,
      req.originalUrl,
      "list",
      req.body,
      { status: true, data: object }
    ); */
    res.status(200).json({ status: true, data: data.rows });
  } catch (e) {
    return Exception.handle(e, res, req, "list");
  }
};

exports.list = async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  try {
    const object = await Model.list();
    let responseFromApiLogger = await ApiLog.create(
      token,
      req.originalUrl,
      "list",
      req.body,
      { status: true, data: object }
    );
    res.status(200).json({ status: true, data: object });
  } catch (e) {
    return Exception.handle(e, res, req, "list");
  }
};

exports.create = async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  try {
    const { name, state_code, is_active, is_ut } = req.body;
    const result = await Model.findOne({ state_code });
    let responseFromApiLogger;

    if (result.length == 0) {
      const object = await Model.create({ name, state_code, is_active, is_ut });
      const message = object ? Message.created(name) : Message.default();
      responseFromApiLogger = await ApiLog.create(
        token,
        req.originalUrl,
        "create",
        req.body,
        { status: true, message: message }
      );
      res.status(200).json({ status: true, message: message });
    } else {
      responseFromApiLogger = await ApiLog.create(
        token,
        req.originalUrl,
        "create",
        req.body,
        { status: false, message: Message.duplicate(name) }
      );
      res.status(200).json({ status: false, message: Message.duplicate(name) });
    }
  } catch (e) {
    return Exception.handle(e, res, req, "create");
  }
};

exports.update = async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  try {
    const { state_name, id } = req.body;
    const result = await Model.findOne({ id });
    let responseFromApiLogger;

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

exports.delete = async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  try {
    const { id } = req.body;
    const object = await Model.findOne({ id });
    let responseFromApiLogger;

    if (object != null) {
      const message = Model.delete({ id })
        ? Message.deleted(object.state_name)
        : Message.default();

      responseFromApiLogger = await ApiLog.create(
        token,
        req.originalUrl,
        "delete",
        req.body,
        { status: true, message: message }
      );
      res.status(200).json({ status: true, message: message });
    } else {
      responseFromApiLogger = await ApiLog.create(
        token,
        req.originalUrl,
        "delete",
        req.body,
        { status: false, message: Message.notFound("Record") }
      );
      res
        .status(404)
        .json({ status: false, message: Message.notFound("Record") });
    }
  } catch (e) {
    return Exception.handle(e, res, req, "delete");
  }
};

exports.updateStatus = async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  try {
    const { id } = req.body;
    const object = await Model.findOne({ id });
    let responseFromApiLogger;

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
    const { id } = req.body;
    const object = await Model.findOne({ id });
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

exports.prabandhData = async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const request = req.body;
  try {
    const object = await PModel.query()
      .select([
        "id",
        "scheme_name",
        "major_component",
        "sub_component",
        "activity_master_name",
        "activity_master_details",
        "norms",
        "criteria_for_appraisal",
      ])
      // .orderBy("name")
      .limit(request.limit)
      .offset(request.limit * (request.page - 1));

    const count = await PModel.count();
    let responseFromApiLogger = await ApiLog.create(
      token,
      req.originalUrl,
      "prabandhData",
      req.body,
      { status: true, data: object, count: count }
    );
    res.status(200).json({ status: true, data: object, count: count });
  } catch (e) {
    return Exception.handle(e, res, req, "prabandhData");
  }

  // res.status(200).json({ status: true, data: '0980' });
};

exports.majorComponents = async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const request = req.body;
  try {
    const object = await PModel.schemes()
      .select(["id", "title", "unique_code"])
      .limit(request.limit)
      .offset(request.limit * (request.page - 1));
    var Query = PModel.component();
    const object2 = Query.select("title").where("unique_code");
    const count = await PModel.count();
    // console.log(object2,'dsssssssssss')
    let responseFromApiLogger = await ApiLog.create(
      token,
      req.originalUrl,
      "majorComponents",
      request,
      { status: true, data: object, count: count }
    );
    res.status(200).json({ status: true, data: object, count: count });
    // const request = req.body;
    // const object = await PModel.query()
    //   .select(["scheme_name", "major_component_id", "major_component"])
    //   .countDistinct("major_component as total_components")
    //   .countDistinct("sub_component as total_subcomponents")
    //   .countDistinct("activity_master_name as total_activity_master")
    //   .where("scheme_id", request.schemeid)
    //   .groupBy(["scheme_name", "major_component_id", "major_component"]);

    // res.status(200).json({ status: true, data: 'Done' });
  } catch (e) {
    return Exception.handle(e, res, req, "majorComponents");
  }
};
