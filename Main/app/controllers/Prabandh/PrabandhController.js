const express = require("express");
const routers = express.Router();
const Model = require("../../models").cmsModele;
// const PRABANDH = require("../../handlers").Prabandh;
const Helper = require("../../helpers/Helper");
// const { default: knex } = require("knex");
const Handler = require("../../handlers").Prabandh;
const Validate = require("../../validation").Prabandh;
const StateuploaddocHandler = require("../../handlers").StateuploaddocHandler;

/* file upload */
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

routers.post("/schemes", async (req, res) => {
  return await Handler.schemes(req, res);
});

routers.post("/major-components", async (req, res) => {
  return await Handler.majorComponents(req, res);
});

routers.post("/sub-components-list", async (req, res) => {
  return await Handler.subcomponentslist(req, res);
});
routers.post("/active-master-list", async (req, res) => {
  return await Handler.activemasterlist(req, res);
});
routers.post("/active-master-detail-list", async (req, res) => {
  return await Handler.activemasterdetaillist(req, res);
});

routers.post("/majorComp-subComp-activity-list", async (req, res) => {
  return await Handler.majorCompSubCompActivityList(req, res);
});

routers.post(
  "/view-edit-form-activity_activity-master-details",
  async (req, res) => {
    return await Handler.viewEditFormActivity_activemasterdetaillist(req, res);
  }
);

routers.post("/expenditure_activity-master-list", async (req, res) => {
  return await Handler.expenditureActivityMasterList(req, res);
});

routers.post("/expenditure_activity-master-list-details", async (req, res) => {
  return await Handler.expenditureActivityMasterListDetails(req, res);
});

routers.post("/sub-components", async (req, res) => {
  return await Handler.subComponents(req, res);
});

routers.post("/majorComp-subComp-activity-list", async (req, res) => {
  return await Handler.majorCompSubCompActivityList(req, res);
});

/* routers.post("/prabandhdata", async (req, res) => {
  return await Handler.prabandhData(req, res);
}); */

routers.post("/summary", async (req, res) => {
  return await Handler.summaryData(req, res);
});

routers.post("/activity-master", async (req, res) => {
  return await Handler.amComponents(req, res);
});

routers.post("/activity-master-details", async (req, res) => {
  return await Handler.amdComponents(req, res);
});

routers.post("/set-plan", async (req, res) => {
  return await Handler.setPlanConfigurator(req, res);
});

routers.post("/fetch-state-saved-plan-activity-list", async (req, res) => {
  return await Handler.getSavedPlanState(req, res);
});

routers.post("/fetch-district-saved-plan-activity-list", async (req, res) => {
  return await Handler.getSavedPlanDistrict(req, res);
});

routers.post("/spillover", async (req, res) => {
  return await Handler.getSpillOverData(req, res);
});

routers.post("/savedata", async (req, res) => {
  return await Handler.savePrabandhData(req, res);
});

routers.post("/saveform", async (req, res) => {
  return await Handler.savePrabandhForm(req, res);
});

routers.post("/saveform-spill", async (req, res) => {
  return await Handler.savePrabandhFormSpill(req, res);
});

routers.post("/spill-reset", async (req, res) => {
  return await Handler.spilloverReset(req, res);
});

// expendeture start
routers.post("/get-saved-data-expend", async (req, res) => {
  return await Handler.getSavedDataExpend(req, res);
});

routers.post("/expenditures", async (req, res) => {
  return await Handler.getExpenditures(req, res);
});

routers.post("/get-expenditure-report", async (req, res) => {
  return await Handler.getExpenditureReport(req, res);
});

routers.delete("/expend", async (req, res) => {
  return await Handler.deletePrabandhFormExpend(req, res);
});

routers.post("/saveform-expend", async (req, res) => {
  return await Handler.savePrabandhFormExpend(req, res);
});

routers.post("/expend-reset", async (req, res) => {
  return await Handler.expendoverReset(req, res);
});
// expendeture endprabandh-school-find

routers.post("/generate-csv", async (req, res) => {
  return await Handler.generateCSV(req, res);
});

routers.post("/autofill", async (req, res) => {
  return await Handler.autoFillData(req, res);
});

routers.post("/report", async (req, res) => {
  return await Handler.reportData(req, res);
});

routers.post("/view-edit-form-state_edit-by-district", async (req, res) => {
  return await Handler.viewEditFormState_editByDistrict(req, res);
  //getSavedData
});

routers.post("/get-saved-data-activity-by-dist", async (req, res) => {
  return await Handler.getSavedDataActivityByDist(req, res);
});

routers.post("/get-national-saved-data", async (req, res) => {
  return await Handler.getNationalSavedData(req, res);
});

routers.post("/get-saved-data-spill", async (req, res) => {
  return await Handler.getSavedDataSpill(req, res);
});

routers.post("/get-apr-btn-status", async (req, res) => {
  return await Handler.getApproveBtnStatus(req, res);
});

routers.post("/modifydata", async (req, res) => {
  return await Handler.modifyData(req, res);
});

routers.post("/save-school-configuration", async (req, res) => {
  return await Handler.saveSchoolConfiguration(req, res);
});

routers.post("/get-school-configuration", async (req, res) => {
  return await Handler.getSchoolConfiguration(req, res);
});

routers.all("/major-component-list", async (req, res) => {
  return await Handler.majorComponentList(req, res);
});

routers.get("/sub-component-list", async (req, res) => {
  return await Handler.subComponentList(req, res);
});

routers.post("/upload", upload.single("file"), async (req, res) => {
  return await Handler.uploadFile(req, res);
});

routers.post(
  "/get-upload-state-document",
  upload.single("file"),
  async (req, res) => {
    return await Handler.uploadFile(req, res);
  }
);

routers.post("/component-saidbar", async (req, res) => {
  return await Handler.componentsaidbar(req, res);
});
//routers.post("/amdbdgt", async (req, res) => {
//   console.log("gjhbhbb");
//   try {
//     const title= "abcd"
// const   description= "cmnfjvcpklfecl;fekmcl;femvl;ejkfivcjeklfmk"
//  const  img_icon="https://demo.png"
//  const created_by=1
//  const update_by =1
//   // const { title, description,img_icon,created_by,update_by } = req.body;
//   const userId = await ('cms_category').insert({ title, description,img_icon,created_by,update_by }, 'id');
//   console.log(userId);
//   if(userId){
//   return  res.send(userId)
//   }else{
//    return res.send("nfklvnklfjvgklvkgj")
//   }
// } catch (error) {
//   console.log(error);
// }

//   //return await Handler.amdBdgt(req, res);
// });

routers.post("/amdbdgt", async (req, res) => {
  return await Handler.amdBdgt(req, res);
});

/* routers.post("/amdbdgt", async (req, res) => {
  console.log("bgjkfbhgjkbhgklj");
  try {
    const request = req.body;
    // const userData    =   await Model.findExistingUser(request);
    let message;
    const title = "abcd";
    const description = "cmnfjvcpklfecl;fekmcl;femvl;ejkfivcjeklfmk";
    const img_icon = "https://demo.png";
    const created_by = 1;
    const update_by = 1;
    if (description) {
      const result = await Model.create({
        title: title,
        description: description,
        img_icon: img_icon,
        created_by: created_by,
        update_by: update_by,
      });

      if (result) {
        res.status(200).json({ status: true, message: message });
      } else {
        res
          .status(200)
          .json({ status: false, message: message, a: "vbklfmbklfmnbk" });
      }
    }
  } catch (e) {
    // return Exception.handle(e,res,req,'');
    console.log(e);
  }
}); */

routers.post("/activities-for-school-selection", async (req, res) => {
  return await Handler.activitiesForSchoolSelection(req, res);
});

routers.post("/school-activity", async (req, res) => {
  return await Handler.updateSchoolActivities(req, res);
});

// temp api
routers.post("/tempconfig", async (req, res) => {
  return await Handler.tempConfig(req, res);
});

routers.post("/submit-plan", async (req, res) => {
  return await Handler.submitPlan(req, res);
});

routers.post("/save-plan-status-details", async (req, res) => {
  return await Handler.saveApprovedPlanDetails(req, res);
});

routers.post("/get-state-plan-status", async (req, res) => {
  return await Handler.getStatePlanStatusReport(req, res);
});

routers.post("/years", async (req, res) => {
  return await Handler.getAllyears(req, res);
});

routers.post("/modifynationaldata", async (req, res) => {
  return await Handler.modifyNationalData(req, res);
});

routers.get("/years", async (req, res) => {
  return await Handler.getAllyears(req, res);
});

routers.post("/clean-prabandh-plan-data", async (req, res) => {
  return await Handler.cleanPlanData(req, res);
});

routers.post("/district-report-data", async (req, res) => {
  return await Handler.getDynamicDistrictData(req, res);
});

routers.post("/state-costing-sheet-report", async (req, res) => {
  return await Handler.stateCostingSheetReport(req, res);
});

routers.post("/state-costing-proposed-sheet-report", async (req, res) => {
  return await Handler.stateCostingProposedSheetReport(req, res);
});

routers.post("/national-coordinator-form-acitivity-list", async (req, res) => {
  return await Handler.nationalCoordinatorFormAcitivityList(req, res);
});

routers.post("/interventions-list", async (req, res) => {
  return await Handler.getInterventionsList(req, res);
});

routers.post("/save-new-intervention", async (req, res) => {
  return await Handler.saveNewIntervention(req, res);
});

routers.post("/notification", async (req, res) => {
  return await Handler.notification(req, res);
});

routers.post("/state-tentative-proposed/:id", async (req, res) => {
  return await Handler.stateTentativeProposedDetails(req, res);
});

routers.post("/get-state-cost-sheet-data", async (req, res) => {
  return await Handler.getStateCostSheetData(req, res);
});

routers.post("/get-ppt-data", async (req, res) => {
  return await Handler.getPptData(req, res);
});

routers.post(
  "/state-bdgt-data-physical-asset-school-list",
  async (req, res) => {
    return await Handler.stateBdgtDataPhysicalAssetSchoolList(req, res);
  }
);

routers.post("/submit-state-plan_state-costing-sheet", async (req, res) => {
  return await Handler.submitStatePlan_StateCostingSheet(req, res);
});

routers.post(
  "/submit-state-plan_state-costing-sheet-page-number",
  async (req, res) => {
    return await Handler.submitStatePlan_StateCostingSheetPageNumber(req, res);
  }
);
routers.post(
  "/update-submit-state-plan_state-costing-sheet-page-number",
  async (req, res) => {
    return await Handler.updateSubmitStatePlan_StateCostingSheetPageNumber(
      req,
      res
    );
  }
);

routers.post("/submit-plan_submit-district-plan", async (req, res) => {
  return await Handler.submitDistrictPlan(req, res);
});

routers.post("/national-coordinator-school-list-csv", async (req, res) => {
  return await Handler.nationalCoordinatorSchoolListCSV(req, res);
});
routers.post("/state-view-edit-formstate", async (req, res) => {
  return await Handler.statevieweditformCSV(req, res);
});

routers.post("/save-national-school-configuration", async (req, res) => {
  return await Handler.saveNationalSchoolConfiguration(req, res);
});

routers.post("/update-intervention-status", async (req, res) => {
  return await Handler.updateInterventionStatus(req, res);
});

routers.post("/intervention-details", async (req, res) => {
  return await Handler.interventionDetails(req, res);
});

routers.post("/additional-state-proposal-filter", async (req, res) => {
  return await Handler.additionalStateProposalFilter(req, res);
});

routers.post("/freeze-spillover-data", async (req, res) => {
  return await Handler.freezeSpillOverData(req, res);
});

routers.post("/freeze-expenditure-data", async (req, res) => {
  return await Handler.freezeExpenditureData(req, res);
});

routers.post("/allocation-list", async (req, res) => {
  return await Handler.allocationList(req, res);
});

routers.post("/activity-master-detail-list", async (req, res) => {
  return await Handler.activityMasterDetailListByActiviId(req, res);
});

routers.post("/update-allocation-list-state", async (req, res) => {
  return await Handler.updateAllocationListForState(req, res);
});
routers.post("/allocation_activity-master-list", async (req, res) => {
  return await Handler.allocationActivityMasterList(req, res);
});

routers.post("/allocation_activity-master-list-details", async (req, res) => {
  return await Handler.allocationActivityMasterDetailsList(req, res);
});

routers.post("/allocation_activity-master-list-district", async (req, res) => {
  return await Handler.allocationActivityMasterListDistrict(req, res);
});

routers.post(
  "/allocation_activity-master-list-details-district",
  async (req, res) => {
    return await Handler.allocationActivityMasterDetailsListDistrict(req, res);
  }
);

routers.post("/allocation-schools-list", async (req, res) => {
  return await Handler.allocationSchoolsList(req, res);
});

routers.post("/allocation-sub-components-list", async (req, res) => {
  return await Handler.allocationSubComponentsList(req, res);
});

routers.post("/allocation-sub-components-list-district", async (req, res) => {
  return await Handler.allocationSubComponentsListDistrict(req, res);
});
// ALLOCATION DASHBOARD FINALIZE

routers.post("/allocation-dashboard-finalize", async (req, res) => {
  return await Handler.finalizeAllocationdashboard(req, res);
});

// doclist get api
routers.post("/fetch-activity-list-doc", async (req, res) => {
  return await Handler.getSavedactivity(req, res);
});
routers.post("/fetch-doc-activity-detail-list", async (req, res) => {
  return await Handler.getdocactivityDetailList(req, res);
});

//  uploaded school list start
routers.post("/get-state-upload-document", async (req, res) => {
  return await StateuploaddocHandler.index(req, res);
});
routers.post("/get-proposed-detail-by-activity", async (req, res) => {
  return await StateuploaddocHandler.getProposeDetail(req, res);
});
routers.post("/update-activity-list-doc", async (req, res) => {
  return await Handler.updateStatus(req, res);
});
routers.delete("/delete-state-upload-document", async (req, res) => {
  return await StateuploaddocHandler.deleteFileRowById(req, res);
});
routers.post("/delete-activity-list-doc", async (req, res) => {
  return await Handler.deleteInvalidDataEntered(req, res);
});
routers.post("/bulkdelete-state-upload-document", async (req, res) => {
  return await StateuploaddocHandler.BulkDelete(req, res);
});

routers.post("/upload-nr-physical-assets-recommendation", async (req, res) => {
  return await Handler.activitymasterDetailRecommendation(req, res);
});
// uploaded school list end

// for approved_plan_asset_selection status update in prb_data table
routers.post("/get-approved-plan-asset-selection", async (req, res) => {
  return await Handler.getAllActivity(req, res);
});
routers.post("/bulkupdate-approved-plan-asset-selection", async (req, res) => {
  return await Handler.updateApprovedActivity(req, res);
});
//TRACKING LEVEL API'S
routers.post("/get-progress-tracking-level-data", async (req, res) => {
  return await Handler.getProgressTrackingLevel(req, res);
});
routers.post("/update-progress-tracking-level-data", async (req, res) => {
  return await Handler.updateProgressTrackingLevel(req, res);
});
routers.post("/finalize-progress-tracking-level-data", async (req, res) => {
  return await Handler.finalizeProgressTrackingLevel(req, res);
});
routers.post("/update-approved-plan-asset-selection", async (req, res) => {
  return await Handler.updateApprovedPlanassetSelection(req, res);
});
routers.post("/bulkupdate-approved-plan-asset-selection", async (req, res) => {
  return await Handler.BulkupdateApprovedPlanassetSelection(req, res);
});
routers.post("/allocation-form-lock", async (req, res) => {
  return await Handler.allocationFormLock(req, res);
});

routers.post("/check-progress-data", async (req, res) => {
  return await Handler.checkProgressData(req, res);
});

routers.post("/update-progress-list", async (req, res) => {
  return await Handler.updateProgressList(req, res);
});

routers.post("/district-wise-allocation-data", async (req, res) => {
  return await Handler.districtWiseAllocationData(req, res);
});

routers.post("/district-wise-allocation-data-district", async (req, res) => {
  return await Handler.districtWiseAllocationDataDistrict(req, res);
});

routers.post("/district-wise-progress-data-byasset", async (req, res) => {
  return await Handler.districtWiseProgressDataByAsset(req, res);
});

routers.post("/save-progress-data", async (req, res) => {
  return await Handler.saveProgressData(req, res);
});
routers.post("/lock-progress-data", async (req, res) => {
  return await Handler.saveProgressData(req, res);
});
routers.post("/month-wise-progress-data", async (req, res) => {
  return await Handler.monthWiseProgressData(req, res);
});

routers.post("/month-wise-progress-data-byasset", async (req, res) => {
  return await Handler.monthWiseProgressDataByAsset(req, res);
});

routers.post("/configure-progress-active-month", async (req, res) => {
  return await Handler.configureProgressActiveMonth(req, res);
});

routers.post("/progress-active-month-data", async (req, res) => {
  return await Handler.progressActiveMonthData(req, res);
});

routers.get("/progress-month-data", async (req, res) => {
  return await Handler.progressMonthData(req, res);
});

routers.post("/allocation-dashboard-data", async (req, res) => {
  return await Handler.allocationDashboardData(req, res);
});

routers.post("/progress-state-data", async (req, res) => {
  return await Handler.progressStateData(req, res);
});
// DIET ROUTE
routers.post("/diet-list", async (req, res) => {
  return await Handler.dietList(req, res);
});

routers.post("/diet-activity-list", async (req, res) => {
  return await Handler.dietActivityList(req, res);
});

routers.post("/approved-diet-activity-list", async (req, res) => {
  return await Handler.approvedDietActivityList(req, res);
});

routers.post("/update-diet-activity-list", async (req, res) => {
  return await Handler.updatedietList(req, res);
});

routers.post("/update-diet-approve-plan", async (req, res) => {
  return await Handler.updateDietApprovePlan(req, res);
});

routers.post("/approve-diet-configuration-list", async (req, res) => {
  return await Handler.approveDIETConfigurationList(req, res);
});

routers.post("/diet-fund-list", async (req, res) => {
  return await Handler.dietFundList(req, res);
});

routers.post("/draft-pab-report", async (req, res) => {
  return await Handler.draftPABData(req, res);
});

routers.post("/submit-approved-diet-plan", async (req, res) => {
  return await Handler.submitApprovedDIETPlan(req, res);
});

module.exports = routers;
