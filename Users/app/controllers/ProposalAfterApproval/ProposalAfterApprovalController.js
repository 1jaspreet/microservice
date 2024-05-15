const express = require("express");
const routers = express.Router();
const Handler = require("../../handlers").ProposalAfterApprovalHandler;

routers.get("/state-list", async (req, res) => {
  return await Handler.stateList(req, res);
});

routers.post("/major-components", async (req, res) => {
  return await Handler.majorComponents(req, res);
});

routers.post("/sub-components", async (req, res) => {
  return await Handler.subComponents(req, res);
});

routers.post("/active-master-list", async (req, res) => {
  return await Handler.activemasterlist(req, res);
});

routers.post("/view-edit-form-activity_activity-master-details", async (req, res) => {
  return await Handler.viewEditFormActivity_activemasterdetaillist(req, res);
});

routers.post("/get-saved-data-activity-by-dist", async (req, res) => {
  return await Handler.getSavedApprovedDataActivityByDist(req, res);
});

routers.post("/update", async (req, res) => {
  return await Handler.updateApprovedPlan(req, res);
});

routers.post("/activity-major-components", async (req, res) => {
  return await Handler.activityMajorComponents(req, res);
});

routers.post("/activity-sub-components", async (req, res) => {
  return await Handler.activitySubComponents(req, res);
});

routers.post("/allo-active-master-list", async (req, res) => {
  return await Handler.alloActivemasterlist(req, res);
});

routers.post("/activity-master-detail-list", async (req, res) => {
  return await Handler.activityMasterDetailList(req, res);
});

routers.post("/school-list", async (req, res) => {
  return await Handler.schoolList(req, res);
});

routers.post("/school-list-of-block", async (req, res) => {
  return await Handler.schoolListOfBlock(req, res);
});

routers.post("/school-activity", async (req, res) => {
  return await Handler.schoolActivity(req, res);
});

routers.post("/diet-config-activity", async (req, res) => {
  return await Handler.dietConfigctivity(req, res);
});

routers.post("/update-config-diet-plan-progress", async (req, res) => {
  return await Handler.updateConfigDietPlanProgress(req, res);
});

routers.post("/diet-activity-master-details-list", async (req, res) => {   
  return await Handler.dietActivityMasterDetailsList(req, res);
});


routers.post("/activity-school", async (req, res) => {
  return await Handler.activitySchool(req, res);
});

routers.post("/save-activity", async (req, res) => {
  return await Handler.saveActivity(req, res);
});

module.exports = routers;
