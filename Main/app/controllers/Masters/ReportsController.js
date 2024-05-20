const express = require("express");
const routers = express.Router();
const Handler = require("../../handlers").ReportsMasterHandler;

routers.post("/list", (req, res) => {
  return Handler.list(req, res);
});

// routers.post("/state-costing-sheet-report", async (req, res) => {
//   return await Handler.stateCostingSheetReport(req, res);
// });

// routers.post("/getannualreportdt", (req, res) => {
//   return Handler.newReportData(req, res);
// });

// routers.post("/state-costing-proposed-sheet-report", async (req, res) => {
//   return await Handler.stateCostingProposedSheetReport(req, res);
// });

// routers.post("/get-saved-data-spill", async (req, res) => {
//   return await Handler.getSavedDataSpill(req, res);
// });

// routers.post("/get-expenditure-report", async (req, res) => {
//   return await Handler.getExpenditureReport(req, res);
// });

// routers.post("/get-ppt-data", async (req, res) => {
//   return await Handler.getPptData(req, res);
// });

// routers.post("/get-spillover-second-data", async (req, res) => {
//   return await Handler.getSpilloversecond(req, res);
// });
// routers.post("/get-annexure-report-data", async (req, res) => {
//   return await Handler.getAnnexureReport(req, res);
// });

module.exports = routers;
