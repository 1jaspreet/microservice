const User = require("./Users/UserHandler");
const UserLog = require("./Users/UserLogHandler");
const AdminUser = require("./Users/AdminUserHandler");
const Auth = require("./Users/AuthHandler");
const Category = require("./Masters/CategoryHandler");
const Designation = require("./Masters/DesignationHandler");
const District = require("./Masters/DistrictHandler");
const Role = require("./Masters/RoleHandler");
const Block = require("./Masters/BlockHandler");
const Mastertype = require("./Masters/Mastertype");
const Mastercommondata = require("./Masters/Mastercommondata");
const Uploadfile = require("./Masters/Uploadfile");
const State = require("./Masters/StateHandler");
const Country = require("./Masters/CountryHandler");
const Qualification = require("./Masters/QualificationHandler");
const Gender = require("./Masters/GenderHandler");
const Specialization = require("./Masters/SpecializationHandler");
const Status = require("./Masters/StatusHandler");
const VolunteerType = require("./Masters/VolunteerTypeHandler");
const CloseReason = require("./Masters/CloseReasonHandler");
const School = require("./Masters/SchoolHandler");
const Activities = require("./Activities/ActivitiesHandler");
const Volunteers = require("./Volunteers/VolunteersHandler");
const Contributions = require("./Contributions/ContributionsHandler");
const Contribute = require("./Contribute/ContributeHandler");
const PreferenceVolunteers = require("./PreferenceVolunteers/PreferenceVolunteersHandler");
const ActivityCategory = require("./Masters/Categories/ActivityHandler");
const AssetCategory = require("./Masters/Categories/AssetHandler");
const SubActivityCategory = require("./Masters/Categories/SubActivityHandler");
const SubAssetCategory = require("./Masters/Categories/SubAssetHandler");
const ClassCategories = require("./Masters/ClassCategoriesHandler");
const SchoolManagement = require("./Masters/SchoolManagementHandler");
const SchoolType = require("./Masters/SchoolTypeHandler");
const SchoolCategory = require("./Masters/SchoolCategoryHandler");
const Otp = require("./Assets/OtpHandler");
const pmshriOtpHandler = require("./Assets/pmshriOtpHandler");
const Excel = require("./Assets/ExcelHandler");
const Pdf = require("./Assets/PdfHandler");
const Udise = require("./Assets/UdiseHandler");
const Password = require("./Assets/PasswordHandler");
const WebActivities = require("./Web/ActivitiesHandler");
const WebAssets = require("./Web/AssetsHandler");
const WebVolunteer = require("./Web/VolunteerHandler");
const WebSchools = require("./Web/SchoolsHandler");
const Prabandh = require("./Prabandh/PrabandhHandler");
const ConsultantMapping = require("./ConsultantMapping/ConsultantMappingHandler");
const cmsHandler = require("./Cms/cmsHandler");
const cmsSubcategoryHandler = require("./Cms/subcategoryHandler");
const Masteryear = require("./Masters/MasterYearHandler");
const ReportsMasterHandler = require("./Masters/ReportsHandler");
const StateuploaddocHandler = require("./Masters/StateuploaddocHandler");
const BudgetAllotmentHandler = require("./Budget/BudgetAllotmentHandler");
const ProposalAfterApprovalHandler = require("./ProposalAfterApproval/ProposalAfterApprovalHandler");
const Mastergroup = require("./Masters/MasterGroupHandler");
const MasterSettings = require("./Masters/MasterSettingsHandler");
const MasterDIET = require("./Masters/MasterDIETHandler");
const pmshri = require("./pmshri/pmshriHandler");
const PMSHRIAuthHandler = require("./Users/PMSHRIAuthHandler");
const pmshriAdminUserHandler = require("./Users/pmshriAdminUserHandler");

module.exports = {
  Contributions,
  Specialization,
  Activities,
  Volunteers,
  PreferenceVolunteers,
  AdminUser,
  User,
  Auth,
  Category,
  Designation,
  District,
  Role,
  Country,
  AssetCategory,
  SubActivityCategory,
  SubAssetCategory,
  Qualification,
  Gender,
  Status,
  CloseReason,
  VolunteerType,
  Excel,
  Pdf,
  ActivityCategory,
  ClassCategories,
  SchoolType,
  SchoolManagement,
  SchoolCategory,
  Udise,
  Password,
  UserLog,
  Contribute,
  State,
  Otp,
  Block,
  School,
  WebActivities,
  WebAssets,
  WebVolunteer,
  WebSchools,
  Prabandh,
  Mastertype,
  Mastercommondata,
  ConsultantMapping,
  Uploadfile,
  cmsHandler,
  cmsSubcategoryHandler,
  Masteryear,
  //  Mastertype,
  ReportsMasterHandler,
  StateuploaddocHandler,
  BudgetAllotmentHandler,
  ProposalAfterApprovalHandler,
  Mastergroup,
  MasterSettings,
  MasterDIET,
  pmshri,
  pmshriAdminUserHandler,
  PMSHRIAuthHandler,
  pmshriOtpHandler,
};
