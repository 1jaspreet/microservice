const Model = require("../models");
const MailerHandler = require("../mails");
const SMSHandler = require("../sms");
const Crypto = require("./crypto");
const env = require("../../config/env");

exports.sendEmail = (email) => {
  const Crypto = require("./crypto");
  const Helper = require("../helpers/Helper");
  const OTP = Helper.otpMaker(6);
  return {
    status: true,
    ots: Crypto.encrypt(OTP),
    message:
      "OTP sent on email number " +
      email.substr(0, 2) +
      "******" +
      email.substr(-10),
  };
};
exports.send = (req, mobile, email) => {
  const request = req.body;
  const Crypto = require("./crypto");
  const Helper = require("../helpers/Helper");
  const OTP = Helper.otpMaker(6);

  // return {
  //   status: true,
  //   ots: Crypto.encrypt(OTP),
  //   message:
  //     "OTP sent on mobile number " +
  //     mobile.substr(0, 3) +
  //     "*****" +
  //     mobile.substr(7, 3),
  // };

  if (mobile !== null) {
    return getOtpTime(request.flag, mobile).then((data) => {
      console.log("getOtpTime-------------", data);
      if (data === undefined) {
        return { status: false, message: "Unauthorized Access." };
      }
      if (data !== null && data.valid_otp_time === null) {
        return sendOTP(req, request, data.id, mobile, email, OTP);
      } else {
        const timeIntervel = +Date.now() / 1000 - +data.valid_otp_time / 1000;
        console.log("timeIntervel===>>>0", timeIntervel);
        if (timeIntervel < 120) {
          return {
            status: false,
            message: "Previous OTP is still valid.",
            time: timeIntervel,
            ots: Crypto.encrypt(OTP),
          };
        } else {
          return sendOTP(req, request, data.id, mobile, email, OTP);
        }
      }
    });
  } else {
    return { status: false, message: "Unauthorized Access." };
  }
};

const getOtpTime = async (flag, mobile) => {
  if (flag == "admin") {
    return await Model.AdminUser.findOne({ user_mobile: mobile });
  }
  if (flag == "volunteer") {
    return await Model.Volunteers.findOne({ volunteer_mobile: mobile });
  }
  if (flag == "school") {
    return await Model.School.findOne({ school_mobile: mobile });
  }
};

const sendOTP = async (req, request, id, mobile, email, OTP) => {
  if (env.APP_ENV === "production") {
    if (email) {
      let mailResult = await MailerHandler.sendOTP(req, {
        OTP: OTP,
        to: email,
      });
      console.log("mailResult", mailResult);
    }
    let smsResult = await SMSHandler.sendOTP(req, { OTP: OTP, mobile: mobile });
    setOtpTime(request, id);
    // console.log({ 'status': true, 'ots': Crypto.encrypt(OTP), 'message': "OTP sent on mobile number " + mobile.substr(0, 3) + "*****" + mobile.substr(7, 3) })
    return {
      status: true,
      ots: Crypto.encrypt(OTP),
      res: smsResult,
      message:
        "OTP sent on mobile number " +
        mobile.substr(0, 3) +
        "*****" +
        mobile.substr(7, 3),
    };
  } else {
    return {
      status: true,
      ots: Crypto.encrypt(OTP),
      OTP: OTP,
      message:
        "OTP sent on mobile number " +
        mobile.substr(0, 3) +
        "*****" +
        mobile.substr(7, 3),
    };
  }
};

const setOtpTime = (request, id) => {
  const updated_by = null; //request.auth.user.id;
  const object = { valid_otp_time: Date.now(), updated_by };
  if (request.flag == "admin") {
    Model.AdminUser.update(object, id);
  }
  if (request.flag == "volunteer") {
    Model.Volunteers.update(object, id);
  }
  if (request.flag == "school") {
    Model.School.update(object, id);
  }
};

const sendEmail = (email) => {
  var headers = new Headers();
  headers.append("Content-Type", "application/json");
  var body = JSON.stringify({ email: email });
  var data = {
    method: "GET",
    headers: headers,
    body: body,
    redirect: "follow",
  };

  fetch(env.BASE_URL + "auth/otp/send", data)
    .then((response) => response.text())
    .then((result) => console.log(result))
    .catch((error) => console.log("error", error));
};

const send = (mobile) => {
  var headers = new Headers();
  headers.append("Content-Type", "application/json");
  var body = JSON.stringify({ mobile: mobile });
  var data = {
    method: "GET",
    headers: headers,
    body: body,
    redirect: "follow",
  };

  fetch(env.BASE_URL + "auth/otp/send", data)
    .then((response) => response.text())
    .then((result) => console.log(result))
    .catch((error) => console.log("error", error));
};
