const Message = require("../../helpers/Message");
const Model = require("../../models");
const Hash = require("../../libraries").Hash;
const Exception = require("../Assets/ExceptionHandler");
const Volunteers = Model.Volunteers;
const Library = require("../../libraries");
//const Crypto = require('../../libraries/crypto');
const Helper = require("../../helpers/Helper");
const { Crypto } = require("../../libraries");
const UserLog = require("../Logs/UserLogHandler");
const path = require("path");
const { FileUploader } = require("../../middlware");
const CHelper = require("../../helpers/Common");
const fs = require("fs");

exports.index = async (req, res) => {
  try {
    const request = req.body;
    var where = {};
    const select = [
      "volunteer_name",
      "volunteer_mobile",
      "volunteer_email",
      "volunteer_country_id",
      "volunteer_address",
      "volunteer_postal_code",
      "volunteer_profile_image",
      "volunteer_dob",
      "sm.state_name",
      "dm.district_name",
      "rm.role_name",
      "vm.volunteer_type_name",
      "gm.gender_name",
      "qm.qualification_name",
    ];

    var Query = Volunteers.query()
      .leftJoin("master_states as sm", "sm.id", "=", "volunteer_state_id")
      .leftJoin("master_roles as rm", "rm.id", "=", "volunteer_role_id")
      .leftJoin(
        "master_volunteer_types as vm",
        "vm.id",
        "=",
        "volunteer_type_id"
      )
      .leftJoin("master_genders as gm", "gm.id", "=", "volunteer_gender_id")
      .leftJoin(
        "master_qualifications as qm",
        "qm.id",
        "=",
        "volunteer_qualification_id"
      )
      .leftJoin(
        "master_districts as dm",
        "dm.id",
        "=",
        "volunteer_district_id"
      );

    if (request.state > 0) {
      var where = { ...where, ...{ volunteer_state_id: request.state } };
    }

    if (request.district > 0) {
      var where = { ...where, ...{ volunteer_district_id: request.district } };
    }

    if (request.type > 0) {
      var where = {
        ...where,
        ...{ volunteer_volunteer_type_id: request.type },
      };
    }

    if (request.gender > 0) {
      var where = { ...where, ...{ volunteer_gender_id: request.gender } };
    }

    if (request.qualification > 0) {
      var where = {
        ...where,
        ...{ volunteer_qualification_id: request.qualification },
      };
    }

    const object = await Query.select(select)
      .where(where)
      .limit(request.limit)
      .offset(request.limit * (request.page - 1));

    const count = await Volunteers.count(where);

    res.status(200).json({ status: true, data: object, count: count });
  } catch (e) {
    return Exception.handle(e,res,req,'');
  }
};

exports.checkVolunteerOffline = async (req, res) => {
  try {
    const request = req.body;
    const email = await Volunteers.findOne({ volunteer_email: request.email });
    // if (email != null) {
    //     return res.status(200).json({ status: false, message: Message.exists('Email') });
    // }
    // const mobile = await Volunteers.findOne({ volunteer_mobile: request.mobile });

    // if (mobile != null) {
    //     return res.status(200).json({ status: false, message: Message.exists('Mobile') });
    // }
    // if (request.flag == 'volunteer') {
    //     if (request.country == '91') {
    //         return res.status(200).json(Library.OTPMaker.send(request.mobile));
    //     } else {
    //         return res.status(200).json(Library.OTPMaker.sendEmail(request.email));
    //     }
    // } else {
    //     return res.status(200).json(Library.OTPMaker.send(request.mobile));
    // }
  } catch (e) {
    return Exception.handle(e,res,req,'');
  }
};

exports.checkVolunteer = async (req, res) => {
  try {
    const request = req.body;
    const email = await Volunteers.findOne({ volunteer_email: request.email });
    if (email != null) {
      return res
        .status(200)
        .json({ status: false, message: Message.exists("Email") });
    }
    const mobile = await Volunteers.findOne({
      volunteer_mobile: request.mobile,
    });

    if (mobile != null) {
      return res
        .status(200)
        .json({ status: false, message: Message.exists("Mobile") });
    }
    if (request.flag == "volunteer") {
      if (request.country == "91") {
        return res.status(200).json(Library.OTPMaker.send(request.mobile));
      } else {
        return res.status(200).json(Library.OTPMaker.sendEmail(request.email));
      }
    } else {
      return res.status(200).json(Library.OTPMaker.send(request.mobile));
    }
  } catch (e) {
    return Exception.handle(e,res,req,'');
  }
};

exports.storeVolunteer = async (req, res) => {
  try {
    const request = req.body;
    if (Crypto.decrypt(request.otc) == request.captcha) {
      if (request.otp != null && request.otc != null) {
        if (
          Crypto.decrypt(request.ots) == request.otp ||
          request.otp == req.ENV.DEFL_OTP
        ) {
          const email = await Volunteers.findOne({
            volunteer_email: request.email,
          });
          if (email != null) {
            return res
              .status(200)
              .json({ status: false, message: Message.exists("Email") });
          }
          const mobile = await Volunteers.findOne({
            volunteer_mobile: request.mobile,
          });

          if (mobile != null) {
            return res
              .status(200)
              .json({ status: false, message: Message.exists("Mobile") });
          }
          var data = {
            volunteer_name: request.name,
            volunteer_email: request.email,
            volunteer_mobile: request.mobile,
            volunteer_status: 1,
            volunteer_state_id: request.state,
            volunteer_district_id: request.district,
          };

          if (request.flag == "volunteer") {
            var data = { ...data, volunteer_country_id: request.country };
          } else {
            var data = {
              ...data,
              darpan_id: request.darpanId,
              pancard_number: request.pan,
            };
          }

          const result = await Volunteers.create(data);

          if (result !== null) {
            if (request.ListingFlag) {
              const user = await Volunteers.findOne({
                volunteer_mobile: request.mobile,
              });
              if (user !== null) {
                const session = Crypto.encrypt(user.id);
                const object = {
                  status: true,
                  token: Helper.token(req, user, session, request.flag),
                };
                UserLog.handle(req, res, user, session, request.flag);
                return res.status(200).json(object);
              }
            } else {
              return res.status(200).json({ status: true });
            }
          }
          return res.status(200).json({ status: false });
        }
        return res
          .status(200)
          .json({ status: false, message: Message.invalidOTP() });
      }
      return res
        .status(200)
        .json({ status: false, message: Message.invalidOTP() });
    }

    return res
      .status(200)
      .json({ status: false, captcha: true, message: Message.captcha() });
  } catch (e) {
    return Exception.handle(e,res,req,'');
  }
};

// exports.index = async (req,res) =>{
//     try{
//         //res.status(200).json({status:true,message: 'success','data':req.headers.token});
//         //res.status(200).json({status:true,message: 'success','data':JSON.parse(Hash.decrypt(req.headers.token))});
//         const data  =  await User.all(req.body);
//         res.status(200).json({status:true,message: 'success','data':data});
//     }catch(e){
//         return Exception.handle(e,res,req,'');
//     }
// }

exports.create = async (req, res) => {
  try {
    const request = req.body;
    request.flag = true;
    if (request.permision == 1) {
      var search = {
        state_id: request.state,
        role_id: request.role,
        permision: 1,
      };
      var role = "state";

      if (request.role == 6) {
        var search = { ...search, district_id: request.district };
        var role = "district";
      }

      if ((await Volunteers.count(search)) >= 1) {
        res.status(200).json({
          status: true,
          message: `Cannot create more than one ${role} editor.`,
        });
      }
    }

    if (await Volunteers.isEmailExist(request)) {
      res.status(200).json({
        status: true,
        message: Message.exists("Email-Id " + request.email),
      });
    }

    if (await Volunteers.isMobileExist(request)) {
      res.status(200).json({
        status: true,
        message: Message.exists("Mobile number " + request.mobile),
      });
    }

    const result = await Volunteers.create({
      name: request.name,
      email: request.email,
      mobile: request.mobile,
      role_id: request.role,
      designation_id: request.designation,
      state_id: request.state,
      district_id: request.district,
      permision: request.permision,
    });
    const message = result ? Message.created("Volunteers") : Message.default();
    res.status(200).json({ status: true, message: message });
  } catch (e) {
    return Exception.handle(e,res,req,'');
  }
};

exports.completeProfile = async (req, res) => {
  try {
    const request = req.body;
    const result = await Volunteers.findOne({ id: request.uid });
    if (result != null) {
      var data = {};
      if (request.gender !== undefined) {
        var data = { ...data, volunteer_gender_id: request.gender };
      }
      if (request.specializations !== undefined) {
        var data = {
          ...data,
          volunteer_qualification_id: request.specializations,
        };
      }
      if (request.state !== undefined) {
        var data = { ...data, volunteer_state_id: request.state };
      }
      if (request.district !== undefined) {
        var data = { ...data, volunteer_district_id: request.district };
      }
      const updateObject = await Volunteers.update(data, request.uid);
      if (updateObject != null) {
        const user = await Volunteers.findOne({ id: request.uid });
        const flag = "volunteer";
        const session = Crypto.encrypt(user.id);
        const object = {
          status: true,
          token: Helper.token(req, user, session, flag),
        };
        return res.status(200).json(object);
      }
      // const message = (object) ? Message.updated('Volunteer') : Message.default();
      // res.status(200).json({ status: true, message: message });
    } else {
      res
        .status(200)
        .json({ status: false, message: Message.notFound("Record") });
    }
  } catch (e) {
    return Exception.handle(e,res,req,'');
  }
};

exports.update = async (req, res) => {
  try {
    const request = req.body;
    request.flag = false;

    if (await Volunteers.isEmailExist(request)) {
      res.status(200).json({
        status: true,
        message: Message.exists("Email-Id " + request.email),
      });
    }

    if (await Volunteers.isMobileExist(request)) {
      res.status(200).json({
        status: true,
        message: Message.exists("Mobile number " + request.mobile),
      });
    }

    const object = Volunteers.findOne({ id: request.id });
    const result = await object.update({
      name: request.name,
      email: request.email,
      mobile: request.mobile,
      role_id: request.role,
      designation_id: request.designation,
    });

    const message = result ? Message.updated("Volunteers") : Message.default();
    res.status(200).json({ status: true, message: message });
  } catch (e) {
    return Exception.handle(e,res,req,'');
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const request = req.body;
    const object = await Volunteers.findOne({ id: request.id });
    const result = await object.update({
      is_active: State.status === 1 ? 0 : 1,
    });
    const message = result
      ? Message.status("Volunteers", object.status)
      : Message.default();
    res.status(200).json({ status: true, message: message });
  } catch (e) {
    return Exception.handle(e,res,req,'');
  }
};

exports.approve = async (req, res) => {
  try {
    const request = req.body;
    const object = await Volunteers.findOne({ id: request.id });
    const result = await object.update({
      is_approve: State.status === 1 ? 0 : 1,
    });
    const message = result
      ? Message.approve("Volunteers", object.status)
      : Message.default();
    res.status(200).json({ status: true, message: message });
  } catch (e) {
    return Exception.handle(e,res,req,'');
  }
};

exports.findUserByRole = async (req, res) => {
  try {
    const role = req.body.role;
    const data = await Volunteers.find({ role_id: role });
    res.status(200).json({ status: true, message: "success", data: data });
  } catch (e) {
    return Exception.handle(e,res,req,'');
  }
};

exports.findById = async (req, res) => {
  try {
    const { id } = req.body;
    const data = await Volunteers.findOne({ id });
    res.status(200).json({
      status: true,
      message: "success",
      data: data,
      token: Helper.decodeToken(req).user,
    });
  } catch (e) {
    return Exception.handle(e,res,req,'');
  }
};

exports.findByEmail = async (req, res) => {
  try {
    const { email } = req.body.id;
    const data = await Volunteers.findOne({ email });
    res.status(200).json({ status: true, message: "success", data: data });
  } catch (e) {
    return Exception.handle(e,res,req,'');
  }
};

exports.findByMobile = async (req, res) => {
  try {
    const { mobile } = req.body.mobile;
    const data = await Volunteers.findOne({ mobile });
    res.status(200).json({ status: true, message: "success", data: data });
  } catch (e) {
    return Exception.handle(e,res,req,'');
  }
};

exports.findByUdiseCode = async (req, res) => {
  try {
    const udise = req.body.udise;
    const data = await Volunteers.findOne({ udise_code: udise });
    res.status(200).json({ status: true, message: "success", data: data });
  } catch (e) {
    return Exception.handle(e,res,req,'');
  }
};

exports.getIdByUdiseCode = async (udise) => {
  const user = await Volunteers.findOne({ udise_code: udise });
  return user != null ? Volunteers.id : null;
};

exports.generateLink = async (req, res) => {
  const request = req.body;
  const secret = "sdf46sd4f6";
  const Models = request.flag == "school" ? Model.SchoolUser : Volunteers;
  const count = await Models.count({ id: req.body.id });
  if (count == 1) {
    await Models.update({ secret: secret }, req.body.id);
    res.status(200).json({
      status: true,
      url: `${req.ENV.WEB_URL}${request.flag}/anonymous/${secret}`,
    });
  }
};

exports.findMobile = async (req, res) => {
  try {
    const request = req.body;
    const token = Helper.decodeToken(req).user;
    const mobile = await Volunteers.isMobileExist({
      mobile: request.mobile,
      id: request.id,
    });
    if (mobile === false) {
      if (token.volunteer_mobile === request.mobile) {
        res.status(200).json({
          status: false,
          message: "This mobile number already exist in database.",
          mobile: mobile,
        });
      } else {
        res.status(200).json(Library.OTPMaker.send(request.mobile));
      }
    } else {
      res.status(200).json({
        status: false,
        message: "This mobile number already exist in database.",
        mobile: mobile,
      });
    }
  } catch (e) {
    return Exception.handle(e,res,req,'');
  }
};

exports.findEmail = async (req, res) => {
  try {
    const request = req.body;
    const token = Helper.decodeToken(req).user;
    const email = await Volunteers.isEmailExist({
      email: request.email,
      id: request.id,
    });
    if (email === false) {
      if (token.volunteer_email === request.email) {
        res.status(200).json({
          status: false,
          message: "This email number already exist in database.",
          email: email,
        });
      } else {
        res.status(200).json(Library.OTPMaker.send(request.email));
      }
    } else {
      res.status(200).json({
        status: false,
        message: "This email number already exist in database.",
        email: email,
      });
    }
  } catch (e) {
    return Exception.handle(e,res,req,'');
  }
};

exports.updateEditUser = async (req, res) => {
  try {
    const request = req.body;
    if (Crypto.decrypt(request.otc) == request.captcha) {
      if (
        Crypto.decrypt(request.ots) == request.otp ||
        request.otp == req.ENV.DEFL_OTP
      ) {
        if (request.flag === "mobile") {
          const object = await Volunteers.update(
            { volunteer_mobile: request.mobile },
            req.body.id
          );
          const message = object
            ? Message.updated("Volunteer")
            : Message.default();
          return res
            .status(200)
            .json({ status: true, message: message, object: object });
        }
        if (request.flag === "email") {
          const object = await Volunteers.update(
            { volunteer_email: request.email },
            req.body.id
          );
          const message = object
            ? Message.updated("Volunteer")
            : Message.default();
          return res
            .status(200)
            .json({ status: true, message: message, object: object });
        }
      } else {
        return res.status(200).json({ status: false, message: "otp match" });
      }
      return res.status(200).json({ status: false, message: "captcha match" });
    }
  } catch (e) {
    return Exception.handle(e,res,req,'');
  }
};

exports.fetchUser = async (req, res) => {
  try {
    const token = Helper.decodeToken(req);
    if (token.flag === "school") {
      const object = await Model.School.findOne({ id: token.user.id });
      return res.status(200).json({ status: true, data: object });
    }
    if (token.flag === "admin") {
      const object = await Model.AdminUser.findOne({ id: token.user.id });
      return res.status(200).json({ status: true, data: object });
    }
    if (token.flag === "volunteer") {
      const object = await Model.Volunteers.findOne({ id: token.user.id });
      return res.status(200).json({ status: true, data: object });
    }
  } catch (e) {
    return Exception.handle(e,res,req,'');
  }
};

exports.updateUser = async (req, res) => {
  try {
    const request = req.body;
    const parseToken = Helper.decodeToken(req);
    const result = await Volunteers.findOne({ id: parseToken.user.id });
    var data = {};
    if (result != null) {
      if (request.name !== undefined) {
        var data = { ...data, volunteer_name: request.name };
      }
      if (request.gender !== undefined) {
        var data = { ...data, volunteer_gender_id: request.gender };
      }
      if (request.qualification !== undefined) {
        var data = {
          ...data,
          volunteer_qualification_id: request.qualification,
        };
      }
      if (request.state !== undefined) {
        var data = { ...data, volunteer_state_id: request.state };
      }
      if (request.district !== undefined) {
        var data = { ...data, volunteer_district_id: request.district };
      }
      if (request.postalCode !== undefined) {
        var data = { ...data, volunteer_postal_code: request.postalCode };
      }
      if (request.dob !== undefined) {
        var data = { ...data, volunteer_dob: request.dob };
      }

      if (Object.keys(data).length > 0) {
        const object = await Volunteers.update(data, parseToken.user.id);
        const user = await Volunteers.findOne({ id: parseToken.user.id });
        const message = object
          ? Message.updated("Volunteer")
          : Message.default();
        const token = {
          status: true,
          token: Helper.token(
            req,
            user,
            parseToken.session_id,
            parseToken.flag
          ),
        };
        return res
          .status(200)
          .json({ status: true, message: message, token: token });
      } else {
        return res
          .status(200)
          .json({ status: false, message: "There are no changes found." });
      }
    } else {
      res
        .status(200)
        .json({ status: false, message: Message.notFound("Record") });
    }
  } catch (e) {
    return Exception.handle(e,res,req,'');
  }
};

exports.fetchUserProfilePicture = async (req, res) => {
  try {
    const parseToken = Helper.decodeToken(req);
    const Module =
      parseToken.flag === "school" ? Model.School : Model.Volunteers;
    const result = await Module.findOne({ id: parseToken.user.id });
    if (result != null) {
      const image =
        parseToken.flag === "school"
          ? result.school_profile_image
          : result.volunteer_profile_image;
      const file = CHelper.base64Encode(
        path.join(
          process.cwd(),
          `public/uploads/profile/${parseToken.flag}/` + image
        )
      );
      return res
        .status(200)
        .json({ status: true, file: `data:image/png;base64,${file}` });
    } else {
      res.status(200).json({ status: false, file: null });
    }
  } catch (e) {
    return Exception.handle(e,res,req,'');
  }
};

exports.updateUserProfilePicture = (req, res) => {
  try {
    req.singleFile = "profile";
    req.flag = "profile";
    const parseToken = Helper.decodeToken(req);
    req.pathname = `profile/${parseToken.flag}/`;

    FileUploader(req, res, (response) => {
      if (response.status) {
        const Module =
          parseToken.flag === "school" ? Model.School : Model.Volunteers;
        Module.findOne({ id: parseToken.user.id }).then((result) => {
          const image =
            parseToken.flag === "school"
              ? result.school_profile_image
              : result.volunteer_profile_image;
          if (image !== null || image !== "") {
            const filePath = path.join(
              process.cwd(),
              `public/uploads/profile/${parseToken.flag}/` + image
            );
            fs.exists(filePath, (exists) => {
              if (exists) {
                fs.unlink(filePath, (err) => {
                  if (err) {
                    return Exception.handle(e,res,req,'');
                  }
                });
              }
            });
          }
        });
        const key =
          parseToken.flag === "school"
            ? "school_profile_image"
            : "volunteer_profile_image";
        Module.update({ [key]: response.filename }, parseToken.user.id)
          .then((result) => {
            return res.status(200).json({
              status: true,
              message: Message.updated("Profile picture"),
            });
          })
          .catch((err) => {
            return res
              .status(200)
              .json({ status: false, message: Message.default() });
          });
      } else {
        return res
          .status(200)
          .json({ status: false, message: Message.default() });
      }
    });
  } catch (e) {
    return Exception.handle(e,res,req,'');
  }
};
