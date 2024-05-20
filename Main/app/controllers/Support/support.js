const express = require("express");
const multer = require("multer");
const routers = express.Router();
// const Model = require("../../models/Cms");
const Handler = require("../../handlers/Support/support");
const SupportModel = require("../../models/Support/SupportModel");
const AdminUser = require("../../models").AdminUser;
const Prabandh = require("../../models").Prabandh;
const path = require("path");
const fs = require("fs");
const DTime = require('node-datetime');

const MailerHandler = require("../../mails");
const { UPLOAD_FILE_PATH } = require("../../../config/env");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let filePath = path.join(__dirname + '../../../../' + UPLOAD_FILE_PATH + "/ticket");
    if (!fs.existsSync(filePath)) {
      fs.mkdirSync(filePath, { recursive: true });
    }
    cb(null, filePath);
  },
  filename: function (req, file, cb) {
    console.log(file.fieldname, Date.now(), path.extname(file.originalname), file.originalname)
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

routers.post("/ticket-list", async (req, res) => {
  const { id } = req.body;

  const data = await Prabandh.knx().raw(`select tickets.* from tickets left join admin_users u on  CAST(u.id AS INTEGER) = CAST(tickets.user_id AS INTEGER)  where parent_id is null and u.user_role_id>=${id} order by id`);
  if (data && data.rows) {
    res.status(200).json(data.rows);
  } else {
    res.status(200).json([]);
  }
});

routers.post("/ticket-detail", async (req, res) => {
  const { id } = req.body;

  const data = await Prabandh.knx().raw(`select tickets.*, u.user_name as addedBy from tickets left join admin_users u on  CAST(u.id AS INTEGER) = CAST(tickets.user_id AS INTEGER)  where parent_id=${id} order by id`);
  if (data && data.rows) {
    res.status(200).json(data.rows);
  } else {
    res.status(200).json([]);
  }
});

routers.post("/ticket", upload.single("screenshot"), async (req, res) => {
  let { id, description, subject, user_id, parent_id, module, status } = req.body;
  const uploadedFile = req.file;
  let afterCreate;
  const created_by = req.auth.user.id;
  const updated_at = DTime.create().format("Y-m-d H:M:S");

  let file;
  if (uploadedFile) {
    file = uploadedFile?.filename;
  }

  if (!parent_id) {
    parent_id = null;
  }

  if (!id) {
    afterCreate = await SupportModel.create({ file, description, subject, user_id, parent_id, module, created_by });

    await MailerHandler.craeteTicket(req, {
      subject: "Ticket Prabandh-" + subject,
      msg: description,
      to: ["somnathrx@gmail.com", "mvinodpal@gmail.com"],
    });
  } else {
    afterCreate = await SupportModel.update({ status, updated_by: created_by, updated_at }, id);
  }

  // const user = await AdminUser.findOne({"u.id":user_id});
  // afterCreate = await SupportModel.create({parent_id:parent_id, description, user_id});

  res.status(200).json({
    status: true,
    message: "success",
    data: afterCreate,
  });
});

routers.post("/addActivity", async (req, res) => {
  try {
    const { id, major_component_id, scheme_id, serial_number, sub_component_id, title } = req.body
    const created_by = req.auth.user.id;

    const afterCreate = await SupportModel.createact({ created_by, id, major_component_id, scheme_id, serial_number, sub_component_id, title });
    if (afterCreate) {

      res.status(200).json({
        status: true,
        message: "success",
        data: afterCreate,
      })
    } else {
      res.status(400).json({
        status: false,
        message: false,
      })
    }
  } catch (error) {
    res.status(500).json({
      status: false,
      message: JSON.stringify(error),
    })
  }
})

module.exports = routers;