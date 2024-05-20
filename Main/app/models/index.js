const Volunteers = require("./Volunteer/VolunteerModel");
const QuantityReceived = require("./Volunteer/QuantityReceivedModel");
const OLdPassword = require("./Volunteer/OldPasswordModel");
const AdminUser = require("./Volunteer/AdminUserModel");
const Activities = require("./Activities/ActivitiesModel");
const VolunteerRating = require("./Activities/VolunteerRatingModel");
const SchoolRating = require("./Activities/SchoolRatingModel");
const ActivityTimeLine = require("./Activities/ActivityTimeLineModel");
const AssetTimeLine = require("./Contributions/AssetTimeLineModel");
const ActivitiesView = require("./Views/ActivitiesView");
const VolunteersActivitiesView = require("./Views/VolunteersActivitiesView");
const VolunteerAsstestMaterialView = require("./Views/VolunteerAsstestMaterialView");
const SchoolAsstestMaterialView = require("./Views/SchoolAsstestMaterialView");
const ContributionView = require("./Views/ContributionView");
const SchoolContributions = require("./Contributions/SchoolContributionsModel");
const ContributionVolunteers = require("./Contributions/ContributionVolunteersModel");
const OfflineContribution = require("./Contributions/OfflineContributionModel");
const PreferenceVolunteers = require("./PreferenceVolunteers/PreferenceVolunteersModel");
const ActivityContributions = require("./Activities/ActivityContributionsModel");
const UserDetail = require("./Volunteer/UserDetailModel");
const Block = require("./Masters/BlockModel");
const Mastertype = require("./Masters/Mastertype");
const Mastercommondata = require("./Masters/Mastercommondata");
const Mastertypedetail = require("./Masters/Mastertypedetail");
const FilesData = require("./Masters/FilesData");
const Role = require("./Masters/RoleModel");
const RequestOnboard = require("./Masters/RequestOnboardModel");
const Maintenance = require("./Masters/MaintenanceModel");
const SchoolCategory = require("./Masters/SchoolCategoryModel");
const State = require("./Masters/StateModel");
const MasterBadge = require("./Masters/BadgeModel");
const ActivityTimeline = require("./Masters/ActivityTimelineModel");
const AdminUsers = require("./Masters/AdminUsersModel");
const ContributionTimeline = require("./Masters/ContributionTimelineModel");
const VolunteersActivities = require("./Masters/VolunteerModel");
const Country = require("./Masters/CountryModel");
const Qualification = require("./Masters/QualificationModel");
const Gender = require("./Masters/GenderModel");
const Specialization = require("./Masters/SpecializationModel");
const Status = require("./Masters/StatusModel");
const CloseReason = require("./Masters/CloseReasonModel");
const VolunteerType = require("./Masters/VolunteerTypeModel");
const District = require("./Masters/DistrictModel");
const Category = require("./Masters/CategoryModel");
const Designation = require("./Masters/DesignationModel");
const School = require("./Masters/SchoolModel");
const Progress = require("./Progress/ProgressModel");
const ActivityCategory = require("./Masters/ActivityCategoryModel");
const ActivitySubCategory = require("./Masters/ActivitySubCategoryModel");
const AssetCategory = require("./Masters/AssetCategoryModel");
const AssetSubCategory = require("./Masters/AssetSubCategory");
const ClassCategory = require("./Masters/ClassCategoryModel");
const SchoolType = require("./Masters/SchoolTypeModel");
const SchoolManagement = require("./Masters/SchoolManagementModel");

const UserLog = require("./Logs/UserLogModel");
const ErrorLog = require("./Logs/ErrorLogModel");
const ActivityLog = require("./Logs/ActivityLogModel");
const Setting = require("./Assets/SettingModel");
const FeedbackContact = require("./Assets/FeedbackContactModel");
const Prabandh = require("./Prabandh/PrabandhModel");
const ConsultantMapping = require("./ConsultantMapping/ConsultantMappingModel");
const cmsModele = require("./Cms/cmsModle");
const cmsSubcategoryModel = require("./Cms/cmsSubcategoryModel");
const cmsContentModdle = require("./Cms/cmsContentModdle");
const planStatusModel = require("./PlanStatus/PlanStatusModel");
const MasterYear = require("./Masters/MasterYearModel");
const ApiLogs = require("./Logs/ApiLogModel");
const pmshriApiLogModel = require("./Logs/pmshriApiLogModel");
const supportModel = require("./Support/SupportModel");
const ReportModel = require("./Masters/ReportModel");
const BudgetAllotmentModel = require("./Budget/BudgetAllotmentModel");
const Statefileupload = require("./Masters/Statefileupload");
const MasterGroup = require("./Masters/MasterGroupModel");
const MasterSettings = require("./Masters/MasterSettingsModel");
const MasterDIET = require("./Masters/MasterDIETModel");
const pmshri = require("./pmshri/pmshriModel");
const allocationModel = require("./pmshri/allocationModel");
const PMSHRIAdminUserModel = require("./Volunteer/PMSHRIAdminUserModel");

module.exports = {
  OfflineContribution,
  ContributionVolunteers,
  SchoolContributions,
  PreferenceVolunteers,
  Specialization,
  Activities,
  ActivityContributions,
  AdminUser,
  Volunteers,
  UserDetail,
  Block,
  Mastertype,
  Mastercommondata,
  Role,
  Country,
  State,
  District,
  Category,
  Designation,
  School,
  Progress,
  ErrorLog,
  UserLog,
  ActivityLog,
  Setting,
  ActivityCategory,
  SchoolCategory,
  ActivitySubCategory,
  AssetCategory,
  AssetSubCategory,
  Activities,
  Qualification,
  Gender,
  Status,
  CloseReason,
  VolunteerType,
  ClassCategory,
  SchoolType,
  SchoolManagement,
  ActivityTimeline,
  VolunteersActivities,
  Maintenance,
  ActivitiesView,
  ContributionView,
  OLdPassword,
  ContributionTimeline,
  AdminUsers,
  VolunteersActivitiesView,
  VolunteerAsstestMaterialView,
  FeedbackContact,
  RequestOnboard,
  ActivityTimeLine,
  QuantityReceived,
  AssetTimeLine,
  SchoolAsstestMaterialView,
  VolunteerRating,
  SchoolRating,
  MasterBadge,
  Prabandh,
  ConsultantMapping,
  FilesData,
  Mastertypedetail,
  cmsModele,
  cmsContentModdle,
  cmsSubcategoryModel,
  planStatusModel,
  MasterYear,
  ApiLogs,
  supportModel,
  ReportModel,
  BudgetAllotmentModel,
  Statefileupload,
  MasterGroup,
  MasterSettings,
  MasterDIET,
  pmshri,
  allocationModel,
  PMSHRIAdminUserModel,
  pmshriApiLogModel
};
