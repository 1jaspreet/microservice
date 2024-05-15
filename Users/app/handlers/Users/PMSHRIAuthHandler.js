const Model = require("../../models");
const Message = require("../../helpers/Message");
const Helper = require("../../helpers/Helper");
const Exception = require("../Assets/ExceptionHandler");
const UserLog = require("../Logs/UserLogHandler");
const { Crypto } = require("../../libraries");
const { decrypt } = require("../../libraries/hash");
const env = require("../../../config/env");
const ApiLog = require("../Logs/ApiLogHandler");
const { copyFileSync } = require("fs-extra");
const DTime = require("node-datetime");
const axios = require("axios");

exports.Login = async (req, res) => {
    req.body.password = await decrypt(req.body.password);


    try {
        const request = req.body;
        if (Crypto.decrypt(request.otc) == request.captcha) {
            if (request.type === "mobile") {
                if (request.otp === "" && request.password !== "") {
                    return userHandler(req, res);
                } else {
                    if (
                        Crypto.decrypt(request.ots) == request.otp ||
                        request.otp == env.DEFL_OTP
                    ) {
                        if (request.flag === "admin") {
                            let user = await Model.PMSHRIAdminUserModel.findOne({
                                user_mobile: request.mobile,
                            });
                            console.log("user", user);
                            if (user?.user_role_id === 1 && user?.reference_user_id > 0) {
                                const userdata = await Model.PMSHRIAdminUserModel.findOne({
                                    "u.id": user?.reference_user_id,
                                });
                                return loginResponses(userdata, req, res, "admin", user?.id);
                            } else {
                                return loginResponse(user, req, res, "admin");
                            }
                            // return loginResponse(user, req, res, 'admin');
                        }
                        /*                      if (request.flag === 'school') {
                                                                const user = await Model.School.findOne({ school_mobile: request.mobile });
                                                                return loginResponse(user, req, res, 'school');
                                                            }
                                                            if (request.flag === 'volunteer') {
                                                                const user = await Model.Volunteers.findOne({ volunteer_mobile: request.mobile });
                                                                return loginResponse(user, req, res, 'volunteer');
                                                            } */
                    }
                    return res
                        .status(200)
                        .json({ status: false, otp: true, message: Message.invalidOTP() });
                }
            } else {
                return userHandler(req, res);
            }
        }

        return res
            .status(200)
            .json({ status: false, captcha: true, message: Message.captcha() });
    } catch (e) {
        return Exception.handle(e, res, req, "");
    }
};

exports.afterSchoolLogin = async (req, res) => {
    let { udise_code, password, text } = req.body;
    console.log("lllllllllllllllll;;;;;;;;;;;;;;;;;;")
    try {
        // let apiRes = await axios.post(`http://10.194.82.22/master-services/v1.2/checkLoginCredentials/${udise_code}/${password}/${text}`, {as:"asad"},
        // // let apiRes = await axios.post(
        // //   `http://10.23.252.24:8081/master-services/v1.2/checkLoginCredentials/${udise_code}/${password}/${text}`,
        // //   {}, // for local
        //   {
        //     headers: {
        //       "Content-Type": "application/json",
        //       identity: "test",
        //       // identity: "shawez003", // for local
        //     },
        //   }
        // );
        const exist = await Model.PMSHRIAdminUserModel.knx().raw(
            `select * from pmshri_school_master where udise_code='${udise_code}'`
        );
        if (exist.rows.length === 0) {
            const object = {
                status: false,
                message: "Oops! Your school is not exitst in PMShri."
            }
            return res.status(400).json(object);
        }
        else {
            let apiRes = await axios.post(
                (env.APP_ENV == 'production' ? `http://10.194.82.22` : `http://10.23.252.74:8081`) + `/master-services/v1.2/checkLoginCredentials/${udise_code}/${password}/${text}`,
                { as: "asad" },
                {
                    headers: {
                        "Content-Type": "application/json",
                        identity: (env.APP_ENV == 'production' ? "pmshri-internal" : "shawez003"),
                    },
                }
            );

            if (apiRes.data && apiRes.data.status) {
                let data = apiRes.data.data;

                const check = await Model.PMSHRIAdminUserModel.knx().raw(
                    `select * from school_users where udise_code='${data.userId}'`
                );

                if (check.rows.length === 0) {
                    const afterCreate = await Model.PMSHRIAdminUserModel.knx().raw(
                        `INSERT INTO school_users (udise_code, user_name, user_mobile, user_role_id)
          VALUES (?, ?, ?, 22)
          RETURNING *`,
                        [data.userId, data.userName, data.phoneNumber]
                    );

                    if (afterCreate.rows.length > 0) {
                        let user = await Model.PMSHRIAdminUserModel.knx().raw(
                            `select * from school_users su join pmshri_school_master psm on su.udise_code = psm.udise_sch_code where su.udise_code = '${data.userId}'`
                        );
                        if (!user.rows && user.rows.length == 0) {
                            user = await Model.PMSHRIAdminUserModel.knx().raw(
                                `select * from school_users su su.udise_code = '${data.userId}'`
                            );
                        }
                        user = user.rows[0];

                        console.log(user,"useruseruseruseruseruseruseruseruser");
                        const session = Crypto.encrypt(user.id);

                        const object = {
                            status: true,
                            token: Helper.token(req, user, session, "school"),
                            check: false,
                        };

                        return res.status(200).json(object);
                    }
                } else {
                    const updated_at = DTime.create().format("Y-m-d H:M:S");
                    const afterUpdate = await Model.PMSHRIAdminUserModel.knx().raw(
                        `update school_users set updated_at='${updated_at}' where udise_code='${data.userId}'`
                    );

                    let user = await Model.PMSHRIAdminUserModel.knx().raw(
                        `select * from school_users su join prb_school_master psm on su.udise_code = psm.udise_sch_code where su.udise_code = '${data.userId}'`
                    );
                    user = user.rows[0];
                    const session = Crypto.encrypt(user.id);

                    const object = {
                        status: true,
                        token: Helper.token(req, user, session, "school"),
                        check: false,
                    };

                    return res.status(200).json(object);
                }

                return res
                    .status(200)
                    .json({ status: false, message: apiRes.data.errorDetails.message });
            } else {
                console.log("noooooooooooooooo-------------------", apiRes.data);
                return res
                    .status(200)
                    .json({ status: false, message: apiRes.data.errorDetails.message });
            }
        }
    } catch (e) {
        return Exception.handle(e, res, req, "");
    }
};

exports.simulate = async (req, res) => {
    try {
        const { user_mobile } = req.body;
        const request = req.body;
        const token = req.headers.authorization.split(" ")[1];
        let responseFromApiLogger;
        if (request.type === "mobile") {
            if (request.flag === "admin") {
                const user = await Model.PMSHRIAdminUserModel.findOne({
                    user_mobile: user_mobile,
                });
                return loginResponse(user, req, res, "admin");
            }
            responseFromApiLogger = await ApiLog.create(
                token,
                req.originalUrl,
                "simulate",
                request,
                { status: false, otp: true, message: Message.invalidOTP() }
            );
            return res
                .status(200)
                .json({ status: false, otp: true, message: Message.invalidOTP() });
        } else {
            return userHandler(req, res);
        }
        return res
            .status(200)
            .json({ status: false, captcha: true, message: Message.captcha() });
    } catch (e) {
        return Exception.handle(e, res, req, "");
    }
};

const userHandler = async (req, res) => {
    const request = req.body;
    if (request.flag == "admin") {
        const object =
            request.type == "email"
                ? { user_email: request.email }
                : { user_mobile: request.mobile };
        // console.log("pass", request.password)
        const user = await Model.PMSHRIAdminUserModel.findOne({
            ...object,
            user_password: Helper.makeHash(request.password),
            user_status: 1,
        });
        return loginResponse(user, req, res, "admin");
    }
    if (request.flag == "school") {
        const object = { udise_code: request.udise, school_onboard: 1 };
        if (request.otp.length !== null && request.otp.length === 6) {
            if (
                Crypto.decrypt(request.ots) === request.otp ||
                request.otp === req.ENV.DEFL_OTP
            ) {
                var user = await Model.School.findOne(object);
                return loginResponse(user, req, res, "school");
            }
            return res
                .status(200)
                .json({ status: false, message: Message.invalidOTP() });
        }
        var user = await Model.School.findOne({
            ...object,
            school_password: Helper.makeHash(request.password),
        });
        return loginResponse(user, req, res, "school");
    }
    if (request.flag == "volunteer") {
        const object =
            request.type == "email"
                ? { volunteer_email: request.email }
                : { volunteer_mobile: request.mobile };
        const user = await Model.Volunteers.findOne({
            ...object,
            volunteer_password: Helper.makeHash(request.password),
            volunteer_status: 1,
        });
        return loginResponse(user, req, res, "volunteer");
    }
    /*
      if(request.flag == 'school'){
          const object    =   (request.type == 'email') ? {school_email:request.email} : {school_mobile:request.mobile}
          const user      =   await Model.School.findOne({...object,school_password:Helper.makeHash(request.password),school_onboard:1});
          return loginResponse(user,req,res,'school');
      }
      */
};

const loginResponse = (user, req, res, flag) => {
    if (user != null) {
        const session = Crypto.encrypt(user.id);
        // const updated_by = req.auth.user.id;
        const object = {
            status: true,
            token: Helper.token(req, user, session, flag),
            check: req.body.check,
        };
        UserLog.handle(req, res, user, session, flag);
        const objects = { valid_otp_time: null };
        Model.PMSHRIAdminUserModel.update(objects, user.id);
        return res.status(200).json(object);
    } else {
        const object = { status: false, message: Message.invalidLogin() };
        UserLog.handle(req, res, user, null, flag);
        return res.status(200).json(object);
    }
};
exports.updateRefrence = async (req, res) => {
    try {
        const { user_id, reference_user_id, captcha, otc } = req.body;
        const updated_by = req.auth.user.id;
        if (Crypto.decrypt(otc) === captcha) {
            const userdata = await Model.PMSHRIAdminUserModel.findOneuser(reference_user_id);
            const selfdata = await Model.PMSHRIAdminUserModel.findOneuser(user_id);
            console.log("userdata=======>>>>>", +userdata?.id);
            if (+reference_user_id === 0) {
                if (selfdata) {
                    if (selfdata && selfdata?.user_role_id < 4) {
                        const objects = { reference_user_id: 0 };
                        await Model.PMSHRIAdminUserModel.update(
                            { ...objects, updated_by },
                            +selfdata.id
                        );
                        return res.status(200).json({
                            code: 200,
                            status: true,
                            message: "Refrence ID is Updated",
                        });
                    } else {
                        return res.status(400).json({
                            code: 400,
                            status: false,
                            message: "You are not Authorized",
                        });
                    }
                } else {
                    return res.status(400).json({
                        code: 400,
                        status: false,
                        message: "Refrence/Self ID not Exist",
                    });
                }
            } else {
                if (userdata && selfdata) {
                    if (selfdata && selfdata?.user_role_id < 4) {
                        const objects = { reference_user_id: +userdata?.id };
                        await Model.PMSHRIAdminUserModel.update(
                            { ...objects, updated_by },
                            +selfdata?.id
                        );
                        // if (updated) {
                        return res.status(200).json({
                            code: 200,
                            status: true,
                            message: "Refrence ID is Updated",
                        });
                        // }
                    } else {
                        return res.status(400).json({
                            code: 400,
                            status: false,
                            message: "You are not Authorized",
                        });
                    }
                } else {
                    return res.status(400).json({
                        code: 400,
                        status: false,
                        message: "Refrence/Self ID not Exist",
                    });
                }
            }
        }
        return res.status(400).json({
            code: 400,
            status: false,
            captcha: true,
            message: Message.captcha(),
        });
    } catch (er) {
        console.log("er", er);
        return Exception.handle(er, res, req, "");
    }
};

const loginResponses = (user, req, res, flag, id) => {
    if (user != null) {
        const session = Crypto.encrypt(user.id);
        // const updated_by = req.auth.user.id;
        const object = {
            status: true,
            token: Helper.token(req, user, session, flag),
            check: req.body.check,
        };
        UserLog.handle(req, res, user, session, flag);
        const objects = { valid_otp_time: null };
        Model.PMSHRIAdminUserModel.update({ ...ApiLog.objects }, id);
        return res.status(200).json(object);
    } else {
        const object = { status: false, message: Message.invalidLogin() };
        UserLog.handle(req, res, user, null, flag);
        return res.status(200).json(object);
    }
};
exports.loginWithMobile = async (req, res) => {
    try {
        const request = req.body;
        if (request.otp != req.ENV.DEFL_OTP) {
            res.status(200).json({ status: true, message: Message.invalidOTP() });
        } else {
            const user = await Model.User.findOne({
                mobile: request.mobile,
                is_active: 1,
            });
            if (user != null) {
                res.status(200).json({
                    status: true,
                    message: Message.logedIn(),
                    token: Helper.token(user),
                });
            } else {
                res
                    .status(404)
                    .json({ status: false, message: Message.notFound("User") });
            }
        }
    } catch (e) {
        return Exception.handle(e, res, req, "");
    }
};

exports.loginWithMobileAndUdiseCode = async (req, res) => {
    try {
        const request = req.body;
        if (request.otp != req.ENV.DEFL_OTP) {
            res.status(200).json({ status: true, message: Message.invalidOTP() });
        } else {
            const user = await Model.SchoolUser.findOne({
                mobile: request.mobile,
                udise_code: request.udise,
            });
            if (user != null) {
                res.status(200).json({
                    status: true,
                    message: Message.logedIn(),
                    token: Helper.token(user),
                });
            } else {
                res
                    .status(404)
                    .json({ status: false, message: Message.notFound("School") });
            }
        }
    } catch (e) {
        return Exception.handle(e, res, req, "");
    }
};

exports.loginWithEmailPassword = async (req, res) => {
    try {
        const request = req.body;
        const user = await Model.User.findOne({
            email: request.email,
            password: request.password,
            is_active: 1,
        });
        if (user) {
            res.status(200).json({
                status: true,
                message: Message.logedIn(),
                token: Helper.token(user),
            });
        } else {
            res.status(404).json({ status: false, message: Message.invalidLogin() });
        }
    } catch (e) {
        return Exception.handle(e, res, req, "");
    }
};

exports.anonymousLogin = async (req, res) => {
    try {
        const request = req.body;
        const Models = request.flag == "school" ? Model.SchoolUser : Model.User;
        const user = await Models.findOne({ secret: request.secret });

        if (user != null) {
            await Models.update({ secret: null }, user.id);
            res.status(200).json({
                status: true,
                message: Message.logedIn(),
                token: Helper.token(user),
            });
        } else {
            res
                .status(404)
                .json({ status: false, message: Message.notFound("User") });
        }
    } catch (e) {
        return Exception.handle(e, res, req, "");
    }
};

exports.logout = async (req, res) => {
    try {
        return UserLog.update(req, res);
    } catch (e) {
        return Exception.handle(e, res, req, "");
    }
};
