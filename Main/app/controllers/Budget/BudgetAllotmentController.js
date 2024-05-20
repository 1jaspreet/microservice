const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { UPLOAD_FILE_PATH } = require("../../../config/env");
const routers = express.Router();
const Handler = require("../../handlers").BudgetAllotmentHandler;

function checkMimeType(file) {
  switch (file.mimetype) {
      case 'application/pdf':
      case 'application/msword':
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      case 'image/png':
          return true;
      default:
          return false;
  }
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (checkMimeType(file)) {
      let filePath = path.join(__dirname + '../../../../' + UPLOAD_FILE_PATH + "/fundreleased");
      if (!fs.existsSync(filePath)) {
        fs.mkdirSync(filePath, { recursive: true });
      }
      cb(null, filePath);
    } else {
      cb(new Error('Invalid file type. Please upload a valid file.'));
    }
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});
const upload = multer({ storage: storage });


routers.post("/allot", upload.single("file"), async (req, res, next) => {
  try {
    return await Handler.allotBudget(req, res);
  } catch (err) {
    // Handle multer errors
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: 'Multer error', message: err.message });
    } else {
      // Pass other errors to the next middleware
      return res.status(500).json({ error: 'Internal server error' });
      // next(err);
    }
  }
});

routers.post("/state-approved-list", async (req, res) => {
  return await Handler.stateApprovedList(req, res);
});

routers.post("/district-approved-list", async (req, res) => {
  return await Handler.districtApprovedList(req, res);
});

routers.get('/downloadfile/:id/', async (req, res) => {
  return await Handler.downloadFile(req, res);
});

routers.post("/approve", async (req, res) => {
  return await Handler.approveBudget(req, res);
});

routers.post("/get-allocations", async (req, res) => {
  return await Handler.getAllocatedBudget(req, res);
});

routers.post("/get-approved-budget", async (req, res) => {
  return await Handler.getApprovedBudget(req, res);
});

routers.post("/get-state-approved-budget", async (req, res) => {
  return await Handler.getApprovedBudgetForState(req, res);
});

routers.post("/get-state-alloted-budget", async (req, res) => {
  return await Handler.getAllotedBudgetForState(req, res);
});

routers.post("/save-sna-detail", async (req, res) => {
  return await Handler.saveSnaDetail(req, res);
});

routers.post("/sna-detail", async (req, res) => {
  return await Handler.snaDetail(req, res);
});

routers.post("/save-diet-budget-allot", upload.single("file"), async (req, res) => {
  try {
    return await Handler.saveDietBudgetAllot(req, res);
  } catch (err) {
    // Handle multer errors
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: 'Multer error', message: err.message });
    } else {
      // Pass other errors to the next middleware
      return res.status(500).json({ error: 'Internal server error' });
      // next(err);
    }
  }
});

routers.get('/download-diet-file/:id/', async (req, res) => {
  return await Handler.downloadDietFile(req, res);
});



module.exports = routers;
