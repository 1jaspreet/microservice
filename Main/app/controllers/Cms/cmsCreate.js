const express = require("express");
const multer = require("multer");
const routers = express.Router();
// const Model = require("../../models/Cms");
const Handler = require("../../handlers/Cms/cmsHandler");
const SubcatHandler = require("../../handlers/Cms/subcategoryHandler");
const path = require("path");
const fs = require("fs");
const { UPLOAD_FILE_PATH } = require("../../../config/env");
// const filePath = path.join(process.cwd(), 'resourses/views/pdf/', request.template + '.ejs');

// const Exception = require("../Assets/ExceptionHandler");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_FILE_PATH+"cms");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });
// /upload FOR SIGNLE FILE UPLOAD
// routers.post('/upload', upload.single('file'), (req, res) => {
//     const uploadedFile = req.file;
//     if (!uploadedFile) {
//         return res.status(400).send('No file uploaded.');
//     }
//     res.send('File uploaded successfully!');
// });

routers.post("/category/create", upload.single("file"), async (req, res) => {
  const uploadedFile = req?.file;
  const pathimg = uploadedFile?.path;
  return await Handler.cmsCreate(req, res, pathimg);
});
routers.post("/find", async (req, res) => {
  console.log("req.body", req.body);
  return await Handler.cmsFindById(req, res);
});

// routers.post("/amdbdgt", upload.single('file'), async (req, res)=> {
//     const uploadedFile = req.file;
//     console.log(uploadedFile?uploadedFile.path:null);
//     const img_icon =uploadedFile? uploadedFile.path:null

//     return await Handler.cmsCreate(req, res,img_icon);

//   })

// routers.post("/cmsFindBYId",async(req,res)=>{
//     console.log(req.body);
//     return await Handler.cmsFindById(req, res);
// })
routers.delete("/deleteBYId", async (req, res) => {
  return await Handler.deleteById(req, res);
});

routers.post("/cmsFindBYId", async (req, res) => {
  console.log(req.body);
  return await Handler.cmsFindById(req, res);
});
routers.post("/categoryupdatestatus", async (req, res) => {
  console.log(req.body);
  return await Handler.updateStatus(req, res);
});

// SUBCATEGORY API'S

routers.post("/subcategory/create", upload.single("file"), async (req, res) => {
  const uploadedFile = req?.file;
  const pathimg = uploadedFile?.path;
  return await SubcatHandler.cmsCreate(req, res, pathimg);
});

routers.post("/subcategory/", async (req, res) => {
  return await SubcatHandler.index(req, res);
});
routers.delete("/subcategory/deletebyid", async (req, res) => {
  return await SubcatHandler.deleteById(req, res);
});
// routers.post("/deleteBYId",async(req,res)=>{
//     return await Handler.deleteById(req, res);
// })

module.exports = routers;
