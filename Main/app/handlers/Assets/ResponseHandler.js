const ApiLog = require("../Logs/ApiLogHandler");

exports.handle = async (req, res, handlerName, status_code, response) => {
    const token = req?.headers?.authorization ? ((req?.headers?.authorization).split(' '))[1] : null;
    if (token != null && token != undefined) {
        const url = req.originalUrl ? req.originalUrl : '';
        const reqObj = req.body ? req.body : {};

        let responseFromApiLogger = await ApiLog.create(token, url, handlerName, reqObj, response, status_code)
    }

    res.status(status_code).json(response);
};