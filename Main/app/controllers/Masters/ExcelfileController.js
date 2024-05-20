const express = require("express");
const routers = express.Router();
const Helper = require("../../helpers/Helper");
const Handler = require("../../handlers").Uploadfile;
const multer = require("multer");
const path = require("path");
const Model = require("../../models").FilesData;
const StateFileModel = require("../../models").Statefileupload;
const supportModel = require("../../models").supportModel;
const fs = require("fs");
const xlsx = require("xlsx");
const csv = require("csv-parser");
const Hash = require("../../libraries/hash");
const Exception = require("../../handlers/Assets/ExceptionHandler");
const DTime = require('node-datetime'); 

function checkMimeType(file) {
  switch (file.mimetype) {
    case "application/pdf":
      return true;
    case "application/vnd.ms-excel":
      return true;
    case "text/csv":
      return true;
    case "image/png":
      return true;
    case "application/zip": // Adding ZIP file case
      return true;
    case "application/x-zip-compressed":
      return true;
    default:
      return false;
  }
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (checkMimeType(file)) {
      let userStateId = req.body.user_state_id;
      if (userStateId) {
        let userStatePath;
        if (userStateId == "null") {
          userStatePath = path.join(UPLOAD_FILE_PATH + "/uploads/state/0");
        } else {
          userStatePath = path.join(
            UPLOAD_FILE_PATH + "/uploads/state/",
            userStateId
          );
        }
        if (!fs.existsSync(userStatePath)) {
          fs.mkdirSync(userStatePath, { recursive: true });
        }
        cb(null, userStatePath);
      } else {
        cb(null, UPLOAD_FILE_PATH);
      }
    } else {
      cb(new Error("Invalid file type. Please upload a valid file."));
    }
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 },
});
// /upload FOR SIGNLE FILE UPLOAD
routers.post("/upload", upload.single("file"), (req, res) => {
  const uploadedFile = req.file;
  if (!uploadedFile) {
    return res.status(400).send("No file uploaded.");
  }
  res.send("File uploaded successfully!");
});


const uploadFile = require("../../middlware/FileUploadMiddlware");
const { pdfFromUrl } = require("../../handlers/Assets/PdfHandler");
const { UPLOAD_FILE_PATH } = require("../../../config/env");

routers.post("/", async (req, res) => {
  return await Handler.index(req, res);
});
routers.post("/getuploaddata", async (req, res) => {
  return await Handler.uploadDataFetch(req, res);
});
routers.delete("/delete", async (req, res) => {
  return await Handler.deleteById(req, res);
});



// /uploadfiles FOR MULTIFILE UPLOAD
routers.post("/uploadfiles", upload.array("files"), (req, res) => {
  const uploadedFile = req.files;
  if (!uploadedFile) {
    return res.status(400).send("No file uploaded.b vcbgdfbgfdbgfdbfgdbfgdbfgdb");
  }
  res.send({ message: "Files uploaded successfully!", data: req.files });
});

// ALL DETAIL OF MULTIFILE UPLOADED
routers.post("/uploaddetails", async (req, res) => {
  try {
    const object = await Model.create(req.body);
    const message = object
      ? "Document Added Successfully"
      : "Message.default()";
    res.status(200).json({ status: true, message: message });
  } catch (e) {
    // console.log(e)
  }
});
routers.post("/adduploaddetails", async (req, res) => {
  try {
    const object = await Model.insertGetId(req.body);
    const message = object
      ? "Document Added Successfully"
      : "Message.default()";
    res.status(200).json({ status: true, message: message, id: object[0] });
  } catch (e) {
    // console.log(e)
  }
});

const storagesingle = multer.memoryStorage();
const uploadsingle = multer({ storage: storagesingle });
// const Validate = require("../../validation").Mastertype;
routers.post(
  "/state-file-uploaded-detail",
  uploadsingle.single("file"),
  async (req, res) => {
    try {
      const csvData = req.file?.buffer?.toString("utf-8");
      const decryptObj = JSON.parse(Hash.decrypt(req.body.secure));
      const scheme_id = decryptObj.scheme_id;
      const major_component_id = decryptObj.major_component_id;
      const sub_component_id = decryptObj?.sub_component_id;
      const activity_id = decryptObj?.activity_id;
      const activity_detail_id = decryptObj?.activity_master_details_id;
      const state_id = decryptObj?.state_id;
      const user_id = decryptObj?.user_id;
      const year = decryptObj?.year;

      const updated_by = req.auth.user.id;
      const updated_at = DTime.create().format("Y-m-d H:M:S")

      let records = await new Promise((resolve, reject) => {
        const results = [];
        const parser = csv({ columns: true });
        parser.on("data", (data) => {
          results.push(data);
        });
        parser.on("end", () => resolve(results));
        parser.on("error", (error) => reject(error));
        parser.write(csvData);
        parser.end();
      });

      const deletebyState = await Model.knx().raw(
        `delete from public.prb_state_documents where state_id = '${state_id}' and activity_master_details_id = '${activity_detail_id}'`
      );

      let insert;
      if (deletebyState) {
        for (const record of records) {
          for (let key in record) {
            const sanitizedKey = key.replace(/"/g, "").trim();
            record[sanitizedKey] = record[key];
          }
          insert = await StateFileModel.create({
            udise_code:
              record.UDISE.length === 11 ? record.UDISE : 0 + record.UDISE,
            financial_amount: !isNaN(record?.["FINANCIAL AMOUNT"])
              ? +record?.["FINANCIAL AMOUNT"]
              : 0,
            physical_quantity: !isNaN(record?.["PHYSICAL QUANTITY"])
              ? +record?.["PHYSICAL QUANTITY"]
              : 0,
            state_id: state_id,
            scheme_id: scheme_id,
            major_component_id: major_component_id,
            sub_component_id: sub_component_id,
            activity_id: activity_id,
            activity_master_details_id: activity_detail_id,
            user_id: user_id,
            valid_assset: 0,
            plan_year: year,
            created_by: updated_by
          });
        }
      }
      let updateAssetcode;
      if (insert) {
        updateAssetcode = await Model.knx()
          .raw(`update public.prb_state_documents psd 
            set valid_assset = 1, updated_by = ${updated_by}, updated_at='${updated_at}' 
            from public.prb_school_master psm
            where psd.udise_code =  psm.udise_sch_code 
            and psd.activity_master_details_id  = '${activity_detail_id}' AND psd.financial_amount !='NAN' AND psd.physical_quantity != 'NAN'`);
      }
      if (updateAssetcode) {
        const data = await Model.knx()
          .raw(`SELECT psm.school_name, psds.valid_assset,psds.udise_code
            FROM prb_state_documents  psds left join prb_school_master psm on psds.udise_code = psm.udise_sch_code
           WHERE psds.state_id = '${state_id}' and psds.activity_master_details_id = '${activity_detail_id}' and psds.plan_year = '${year}'`);
        res.status(200).json({
          status: 200,
          data: data?.rows,
          message: "Document Inserted",
        });
      }
    } catch (e) {
      console.log(e);
      return Exception.handle(e, res, req, "state-file-uploaded-detail");
    }
  }
);

routers.get("/downloadfile/:id/:user_state_id", async (req, res) => {
  const id = req.params.id;
  const user_state_id = req.params.user_state_id;
  if (id.includes("ticket")) {
    const ticket = await supportModel.findExisting({ id: user_state_id });
    const paths = "/../../../" + UPLOAD_FILE_PATH;
    const excelFilePath = path.join(
      __dirname,
      `${paths}/ticket/${ticket?.file}`
    );
    // console.log("aaaaaaaa",excelFilePath )
    res.sendFile(excelFilePath, (err) => {
      if (err) {
        console.error("Error sending file:", err);
        res.status(err.status).end();
      } else {
      }
    });
  } else {
    if (user_state_id == "null") {
      user_state_id == 0;
    }
    const filename = await Model.findOne({ id });
    const paths = "/../../../" + UPLOAD_FILE_PATH;
    let excelFilePath;
    if (!filename.state_id) {
      excelFilePath = path.join(
        __dirname,
        `${paths}/uploads/state/0/${filename?.file_name}`
      );
    } else {
      excelFilePath = path.join(
        __dirname,
        `${paths}/uploads/state/${filename.state_id}/${filename?.file_name}`
      );
    }
    // console.log("aaaaaaaaaaa",excelFilePath )
    res.sendFile(excelFilePath, (err) => {
      if (err) {
        console.error("Error sending file:", err);
        res.status(err.status).end();
      } else {
      }
    });
  }
});
routers.get("/downloadfile/:id/", async (req, res) => {
  const id = req.params.id;
  const user_state_id = req.params.user_state_id;
  if (id.includes("ticket")) {
    const ticket = await supportModel.findExisting({ id: user_state_id });
    const paths = "/../../../" + UPLOAD_FILE_PATH;
    const excelFilePath = path.join(
      __dirname,
      `${paths}/ticket/${ticket?.file}`
    );
    // console.log("bbbbbbbbbbbb",excelFilePath )
    res.sendFile(excelFilePath, (err) => {
      if (err) {
        console.error("Error sending file:", err);
        res.status(err.status).end();
      } else {
      }
    });
  } else {
    const filename = await Model.findOne({ id });
    const paths = "/../../../" + UPLOAD_FILE_PATH;
    let excelFilePath;
    if (!filename.state_id) {
      excelFilePath = path.join(
        __dirname,
        `${paths}/uploads/state/0/${filename?.file_name}`
      );
    } else {
      excelFilePath = path.join(
        __dirname,
        `${paths}/uploads/state/${filename.state_id}/${filename?.file_name}`
      );
    }
    // console.log("bbbbbbbbbbbb",excelFilePath )
    res.sendFile(excelFilePath, (err) => {
      if (err) {
        console.error("Error sending file:", err);
        res.status(err.status).end();
      } else {
      }
    });
  }
});
const handleFileSelect = ($event) => {
  try {
    const files = $event.target.files;
    if (files.length) {
      const file = files[0];
      const reader = new FileReader();
      let fileType = file.name.split(".")[1].toLowerCase();
      let fileSize = file.size;

      reader.onload = (event) => {
        const wb = read(event.target.result);
        const sheets = wb.SheetNames;
        const rows = utils.sheet_to_json(wb.Sheets[sheets[0]]);

        const keys1 = Object.keys(file_format)
          .map((v) => v.toLocaleLowerCase())
          .sort();
        const keys2 = Object.keys(rows[0])
          .map((v) => v.toLocaleLowerCase())
          .sort();
        if (sheets.length && JSON.stringify(keys1) !== JSON.stringify(keys2)) {
          // document.getElementById("upload-2").value = "";
          alert("Please upload file with same format");
        } else if (sheets.length) {
          //   const rows = utils.sheet_to_json(wb.Sheets[sheets[0]]);
          //   setImportData(rows);
          //   setUploadFlag(true);
          //   progress = setInterval(() => {
          //     width = width + 10;
          //     // if (progressBar.current) {
          //     //   progressBar.current.children[0].style.setProperty(
          //     //     "width",
          //     //     `${width}%`
          //     //   );
          //     // }
          //   }, 500);
        }
      };
      reader.readAsArrayBuffer(file);

      // try {
      //     if (
      //         fileType.includes("xls") !== true &&
      //         fileType.includes("xlsx") !== true
      //     ) {
      //         alert("Only .xlsx and .xls format allowed");
      //         document.getElementById("upload-2").value = "";
      //         return false;
      //     } else {
      //         if (fileSize > 1500000) {
      //             alert("Please upload file with size less than 1.5 MB");
      //             window.location.reload();
      //             return false;
      //         } else {
      //             reader.onload = (event) => {
      //                 const wb = read(event.target.result);
      //                 const sheets = wb.SheetNames;
      //                 const rows = utils.sheet_to_json(wb.Sheets[sheets[0]]);

      //                 const keys1 = Object.keys(file_format)
      //                     .map((v) => v.toLocaleLowerCase())
      //                     .sort();
      //                 const keys2 = Object.keys(rows[0])
      //                     .map((v) => v.toLocaleLowerCase())
      //                     .sort();
      //                 if (
      //                     sheets.length &&
      //                     JSON.stringify(keys1) !== JSON.stringify(keys2)
      //                 ) {
      //                     document.getElementById("upload-2").value = "";
      //                     alert("Please upload file with same format");
      //                 } else if (sheets.length) {
      //                     //   const rows = utils.sheet_to_json(wb.Sheets[sheets[0]]);
      //                     //   setImportData(rows);
      //                     //   setUploadFlag(true);
      //                     //   progress = setInterval(() => {
      //                     //     width = width + 10;
      //                     //     // if (progressBar.current) {
      //                     //     //   progressBar.current.children[0].style.setProperty(
      //                     //     //     "width",
      //                     //     //     `${width}%`
      //                     //     //   );
      //                     //     // }
      //                     //   }, 500);
      //                 }
      //             };
      //             reader.readAsArrayBuffer(file);
      //         }
      //     }
      // } catch (err) {
      //     console.log(err);
      // }
    }
  } catch (error) {}
};
const puppeteer = require("puppeteer");
const { data } = require("../../models/Prabandh/PrabandhModel");
const { update } = require("../../models/Volunteer/VolunteerModel");
routers.post("/generate", async () => {
  // Create a browser instance
  const browser = await puppeteer.launch();

  // Create a new page
  const page = await browser.newPage();

  // Website URL to export as pdf
  const website_url =
    "https://www.bannerbear.com/blog/how-to-download-images-from-a-website-using-puppeteer/";

  // Open URL in current page
  await page.goto(website_url, { waitUntil: "networkidle0" });

  //To reflect CSS used for screens instead of print
  await page.emulateMediaType("screen");

  // Downlaod the PDF
  const pdf = await page.pdf({
    path: "result.pdf",
    margin: { top: "100px", right: "50px", bottom: "100px", left: "50px" },
    printBackground: true,
    format: "A4",
  });

  // Close the browser instance
  await browser.close();
});
async function GeneratePdf() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Navigate to the desired webpage
  await page.goto("https://google.com");

  // Generate PDF from the webpage
  const pdfBuffer = await page.pdf();

  // Save the PDF to a file
  const fs = require("fs");
  fs.writeFileSync("TutorialsPoint JavaScript.pdf", pdfBuffer);

  // Set response headers for PDF download
  // res.setHeader('Content-Type', 'application/pdf');
  // res.setHeader('Content-Disposition', 'attachment; filename=downloaded.pdf');

  // Close the browser
  await browser.close();
}
routers.post("/upload", async (req, res) => {
  const browser = await puppeteer.launch({
    headless: false,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  const pageUrl =
    await `http://localhost:4000/public/assets/files/${req.body.file}`;
  try {
    await page.goto(pageUrl);
    await page.pdf({
      path: `pdf-${1}.pdf`,
      format: "A4",
      printBackground: true,
    });
  } catch (e) {
    console.log(`Error loading ${pageUrl}`);
  }
  // }
  // await browser.close();
});
routers.post("/getpublicfiles", async (req, res) => {
  return await Handler.getPublicUploads(req, res);
});

module.exports = routers;
