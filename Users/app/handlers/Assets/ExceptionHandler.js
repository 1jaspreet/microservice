const ApiLog = require("../Logs/ApiLogHandler");

exports.handle = async (err, res, req, handlerName) => {
  const token = req?.headers?.authorization ? ((req?.headers?.authorization).split(' '))[1] : null;
  try {
    if (token) {
      const url = req.originalUrl ? req.originalUrl : "";
      const reqObj = req.body ? req.body : {};

      let responseFromApiLogger = await ApiLog.create(
        token,
        url,
        handlerName,
        reqObj,
        { status: false, message: err.message },
        500
      );
    }
  } catch {
    res.status(500).json({ status: false, message: err.message });
  }
};
