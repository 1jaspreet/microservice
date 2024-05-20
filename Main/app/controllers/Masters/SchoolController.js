const express = require("express");
const routers = express.Router();
const Helper = require("../../helpers/Helper");
const Handler = require("../../handlers").School;
const Validate = require("../../validation").School;

routers.post("/", (req, res) => {
  return Handler.index(req, res);
});
routers.post("/schoolmaster", (req, res) => {
  return Handler.masterSchool(req, res);
});
routers.post("/find", (req, res) => {
  return Handler.find(req, res);
});

routers.post("/prabandh-school-find", (req, res) => {
  return Handler.prabandhSchoolFind(req, res);
});

routers.get("/list", (req, res) => {
  return Handler.list(req, res);
});

routers.post("/filter", (req, res) => {
  return Handler.filteredSchools(req, res);
});

routers.post("/paged", (req, res) => {
  return Handler.pagedSchools(req, res);
});

routers.post("/update", (req, res) => {
  return Handler.updateAll(req, res);
});
routers.post("/getreportdt", (req, res) => {
  return Handler.reportData(req, res);
  // return Handler.newReportData(req, res);
});

routers.post("/getannualreportdt", (req, res) => {
  // return Handler.reportData(req, res);
  return Handler.newReportData(req, res);
});
routers.post("/bdgt_selected_schools", (req, res) => {
  return Handler.bdgtSelectedSchools(req, res);
});

routers.post("/school-detail", (req, res) => {
  return Handler.schoolDetail(req, res);
});

routers.post("/activity-list", (req, res) => {
  return Handler.activityList(req, res);
})

/* routers.post('/list',(req,res)=>{
    return Handler.filteredSchools(req,res);
}); */

// routers.post('/update',Validate.update(),(req,res) => {
//     const error = Helper.validate(req,res);
//     return (error != null) ? error : Handler.update(req,res);
// });

// routers.post('/update-status',Validate.status(),(req,res) => {
//     const error = Helper.validate(req,res);
//     return (error != null) ? error : Handler.updateStatus(req,res);
// });

module.exports = routers;
