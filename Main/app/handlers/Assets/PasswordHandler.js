const Model = require("../../models");
const Library = require("../../libraries");
const Message = require("../../helpers/Message");
const Helper = require("../../helpers/Helper");
const Exception = require("./ExceptionHandler");
const Response = require("./ResponseHandler");
const Crypto = require("../../libraries/crypto");
const { appendFile } = require("fs-extra");
const MailerHandler = require("../../mails");

exports.validateUser = async (req, res) => {
  try {
    const request = req.body;
    if (Crypto.decrypt(request.otc) == request.captcha) {
      if (request.flag == "admin") {
        const user = await Model.AdminUser.findOne({
          user_email: request.email,
          user_mobile: request.mobile,
        });
        if (user != null) {
          const token = Crypto.encrypt(
            request.email + "|" + request.mobile + "|" + request.flag
          );
          let ots = await Library.OTPMaker.send(
            req,
            user.user_mobile,
            user.user_email
          );
          let response = await { ...ots, token: token };
          console.log("111111111", ots, token);
          return res.status(200).json(response);
        }
        return res
          .status(200)
          .json({ status: false, message: Message.unauthorized() });
      }
      if (request.flag == "school") {
        const user = await Model.School.findOne({
          udise_code: request.udise,
          school_onboard: 1,
        });
        if (user != null) {
          const token = Crypto.encrypt(
            request.udise + "|" + request.mobile + "|" + request.flag
          );
          return res.status(200).json({
            ...Library.OTPMaker.send(user.school_mobile),
            token: token,
          });
        }
        return res
          .status(200)
          .json({ status: false, message: Message.unauthorized() });
      }
      /*if(request.flag == 'school'){
                const user  =   await Model.School.findOne({school_email:request.email,school_mobile:request.mobile,school_onboard:1});                    
                if(user !=null){
                    const token = Crypto.encrypt(request.email+'|'+request.mobile+'|'+request.flag);
                    return res.status(200).json({...Library.OTPMaker.send(user.school_mobile),token:token}); 
                }
                return res.status(200).json({status:false,message:Message.unauthorized()});
            }*/
      if (request.flag == "volunteer") {
        const user = await Model.Volunteers.findOne({
          volunteer_email: request.email,
          volunteer_mobile: request.mobile,
          volunteer_status: 1,
        });
        if (user != null) {
          const token = Crypto.encrypt(
            request.email + "|" + request.mobile + "|" + request.flag
          );
          return res.status(200).json({
            ...Library.OTPMaker.send(user.volunteer_mobile),
            token: token,
          });
        }
        return res
          .status(200)
          .json({ status: false, message: Message.unauthorized() });
      }
    }
    return res
      .status(200)
      .json({ status: false, captcha: true, message: Message.captcha() });
  } catch (e) {
    return Exception.handle(e, res, req, "validateUser");
  }
};

exports.validateToken = async (req, res) => {
  try {
    const request = req.body;
    console.log("DDDDDDDDDD", Crypto.decrypt(request.token));
    const object = Crypto.decrypt(request.token).split("|");
    if (object[2] == "admin") {
      const user = await Model.AdminUser.findOne({
        user_email: object[0],
        user_mobile: object[1],
      });
      if (user != null) {
        const OTP = Helper.otpMaker(6);
        console.log("OTP-------------", OTP);
        return res
          .status(200)
          .json({ status: true, data: { ots: Crypto.encrypt(OTP) } });
      }
      return res
        .status(404)
        .json({ status: false, message: Message.unauthorized() });
    }
    if (object[2] == "school") {
      const user = await Model.School.findOne({
        udise_code: object[0],
        school_onboard: 1,
      });
      if (user != null) {
        if (user.school_mobile.length === 0) {
          return res
            .status(200)
            .json({ status: false, message: Message.mobile() });
        } else {
          return res
            .status(200)
            .json(Library.OTPMaker.send(user.school_mobile));
        }
      }
      return res
        .status(404)
        .json({ status: false, message: Message.unauthorized() });
    }
    if (object[2] == "volunteer") {
      const user = await Model.Volunteers.findOne({
        volunteer_email: object[0],
        volunteer_mobile: object[1],
        volunteer_status: 1,
      });
      if (user != null) {
        return res.status(200).json(Library.OTPMaker.send(object[1]));
      }
      return res
        .status(404)
        .json({ status: false, message: Message.unauthorized() });
    }
  } catch (e) {
    return Exception.handle(e, res, req, "validateToken");
  }
};

exports.validateOTP = async (req, res) => {
  try {
    const request = req.body;
    if (request.otp != null && request.ots != null) {
      if (
        Crypto.decrypt(request.ots) == request.otp ||
        request.otp == req.ENV.DEFL_OTP
      ) {
        return res.status(200).json({ status: true });
      }
      return res
        .status(200)
        .json({ status: false, message: Message.invalidOTP() });
    }
    return res
      .status(200)
      .json({ status: false, message: Message.invalidOTP() });
  } catch (e) {
    console.log("e", e);
    return Exception.handle(e, res, req, "validateOTP");
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const request = req.body;
    if (Crypto.decrypt(request.otc) == request.captcha) {
      //if((Crypto.decrypt(request.ots) == request.otp) || (request.otp == req.ENV.DEFL_OTP)){
      const object = Crypto.decrypt(request.token).split("|");
      if (request.flag == "admin") {
        const user = await Model.AdminUser.findOne({
          user_email: object[0],
          user_mobile: object[1],
        });
        return checkDuplicatePassword(
          request,
          res,
          user,
          Model.AdminUser,
          request.flag,
          (column = "user_password"),
          req
        );
      }

      if (request.flag == "school") {
        const user = await Model.School.findOne({
          udise_code: object[0],
          school_onboard: 1,
        });
        return checkDuplicatePassword(
          request,
          res,
          user,
          Model.School,
          request.flag,
          (column = "school_password")
        );
      }
      /*
                if(request.flag == 'school'){
                    const user      =   await Model.School.findOne({school_email:object[0],school_mobile:object[1],school_onboard:1}); 
                    return checkDuplicatePassword(request,res,user,Model.School,request.flag,column='school_password');
                }
                */
      if (request.flag == "volunteer") {
        const user = await Model.Volunteers.findOne({
          volunteer_email: object[0],
          volunteer_mobile: object[1],
          volunteer_status: 1,
        });
        return checkDuplicatePassword(
          request,
          res,
          user,
          Model.Volunteers,
          request.flag,
          (column = "volunteer_password")
        );
      }
      // }
      // return res.status(200).json({status:false,message:Message.invalidOTP()});
    }
    return res
      .status(200)
      .json({ status: false, captcha: true, message: Message.captcha() });
  } catch (e) {
    return Exception.handle(e, res, req, "resetPassword");
  }
};

exports.changePassword = async (req, res) => {
  try {
    const request = req.body;
    const jwt = require("jsonwebtoken");
    const auth = jwt.verify(request.token, req.ENV.JWT_TOKEN);

    if (auth) {
      const user = await Model.AdminUser.findOne({
        user_email: auth.user.user_email,
        user_mobile: auth.user.user_mobile,
        user_password: Helper.makeHash(request.oldpass),
      });

      if (user) {
        return checkDuplicatePassword(
          request,
          res,
          user,
          Model.AdminUser,
          "admin",
          (column = "user_password"),
          req
        );
      } else {
        return res
          .status(200)
          .json({ status: false, message: Message.notFound("User") });
      }
    } else {
      return res
        .status(200)
        .json({ status: false, message: Message.unauthorized() });
    }
  } catch (e) {
    return Exception.handle(e, res, req, "resetPassword");
  }
};

exports.checkUser = async (req, res) => {
  try {
    const object = Helper.decodeToken(req);
    if (
      (object.flag == "admin" || object.flag == "volunteer") &&
      object.user.user_mobile.length > 0
    ) {
      return res
        .status(200)
        .json(Library.OTPMaker.send(object.user.user_mobile));
    }
    if (object.flag == "school" && object.user.school_mobile.length > 0) {
      return res
        .status(200)
        .json(Library.OTPMaker.send(object.user.school_mobile));
    }
    return res.status(200).json({ status: false, message: Message.default() });
  } catch (e) {
    return Exception.handle(e, res, req, "checkUser");
  }
};

exports.sendOTP = async (req, res) => {
  try {
    const request = req.body;
    if (
      request.mobile === "" &&
      request.udise !== "" &&
      request.udise.length === 11
    ) {
      const user = await Model.School.findOne({
        udise_code: request.udise,
        school_onboard: 1,
      });
      if (user.school_mobile.length === 0) {
        return res
          .status(200)
          .json({ status: false, message: Message.mobile() });
      } else {
        return res.status(200).json(Library.OTPMaker.send(user.school_mobile));
      }
    } else {
      return res.status(200).json(Library.OTPMaker.send(req.body.mobile));
    }
  } catch (e) {
    return Exception.handle(e, res, req, "sendOTP");
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const request = req.body;
    if (Crypto.decrypt(request.otc) == request.captcha) {
      //if((Crypto.decrypt(request.ots) == request.otp) || (request.otp == req.ENV.DEFL_OTP)){
      const object = Helper.decodeToken(req).user;
      if (request.flag == "admin") {
        const user = await Model.AdminUser.findOne({
          user_email: object.user_email,
          user_mobile: object.user_mobile,
        });
        return checkDuplicatePassword(
          request,
          res,
          user,
          Model.AdminUser,
          request.flag,
          "user_password"
        );
      }
      if (request.flag == "school") {
        const user = await Model.School.findOne({
          school_email: object.school_email,
          school_mobile: object.school_mobile,
          school_onboard: 1,
        });
        return checkDuplicatePassword(
          request,
          res,
          user,
          Model.School,
          request.flag,
          "school_password"
        );
      }
      if (request.flag == "volunteer") {
        const user = await Model.Volunteers.findOne({
          volunteer_email: object.volunteer_email,
          volunteer_mobile: object.volunteer_mobile,
          volunteer_status: 1,
        });
        return checkDuplicatePassword(
          request,
          res,
          user,
          Model.Volunteers,
          request.flag,
          "volunteer_password"
        );
      }
      // }
      // return res.status(200).json({status:false,message:Message.invalidOTP()});
    }
    return res
      .status(200)
      .json({ status: false, captcha: true, message: Message.captcha() });
  } catch (e) {
    return Exception.handle(e, res, req, "updatePassword");
  }
};

const checkDuplicatePassword = async (
  request,
  res,
  user,
  Table,
  flag,
  column,
  req
) => {
  if (user != null) {
    const password = Helper.makeHash(request.password);
    const object = { [column]: password };
    const OLD_PASS = await Model.OLdPassword.count({
      user_id: user.id,
      flag: flag,
      password: password,
    });
    if (OLD_PASS > 0) {
      return res
        .status(200)
        .json({ status: false, message: Message.passwordUsed() });
    } else {
      Table.update(object, user.id);
      await MailerHandler.updateUser(req, {
        subject: "Change Password PRABANDH",
        msg: "Your Password updated successfully.",
        to: user.user_email,
        user_name: user.user_name,
        user_email: user.user_email,
        user_mobile: user.user_mobile,
        password: request.password,
      });
      Model.OLdPassword.create({
        user_id: user.id,
        flag: flag,
        password: password,
      });
      return res
        .status(200)
        .json({ status: true, message: Message.updated("Password") });
    }
  }
  return res
    .status(404)
    .json({ status: false, message: Message.unauthorized() });
};
