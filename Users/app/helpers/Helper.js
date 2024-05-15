const dateTime = require("node-datetime");

exports.token = (req, user, id, flag) => {
  const jwt = require("jsonwebtoken");
  const users = { user: user, session_id: id, IP: req.ip, flag: flag };
  return jwt.sign(users, req.ENV.JWT_TOKEN, { expiresIn: "5h" });
};

exports.codeMaker = (length) => {
  const string = "123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var code = "";
  for (i = 1; i <= length; i++) {
    var num = Math.random() * string.length;
    ("");
    code += string.charAt(num);
  }
  return code;
};

exports.otpMaker = (length) => {
  const string = "1234567890";
  var code = "";
  for (i = 1; i <= length; i++) {
    var num = Math.random() * string.length;
    ("");
    code += string.charAt(num);
  }
  return code;
};

exports.parseToken = (req) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      return res.status(403).send("A token is required for authentication");
    } else {
      const jwt = require("jsonwebtoken");
      return jwt.verify(token, req.ENV.JWT_TOKEN);
    }
  } catch (err) {
    return res.status(401).send("Invalid Token");
  }
};

exports.decodeToken = (req) => {
  const jwt_decode = require("jwt-decode");
  const token = req.headers.authorization.split(" ")[1];
  return jwt_decode(token);
};

exports.captcha = () => {
  const Captcha = require("nodejs-captcha");
  const result = Captcha();
  return { captcha: result.image, value: result.value };
};

exports.slug = (value) => {
  const slug = require("slug");
  return slug(value);
};

exports.validate = (req, res) => {
  const { validationResult } = require("express-validator");
  const errorFormatter = ({ msg }) => {
    return `${msg}`;
  };
  const errors = validationResult(req).formatWith(errorFormatter);
  return !errors.isEmpty()
    ? res.status(400).json({ errors: errors.mapped() })
    : null;
};

exports.paginate = (req, model) => {
  const page = parseInt(req.body.page);
  const limit = parseInt(req.body.limit);
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const result = {};

  if (endIndex < model.length) {
    result.page = page + 1;
    result.limit = limit;
  }
  if (startIndex > 0) {
    result.page = page - 1;
    result.limit = limit;
  }
  result.count = model.length;
  result.data = model.slice(startIndex, endIndex);
  return result;
};

exports.getManagementCenter = (type) => {
  const management = [
    "",
    "Department of Education",
    "Tribal Welfare Department",
    "Local body",
    "Government Aided",
    "Private Unaided (Recognized)",
    "Other Govt. managed schools",
    "Unrecognized",
    "Ministry of Labor",
    "Social welfare Department",
    "Kendriya Vidyalaya / Central School",
    "Jawahar Navodaya Vidyalaya ",
    "Sainik School",
    "Railway School",
    "Central Tibetan School",
    "Madrasa recognized (by Wakf board/Madrasa Board) ",
    "Madrasa unrecognized",
    "Others Central Government School",
  ];
  return management[type];
};

exports.getSchoolType = (type) => {
  const SType = ["", "Boys", "Girls", "Boys & Girls"];
  return SType[type];
};

exports.makeHash = (string) => {
  const { createHash } = require("crypto");
  return createHash("sha512").update(string).digest("hex");
};

//console.log(exports.makeHash('123456'))

exports.dateYMD = (string) => {
  //return dateTime.create(string).format('Y-m-d H:M:S');
  const LDate = string.split("/");
  return dateTime
    .create(LDate[2] + "-" + LDate[1] + "-" + LDate[0])
    .format("Y-m-d H:M:S");
};

exports.date = (string) => {
  //return (string).format('Y-m-d');
  const LDate = string.split("/");
  return dateTime
    .create(LDate[2] + "-" + LDate[1] + "-" + LDate[0])
    .format("Y-m-d");
};

exports.badge = (total) => {
  var count = +(total + 1);
  if (count >= 1 && count <= 4) {
    return 1;
  }
  if (count > 4 && count <= 9) {
    return 2;
  }
  if (count > 9 && count <= 14) {
    return 3;
  }
  if (count > 14 && count <= 19) {
    return 4;
  }
  if (count > 19 && count <= 24) {
    return 5;
  }
  if (count > 24) {
    return 6;
  }
};

exports.getLatestTime = (object) => {
  const latestUpdatedAt = object.reduce((latest, current) => {
    if (current.updated_at) {
      const currentTimestamp = new Date(current.updated_at).getTime();
      return currentTimestamp > latest ? currentTimestamp : latest;
    }
    return latest;
  }, 0);
  return (formattedLatestUpdatedAt = latestUpdatedAt
    ? new Date(latestUpdatedAt).toLocaleString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: true,
      })
    : "");
};
