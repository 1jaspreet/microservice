const Model = require("../../models").MasterYear;
const Exception = require("../Assets/ExceptionHandler");

exports.index = async (req, res) => {
  try {
    const request = req.body;
    const object = await Model.query()
      .select(["id", "year_name", "year_code", "status"])
      .orderBy("id")
      .limit(request.limit)
      .offset(request.limit * (request.page - 1));
    const count = await Model.count();
    res.status(200).json({ status: true, data: object, count: count });
  } catch (e) {
    return Exception.handle(e,res,req,'');
  }
};

exports.list = async (req, res) => {
  try {
    const object = await Model.list();
    res.status(200).json({ status: true, data: object });
  } catch (e) {
    return Exception.handle(e,res,req,'');
  }
};
