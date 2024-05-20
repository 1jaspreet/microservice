const Message = require("../../helpers/Message");
const Library = require("../../libraries");
const Exception = require("./ExceptionHandler");
const Model = require("../../models");
const Crypto = require("../../libraries/crypto");
const ApiLog = require("../Logs/pmshriApiLogHandler");

exports.handle = async (req, res) => {
    const request = req.body;
    if (!req.headers.authorization) {
        return res.send("Something Went Wrong");
    }
    try {
        const token = req.headers.authorization.split(" ")[1];
        let responseFromApiLogger;

        if (request.flag == "admin") {
            const user = await Model.PMSHRIAdminUserModel.findOne({
                user_mobile: request.mobile,
                user_status: 1,
            });
            if (user != null) {
                if (user.user_mobile != null && user.user_mobile.length == 10) {
                    const token = Crypto.encrypt(request.mobile + "|" + request.flag);

                    let ots = await Library.OTPMaker.send(req, user.user_mobile);
                    let response = await { ...ots, token: token };
                    console.log("OtpHandler", ots, token, user, request.mobile);

                    responseFromApiLogger = await ApiLog.create(
                        token,
                        req.originalUrl,
                        "handle",
                        request,
                        response
                    );
                    return res.status(200).json(response);
                }

                responseFromApiLogger = await ApiLog.create(
                    token,
                    req.originalUrl,
                    "handle",
                    request,
                    { status: false, message: Message.mobile() }
                );
                res.status(200).json({ status: false, message: Message.mobile() });
            }

            responseFromApiLogger = await ApiLog.create(
                token,
                req.originalUrl,
                "handle",
                request,
                { status: false, message: Message.notFound("Mobile number") }
            );
            res
                .status(200)
                .json({ status: false, message: Message.notFound("Mobile number") });
        }
    } catch (e) {
        return Exception.handle(e, res, req, "handle");
    }
};
