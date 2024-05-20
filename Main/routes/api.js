const express = require("express");
const routers = express.Router();

routers.use("/users/", require("../app/controllers/Users/UserController"));
routers.use("/logs/", require("../app/controllers/Logs/LogController"));
routers.use("/roles/", require("../app/controllers/Masters/RoleController"));
routers.use("/years/", require("../app/controllers/Masters/MasterYear"));
routers.use("/states/", require("../app/controllers/Masters/StateController"));
routers.use("/genders/", require("../app/controllers/Masters/GenderController"));
routers.use("/specialization/", require("../app/controllers/Masters/SpecializationController"));
routers.use("/status/", require("../app/controllers/Masters/StatusController"));
routers.use("/admin-users/", require("../app/controllers/Users/AdminUserController"));
routers.use("/close-resions/", require("../app/controllers/Masters/CloseReasonController"));
routers.use("/volunteer-types/", require("../app/controllers/Masters/VolunteerTypeController"));
routers.use("/class-categories/", require("../app/controllers/Masters/ClassCategoriesController"));
routers.use("/school-categories/", require("../app/controllers/Masters/SchoolCategoryController"));
routers.use("/school-managements/", require("../app/controllers/Masters/SchoolManagementController"));
routers.use("/school-types/", require("../app/controllers/Masters/SchoolTypeController"));
routers.use("/districts/", require("../app/controllers/Masters/DistrictController"));
routers.use("/prabandhdata/", require("../app/controllers/Prabandh/PrabandhController"));
routers.use("/countries/", require("../app/controllers/Masters/CountryController"));
routers.use("/blocks/", require("../app/controllers/Masters/BlockController"));
routers.use("/roles/", require("../app/controllers/Masters/RoleController"));
routers.use("/maintenance/", require("../app/controllers/Masters/MaintenanceController"));
routers.use("/schools/", require("../app/controllers/Masters/SchoolController"));
routers.use("/activities/", require("../app/controllers/Activities/ActivitiesController"));
routers.use("/volunteers/", require("../app/controllers/Volunteers/VolunteersController"));
routers.use("/contribute/", require("../app/controllers/Contribute/ContributeController"));
routers.use("/contributions/", require("../app/controllers/Contributions/ContributionsController"));
routers.use("/preference-volunteers/", require("../app/controllers/PreferenceVolunteers/PreferenceVolunteersController"));
routers.use("/categories/", require("../app/controllers/Masters/CategoryController"));
routers.use("/qualifications/", require("../app/controllers/Masters/SpecializationController"));
//routers.use('/qualifications/',require('../app/controllers/Masters/QualificationController'));
routers.use("/activity-categories/", require("../app/controllers/Masters/Categories/ActivityController"));
routers.use("/sub-activity-categories/", require("../app/controllers/Masters/Categories/SubActivityController"));
routers.use("/asset-categories/", require("../app/controllers/Masters/Categories/AssetController"));
routers.use("/sub-asset-categories/", require("../app/controllers/Masters/Categories/SubAssetController"));
routers.use("/designations/", require("../app/controllers/Masters/DesignationController"));
routers.use("/download/excel/", require("../app/controllers/Assets/ExcelController"));
routers.use("/download/pdf/", require("../app/controllers/Assets/PdfController"));
routers.use("/prabandh/", require("../app/controllers/Prabandh/PrabandhController"));
routers.use("/consultant/", require("../app/controllers/ConsultantMapping/ConsultantMappingController"));
// NITIN WORK THESE ROUTES

routers.use("/prabandh/mastertype/", require("../app/controllers/Masters/MasterType"));

// master common data
routers.use("/prabandh/mastercommondata/", require("../app/controllers/Masters/Mastercommondata"));

// upload file
routers.use("/prabandh/file/", require("../app/controllers/Masters/ExcelfileController"));
routers.use("/prabandh/", require("../app/controllers/Masters/ExcelfileController"));

routers.use("/cms/", require("../app/controllers/Cms/cmsCreate"));
routers.use("/support/", require("../app/controllers/Support/support"));
routers.use("/activityEdit", require("../app/controllers/Support/support"));
routers.use("/addActivity", require("../app/controllers/Support/support"));
routers.use("/updateYear", require("../app/controllers/Support/support"));
routers.use("/addYear", require("../app/controllers/Support/support"));
routers.use("/getMSPT", require("../app/controllers/Support/support"));
routers.use("/updatemts", require("../app/controllers/Support/support"));
routers.use("/system-menu", require("../app/controllers/Support/support"));
routers.use("/reports/", require("../app/controllers/Masters/ReportsController"));
routers.use("/budget/", require("../app/controllers/Budget/BudgetAllotmentController"));
routers.use("/proposal-after-approval/", require("../app/controllers/ProposalAfterApproval/ProposalAfterApprovalController"));
routers.use("/group", require("../app/controllers/Masters/MasterGroup"));
routers.use("/master-settings", require("../app/controllers/Masters/MasterSettingsController"));
routers.use("/diet", require("../app/controllers/Masters/MasterDIETController"));

module.exports = routers;