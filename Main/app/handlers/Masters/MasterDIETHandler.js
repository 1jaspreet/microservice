const Model = require("../../models").MasterDIET;
const Exception = require("../Assets/ExceptionHandler");

exports.list = async (req, res) => {
  try {
    const object = await Model.list(req.body);
    res.status(200).json({ status: true, data: object });
  } catch (e) {
    return Exception.handle(e,res,req,'');
  }
};