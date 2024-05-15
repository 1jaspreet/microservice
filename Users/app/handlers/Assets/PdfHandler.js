const Exception = require("./ExceptionHandler");
const Response = require("./ResponseHandler");
const puppeteer = require("puppeteer");
const ejs = require("ejs");
const path = require("path");
const dateTime = require("node-datetime");
const fs = require("fs-extra");
const Helper = require("../../helpers/Common");
const { env } = require("process");

// const filePath = require('../../../public/assets/files')

const compile = async (request) => {
  const filePath = path.join(
    process.cwd(),
    "resourses/views/pdf/",
    request.template + ".ejs"
  );
  const html = await fs.readFile(filePath, "utf8");
  const template = ejs.compile(html);
  return template({ data: request });
};

exports.handle = async (req, res) => {
  try {
    const file = path.join(process.cwd(), "public/assets/images/emblem1.png");
    const request = req.data;
    if (request.list != null && request.list.length > 0) {
      const datetime = dateTime.create().format("Y-m-d H:M:S p");
      const HTemplate = `<span style="width:100%;height:300px; border-bottom:1px #efefef solid;color:black;margin-top:0px;padding-bottom:10px">
                                    <img src="data:image/png;base64,${Helper.base64Encode(
        file
      )}" style="height:35px;text-align:left;display:inline;margin-left:20px" />
                                    <div style="float:right;display:inline;margin-right:20px">
                                        <strong style="font-size:30px;color:#042a61">PRABANDH</strong><strong style="font-size:30px;color:#159ec1"></strong>
                                    </div>
                                </span>`;
      const FTemplate = `<span style="font-size:10px;width:100%;border-top:1px #efefef solid;color:black;padding:10px 20px 0px 20px;bottom:0px;margin-bottom:0px">
                                    <span style="float:left">Creation Date & Time ${datetime}</span>
                                    <span style="float:right;">
                                        Page: <span class='pageNumber'></span>/<span class='totalPages'></span>
                                    </span>
                                </span>`;

      const filename =
        dateTime.create().format("Y-m-d-H-M-S") + "-" + request.fname + ".pdf";
      const filePath = req.ENV.DOWNLOAD_PATH + filename;
      const browser = await puppeteer.launch({
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
      const content = await compile(request);
      const page = await browser.newPage();
      await page.setContent(content, { waitUntil: "networkidle0" });
      const pdf = await page.pdf({
        // width: "950",
        // height: "1500",
        printBackground: false,
        headerTemplate: HTemplate,
        footerTemplate: FTemplate,
        displayHeaderFooter: true,
        path: filePath,
        margin: { top: "90px", bottom: "70px", left: "30px", right: "30px" },
        padding: "60px",
        timeout: 0,
      });
      await browser.close();
      // res.append('Warning', '201 Warning');
      res.download(filePath, (err) => {
        if (err) {
          // res
          //   .status(404)
          //   .json({ status: false, message: "Unable to download file" });

          return Response.handle(req, res, "handle", 404, {
            status: false,
            message: "Unable to download file",
          });
        }
        fs.unlinkSync(filePath);
      });
      // res.contentType("application/pdf");
      // res.send(pdf);
    } else {
      //  res.status(404).json({ status: false, message: "No record found." });
      return Response.handle(req, res, "handle", 404, {
        status: false,
        message: "No record found.",
      });
    }
  } catch (e) {
    return Exception.handle(e, res, req, "handle");
  }
};

exports.handleReport = async (req, res) => {
  try {
    const file = path.join(process.cwd(), "public/assets/images/emblem.png");
    const request = req.data;
    const apiYear = req?.headers?.api_year || '';
    if (request.list != null && request.list.length > 0) {
      const datetime = dateTime.create().format("Y-m-d H:M:S p");
      const HTemplate = `<div style="width:100%;height:300px; border-bottom:1px #efefef solid;color:black;margin-top:0px;padding-bottom:50px;">
                                    <img src="data:image/png;base64,${Helper.base64Encode(
        file
      )}" style="height:35px;text-align:left;display:inline;margin-left:20px;margin-bottom:5px" />
                                    <div style="float:right;display:inline;margin-right:20px">
                                        <strong style="font-size:30px;color:#042a61">PRABANDH</strong><strong style="font-size:30px;color:#159ec1"></strong>
                                    </div>
                                    <br />
                                    <hr/>
                                    <br />
                                    <div style="text-align:center;display:inline;margin:auto">
                                    <div style="font-size:18px;color:#000000; margin:auto;text-transform: capitalize;">
                                     ${req?.body?.report_type}
                                          ${req.body.state_name !== undefined
          ? `<label style="font-size:14px;color:#000000;text-transform: capitalize;">(
                                            ${req.body.state_name !== null
            ? req.body.state_name
            : "All State"
          } ${req?.body?.district_name !==
          undefined &&
          ` ${req?.body?.district_name !==
            null
            ? req?.body?.district_name === "blank" ? `${apiYear}` : `& ${req?.body?.district_name} ${apiYear}`
            : `& All District  ${apiYear}`
          } )`
          } </label >`
          : ""
        }
                                    </div>
                                </div>
                                </div>
                                <br />`;
      const FTemplate = `<span style="font-size:10px;width:100%;border-top:1px #efefef solid;color:black;padding:10px 20px 0px 20px;bottom:0px;margin-bottom:0px;text-align:center;">
                                    <span style="font-size:8px;line-height:10px;">
                                          This site is designed, developed, maintained and hosted by National Informatics Centre (NIC) <br />
                                          &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
                                           Ministry of Electronics & Information Technology. Government of India.(${datetime})
                                    </span>
                                    <span style="float:right;">
                                        Page: <span class='pageNumber'></span>/<span class='totalPages'></span>
                                    </span>
                                </span>`;

      const filename =
        dateTime.create().format("Y-m-d-H-M-S") + "-" + request.fname + ".pdf";
      const filePath = req.ENV.DOWNLOAD_PATH + filename;
      const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
      const content = await compile(request);
      const page = await browser.newPage();
      await page.setContent(content, { waitUntil: "networkidle0" });
      const pdf = await page.pdf({
        width: "950",
        printBackground: false,
        headerTemplate: HTemplate,
        footerTemplate: FTemplate,
        displayHeaderFooter: true,
        path: filePath,
        margin: {
          top: "110px",
          bottom: "70px",
          left: "30px",
          right: "30px",
        },
        // margin: { top: "90px", bottom: "70px", left: "30px", right: "30px" },
        padding: "60px",
        timeout: 0,
      });
      await browser.close();
      // res.append('Warning', '201 Warning');
      res.download(filePath, (err) => {
        if (err) {
          // res
          //   .status(404)
          //   .json({ status: false, message: "Unable to download file" });

          return Response.handle(req, res, "handleReport", 404, {
            status: false,
            message: "Unable to download file",
          });
        }
        fs.unlinkSync(filePath);
      });
      // res.contentType("application/pdf");
      // res.send(pdf);
    } else {
      //  res.status(404).json({ status: false, message: "No record found." });
      return Response.handle(req, res, "handleReport", 404, {
        status: false,
        message: "No record found.",
      });
    }
  } catch (e) {
    return Exception.handle(e, res, req, "handleReport");
  }
};

exports.handlePdfReport = async (req, res) => {
  let { filter, name, heading, thead } = req.body;
  try {
    let request = {
      template: "report",
      thead,
    };
    if (name === "spillover") {
      const Handler = require("../../handlers").Prabandh;
      let data = await Handler.getSavedDataSpillFun(filter);
      request.list = data;
      request.totalRow = 1
      request.numberIndexs = [
        6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
      ];
      request.dataColumns = [
        "index",
        "scheme_name",
        "major_component_name",
        "sub_component_name",
        "activity_master_name",
        "activity_master_details_name",
        "fresh_approval_physical_quantity",
        "fresh_approval_financial_amount",
        "exp_against_fresh_app_phy_ip",
        "exp_against_fresh_app_phy_ns",
        "exp_against_fresh_app_phy_c",
        "exp_total",
        "exp_against_fresh_app_fin",
        "physical_quantity_cummu_inception",
        "financial_amount_cummu_inception",
        "physical_quantity_progress_progress_inception",
        "physical_quantity_progress_notstart_inception",
        "physical_quantity_progress_complete_inception",
        "fresh_total",
        "financial_amount_progress_inception",
        "spillover_quantity",
        "spillover_amount"
      ];
    } else if (name === "expenditure") {
      const Handler = require("../../handlers").Prabandh;
      let data = await Handler.getSavedDataExpendFun(filter);
      request.list = data;
      request.totalRow = 0
      request.numberIndexs = [6, 7, 8, 9];
      request.dataColumns = [
        "index",
        "scheme_name",
        "major_component_name",
        "sub_component_name",
        "activity_master_name",
        "activity_master_details_name",
        "budget_quantity",
        "budget_amount",
        "progress_quantity",
        "progress_amount",
      ];
    } else if (name === "expenditure_report") {
      const Handler = require("../../handlers").Prabandh;
      let data = await Handler.getExpenditureReportpdf(filter);
      request.list = data;
      request.totalRow = 0
      request.numberIndexs = [6, 7, 8, 9];
      request.dataColumns = [
        "index",
        "scheme_name",
        "major_component_name",
        "sub_component_name",
        "activity_master_name",
        "activity_master_details_name",
        "budget_quantity",
        "budget_amount",
        "progress_quantity",
        "progress_amount",
      ];
    }
    if (request.list != null && request.list.length > 0) {
      const file = path.join(process.cwd(), "public/assets/images/emblem1.png");
      const datetime = dateTime.create().format("Y-m-d H:M:S p");
      const HTemplate = `<div style="width:100%;height:300px; border-bottom:1px #efefef solid;color:black;margin-top:0px;padding-bottom:50px">
                                    <img src="data:image/png;base64,${Helper.base64Encode(
        file
      )}" style="height:35px;text-align:left;display:inline;margin-left:20px" />
                                    <div style="float:right;display:inline;margin-right:20px">
                                        <strong style="font-size:30px;color:#042a61">PRABANDH</strong><strong style="font-size:30px;color:#159ec1"></strong>
                                    </div>
                                    <br />
                                    <hr/>
                                    <br />
                                    <div style="text-align:center;display:inline;margin:auto">
                                    <div style="font-size:18px;color:#000000; margin:auto">
                                     ${heading}
                                    </div>
                                </div>
                                </div>
                                <br />`;
      const FTemplate = `<span style="font-size:10px;width:100%;border-top:1px #efefef solid;color:black;padding:10px 20px 0px 20px;bottom:0px;margin-bottom:0px">
                                    <span style="float:left">Creation Date & Time ${datetime}</span>
                                    <span style="float:right;">
                                        Page: <span class='pageNumber'></span>/<span class='totalPages'></span>
                                    </span>
                                </span>`;

      const filename =
        dateTime.create().format("Y-m-d-H-M-S") + "-" + name + ".pdf";
      const filePath = req.ENV.DOWNLOAD_PATH + filename;
      const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
      const content = await compile(request);
      const page = await browser.newPage();
      await page.setContent(content, { waitUntil: "networkidle0" });
      await page.pdf({
        width: "950",
        printBackground: false,
        headerTemplate: HTemplate,
        footerTemplate: FTemplate,
        displayHeaderFooter: true,
        path: filePath,
        margin: {
          top: "110px",
          bottom: "70px",
          left: "30px",
          right: "30px",
        },
        padding: "60px",
        timeout: 0,
      });
      await browser.close();
      res.download(filePath, (err) => {
        if (err) {
          //  res.status(404).json({ status: false, message: "Unable to download file" });
          return Response.handle(req, res, "handlePdfReport", 404, {
            status: false,
            message: "Unable to download file",
          });
        }
        fs.unlinkSync(filePath);
      });
    } else {
      //  res.status(404).json({ status: false, message: "No record found." });
      return Response.handle(req, res, "handlePdfReport", 404, {
        status: false,
        message: "No record found.",
      });
    }
  } catch (e) {
    return Exception.handle(e, res, req, "handlePdfReport");
  }
};

exports.certificate = async (req, res) => {
  try {
    const request = req.data;
    request.ALogo = Helper.base64Encode(
      path.join(
        process.cwd(),
        "public/assets/images/Azadi-Ka-Amrit-Mahotsav-Logo.png"
      )
    );
    request.MLogo = Helper.base64Encode(
      path.join(process.cwd(), "public/assets/images/ministry-logo.png")
    );
    request.VLogo = Helper.base64Encode(
      path.join(process.cwd(), "public/assets/images/vidyanjali-logo.png")
    );
    request.Crtf = Helper.base64Encode(
      path.join(process.cwd(), "public/assets/images/certificate-text.png")
    );
    request.Bleft = Helper.base64Encode(
      path.join(process.cwd(), "public/assets/images/design-element-lt.png")
    );
    request.Bright = Helper.base64Encode(
      path.join(process.cwd(), "public/assets/images/design-element-rt.png")
    );

    const filename =
      dateTime.create().format("Y-m-d-H-M-S") + "-" + request.fname + ".pdf";
    const filePath = req.ENV.DOWNLOAD_PATH + filename;
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const content = await compile(request);
    const page = await browser.newPage();

    await page.setContent(content, { waitUntil: "networkidle0" });
    const pdf = await page.pdf({
      path: filePath,
      landscape: true,
      margin: { top: "55px", bottom: "30px", left: "30px", right: "30px" },
    });

    await browser.close();
    res.download(filePath, (err) => {
      if (err) {
        // res
        //   .status(404)
        //   .json({ status: false, message: "Unable to download file" });
        return Response.haxndle(req, res, "certificate", 404, {
          status: false,
          message: "Unable to download file",
        });
      }
      fs.unlinkSync(filePath);
    });
  } catch (e) {
    return Exception.handle(e, res, req, "certificate");
  }
};

exports.pdfFromUrl = async (req, res) => {
  try {
    const filename =
      req.ENV.DOWNLOAD_PATH + (Date.now() + "-" + req.fname + ".pdf");
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto("https://google.com", { waitUntil: "networkidle0" });
    const pdf = await page.pdf({ format: "A4", path: filename });
    await browser.close();
    res.contentType("application/pdf");
    res.send(pdf);
  } catch (e) {
    return Exception.handle(e, res, req, "pdfFromUrl");
  }
};

exports.handleModifyReport = async (req, res) => {
  try {
    const file = path.join(process.cwd(), "public/assets/images/emblem1.png");
    const request = req.data;
    if (request.list != null && request.list.length > 0) {
      const datetime = dateTime.create().format("Y-m-d H:M:S p");
      const HTemplate = `<div style="width:100%;height:300px; border-bottom:1px #efefef solid;color:black;margin-top:0px;padding-bottom:50px">
                                    <img src="data:image/png;base64,${Helper.base64Encode(
        file
      )}" style="height:35px;text-align:left;display:inline;margin-left:20px" />
                                    <div style="float:right;display:inline;margin-right:20px">
                                        <strong style="font-size:30px;color:#042a61">PRABANDH</strong><strong style="font-size:30px;color:#159ec1"></strong>
                                    </div>
                                    <br />
                                    <hr/>
                                    <br />
                                    <div style="text-align:center;display:inline;margin:auto">
                                    <div style="font-size:18px;color:#000000; margin:auto">
                                     ${req?.body?.report_type}
                                     ${req.body.state_name !== undefined
          ? `<label style="font-size:14px;color:#000000">
          ${req.body.state_name !== undefined && `( ${req.body.state_name}`} ${req.body.district_name !==
          undefined &&
          `& ${req.body.district_name} )`
          } </label >`
          : ""
        }
                                    </span>
                                    </div>
                                </div>
                                
                               
                                </div>
                            `;
      const FTemplate = `<span style="font-size:10px;width:100%;border-top:1px #efefef solid;color:black;padding:10px 20px 0px 20px;bottom:0px;margin-bottom:0px;text-align:center;">
                                    <span style="font-size:8px;line-height:10px;">
                                          This site is designed, developed, maintained and hosted by National Informatics Centre (NIC) <br />
                                          &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
                                           Ministry of Electronics & Information Technology. Government of India.(${datetime})
                                    </span>
                                    <span style="float:right;">
                                        Page: <span class='pageNumber'></span>/<span class='totalPages'></span>
                                    </span>
                                </span>`;

      const filename =
        dateTime.create().format("Y-m-d-H-M-S") + "-" + request.fname + ".pdf";
      const filePath = req.ENV.DOWNLOAD_PATH + filename;
      const browser = await puppeteer.launch({
        headless: "new",
        userDataDir: "./tmp",
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-features=IsolateOrigins",
          "--disable-site-isolation-trials",
          "--autoplay-policy=user-gesture-required",
          "--disable-background-networking",
          "--disable-background-timer-throttling",
          "--disable-backgrounding-occluded-windows",
          "--disable-breakpad",
          "--disable-client-side-phishing-detection",
          "--disable-component-update",
          "--disable-default-apps",
          "--disable-dev-shm-usage",
          "--disable-domain-reliability",
          "--disable-extensions",
          "--disable-features=AudioServiceOutOfProcess",
          "--disable-hang-monitor",
          "--disable-ipc-flooding-protection",
          "--disable-notifications",
          "--disable-offer-store-unmasked-wallet-cards",
          "--disable-popup-blocking",
          "--disable-print-preview",
          "--disable-prompt-on-repost",
          "--disable-renderer-backgrounding",
          "--disable-speech-api",
          "--disable-sync",
          "--hide-scrollbars",
          "--ignore-gpu-blacklist",
          "--metrics-recording-only",
          "--mute-audio",
          "--no-default-browser-check",
          "--no-first-run",
          "--no-pings",
          "--no-zygote",
          "--password-store=basic",
          "--use-gl=swiftshader",
          "--use-mock-keychain",
        ],
      });
      const content = await compile(request);
      const page = await browser.newPage();
      await page.setContent(content, { waitUntil: "networkidle0" });
      await page.addStyleTag({
        content: `
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th, td {
            border: 1px solid red;
            text-align: left;
            padding: 16px;
          }
          th {
            background-color: #f2f2f2;
          }
        `,
      });
      const pdf = await page.pdf({
        width: "950",
        printBackground: false,
        headerTemplate: HTemplate,
        footerTemplate: FTemplate,
        displayHeaderFooter: true,
        path: filePath,
        margin: {
          top: "110px",
          bottom: "70px",
          left: "30px",
          right: "30px",
        },
        format: "A4",
        // margin: { top: "90px", bottom: "70px", left: "30px", right: "30px" },
        padding: "60px",
        timeout: 0,
      });
      await browser.close();
      // res.append('Warning', '201 Warning');
      res.download(filePath, (err) => {
        if (err) {
          res
            .status(404)
            .json({ status: false, message: "Unable to download file" });
        }
        fs.unlinkSync(filePath);
      });
      // res.contentType("application/pdf");
      // res.send(pdf);
    } else {
      res.status(404).json({ status: false, message: "No record found." });
    }
  } catch (e) {
    return Exception.handle(e, res);
  }
};

exports.downloadMajorComponentDistrictReportPDF = async (req, res) => {
  let { state_id, thead, report_name } = req.body;
  try {
    let request = {
      template: "districtreport",
      thead,
    };

    const Handler = require("../../handlers").Prabandh;
    let data = await Handler.getDynamicDistrictDataFn(req, state_id);
    request.list = data.rows;
    request.numberIndexs = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50];

    request.dataColumns = Object.keys(data?.rows[0]);

    request.dataColumns.unshift("id")

    if (request.list != null && request.list.length > 0) {
      const file = path.join(process.cwd(), "public/assets/images/emblem1.png");
      const datetime = dateTime.create().format("Y-m-d H:M:S p");

      const HTemplate = `<div style="width:100%;height:300px; border-bottom:1px #efefef solid;color:black;margin-top:0px;padding-bottom:50px">
                                    <img src="data:image/png;base64,${Helper.base64Encode(
        file
      )}" style="height:35px;text-align:left;display:inline;margin-left:20px" />
                                    <div style="float:right;display:inline;margin-right:20px">
                                        <strong style="font-size:30px;color:#042a61">PRABANDH</strong><strong style="font-size:30px;color:#159ec1"></strong>
                                    </div>
                                    <br />
                                    <hr/>
                                    <br />
                                    <div style="text-align:center;display:inline;margin:auto">
                                    <div style="font-size:18px;color:#000000; margin:auto">
                                     Major Component District Matrix
                                    </div>
                                </div>
                                </div>
                                <br />`;
      const FTemplate = `<span style="font-size:10px;width:100%;border-top:1px #efefef solid;color:black;padding:10px 20px 0px 20px;bottom:0px;margin-bottom:0px">
                                    <span style="float:left">Creation Date & Time ${datetime}</span>
                                    <span style="float:right;">
                                        Page: <span class='pageNumber'></span>/<span class='totalPages'></span>
                                    </span>
                                </span>`;

      const filename = dateTime.create().format("Y-m-d-H-M-S") + "-" + report_name + ".pdf";
      const filePath = req.ENV.DOWNLOAD_PATH + filename;
      const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });

      const content = await compile(request);
      const page = await browser.newPage();
      await page.setContent(content, { waitUntil: "networkidle0" });
      await page.pdf({
        width: "950",
        printBackground: false,
        headerTemplate: HTemplate,
        footerTemplate: FTemplate,
        displayHeaderFooter: true,
        path: filePath,
        margin: {
          top: "110px",
          bottom: "70px",
          left: "30px",
          right: "30px",
        },
        padding: "60px",
        timeout: 0,
      });

      await browser.close();
      res.download(filePath, (err) => {
        if (err) {
          return Response.handle(req, res, "downloadMajorComponentDistrictReportPDF", 404, {
            status: false,
            message: "Unable to download file",
          });
        }
        fs.unlinkSync(filePath);
      });
    } else {
      return Response.handle(req, res, "downloadMajorComponentDistrictReportPDF", 404, {
        status: false,
        message: "No record found.",
      });
    }
  } catch (e) {
    return Exception.handle(e, res, req, "downloadMajorComponentDistrictReportPDF");
  }
};
