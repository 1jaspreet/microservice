const Model = require("../../models").Mastertype;
const Models = require("../../models").Mastertypedetail;
// const Model = require('../../models').AdminUser;
const Hash = require("../../libraries").Hash;
const { check } = require("express-validator");
const Message = require("../../helpers/Message");
const Exception = require("../Assets/ExceptionHandler");
const DB = require('../../../config/database/connection');
// const DB = require('../../../config/database/connection');
const table = 'master_type as mb';
exports.create = async (req, res) => {
  try {
    const { title, type_code, description, status } = req.body;
    const result = await Model.findOne({ type_code });
    if (
      result == null ||
      result == undefined ||
      Object.keys(result).length == 0
    ) {
      const object = await Model.create({
        title,
        type_code,
        description,
        status,
      });
      const message = object
        ? Message.created("Master Type")
        : Message.default();
      res.status(200).json({ status: true, message: message });
    } else {
      res
        .status(200)
        .json({ status: false, message: Message.duplicate("Type Code") });
    }
  } catch (e) {
    return Exception.handle(e, res, req, '');
  }
};

exports.index = async (req, res) => {
  var result;
  const title = req.body?.where?.value;
  const requests = req.body;
  if (title !== null && title !== undefined && title.length !== 0) {
    result = await filteredMasterList(requests, title);
    res
      .status(200)
      .json({ status: true, data: result.data, count: result.count });
  } else {
    try {
      const request = req.body;
      const object = await Model.query()
        .select()
        .orderBy("title", "desc")
        .limit(request.limit)
        .offset(request.limit * (request.page - 1));
      const count = await Model.count();
      res.status(200).json({ status: true, data: object, count: count });
    } catch (e) {
      return Exception.handle(e, res, req, '');
    }
  }
};

exports.getalltypecode = async (req, res) => {
  try {
    const request = req.body;
    const object = await Model.typecode();
    const count = await Model.count();
    res.status(200).json({ status: true, data: object, count: count });
  } catch (e) {
    return Exception.handle(e, res, req, '');
  }
};

exports.update = async (req, res) => {
  try {
    const { status, id } = req.body.data;
    const result = await Model.findOne({ id });
    if (result != null) {
      const object = await Model.update({ status }, id);
      // const message = (object) ? Message.updated(status) : Message.status(status);
      res
        .status(200)
        .json({ status: true, message: Message.status("Master Type", status) });
    } else {
      res
        .status(200)
        .json({ status: false, message: Message.notFound("Record") });
    }
  } catch (e) {
    return Exception.handle(e, res, req, '');
  }
};

exports.updateAll = async (req, res) => {
  try {
    const { title, description, type_code, status, id } = req.body;
    const result = await Model.findOne({ id: id, type_code: type_code });
    const results = await Model.findOne({ type_code });
    // console.log("result:::", result)
    const checkDuplicate = await DB.raw(`SELECT * from master_type where type_code = '${type_code}' and id!=${id}`)
    if (checkDuplicate.rows.length) {
      res
        .status(200)
        .json({ status: false, message: Message.duplicate("Type Code") });
    }
    else {
      if (
        result !== null ||
        result !== undefined ||
        Object.keys(result).length != 0
      ) {
        const object = await Model.updateAll(
          { title, description, type_code, status },
          id
        );
        res
          .status(200)
          .json({ status: true, message: Message.updated("Master Type") });
      } else {
        create(req, res)
        // res.status(200).json({ status: false, message: Message.duplicate("Type Code") });
      }
    }
  } catch (e) {
    return Exception.handle(e, res, req, '');
  }
};

exports.findById = async (req, res) => {
  try {
    const { id } = req.body;
    const data = await Model.findOne({ id });
    res.status(200).json({ status: true, message: "success", data: data });
  } catch (e) {
    return Exception.handle(e, res, req, '');
  }
};
exports.MasterTypefindById = async (req, res) => {
  try {
    const { id } = req.body;
    const data = await Models.find({ master_type_id: id });
    res.status(200).json({ status: true, message: "success", data: data });
  } catch (e) {
    return Exception.handle(e, res, req, '');
  }
};

const filteredMasterList = async (request, value) => {
  var Query = Model.query();
  let object;
  let count;

  object = await Query.select(["id", "title", "description", "type_code"])
    // .where("type_code", "LIKE", value + "%")
    .orWhere("title", "ILIKE", value + "%")
    .orWhere("description", "ILIKE", value + "%")
    .orWhere("type_code", 'ILIKE', value + '%')
    // .orWhere("district_id", 'LIKE', value + '%')
    // .orWhere("block_id", 'LIKE', value + '%')
    // .orWhere("udise_code", 'LIKE', value + '%')
    // .orWhere("links_to_school", 'LIKE', value + '%')
    .limit(request.limit)
    .offset(request.limit * (request.page - 1));

  count = (
    await Model.query()
      .count("id")
      // .where("type_code", "LIKE", value + "%")
      .orWhere("title", "ILIKE", value + "%")
      .orWhere("description", "ILIKE", value + "%")
      .orWhere("type_code", 'ILIKE', value + '%')
  )[// .orWhere("district_id", 'LIKE', value + '%') // .orWhere("state_id", 'LIKE', value + '%')
    // .orWhere("block_id", 'LIKE', value + '%')
    // .orWhere("udise_code", 'LIKE', value + '%')
    // .orWhere("links_to_school", 'LIKE', value + '%')
    0].count;

  return {
    data: object,
    count: count,
  };
};
