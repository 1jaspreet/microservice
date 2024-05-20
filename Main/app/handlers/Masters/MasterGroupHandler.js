const Model = require("../../models").MasterGroup;
const Exception = require("../Assets/ExceptionHandler");


exports.list = async (req, res) => {
  try {
    const object = await Model.list();
    res.status(200).json({ status: true, data: object });
  } catch (e) {
    return Exception.handle(e,res,req,'');
  }
};

exports.dropdown = async (req, res) => {
  try {
    const object = await Model.dropdown();
    res.status(200).json({ status: true, data: object });
  } catch (e) {
    return Exception.handle(e,res,req,'');
  }
};
