const Auth = require("./Auth/AuthValidator");
const Category = require("./Masters/CategoryValidator");
const Block = require("./Masters/BlockValidator");
const Designation = require("./Masters/DesignationValidator");
const District = require("./Masters/DistrictValidator");
const Role = require("./Masters/RoleValidator");
const State = require("./Masters/StateValidator");
const ActivityCategory = require("./Masters/Categories/ActivityValidator");
const SubActivityCategory = require("./Masters/Categories/SubActivityValidator");
const AssetCategory = require("./Masters/Categories/SubAssetValidator");
const SubAssetCategory = require("./Masters/Categories/SubAssetValidator");
const ConsultantMapping = require("./ConsultationMapping/ConsultationMapping");
const Mastertype = require("./Masters/MastertypeValidator");
const Mastercommondata = require("./Masters/MastercommondataValidator");
const Masteryear = require("./Masters/MasterYearValidator");

module.exports = {
  Auth,
  Block,
  Category,
  Designation,
  District,
  Role,
  State,
  ActivityCategory,
  SubActivityCategory,
  AssetCategory,
  SubAssetCategory,
  ConsultantMapping,
  Mastertype,
  Mastercommondata,
  Masteryear,
};
