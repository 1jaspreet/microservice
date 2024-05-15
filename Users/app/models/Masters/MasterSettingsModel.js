const DB = require("../../../config/database/connection");
const tableact = "prb_activity_master as att";
const tablename = "master_year as my";
const tablesm = "system_menus as sm";
const tablemtps = "master_states_tentative_proposed as mt";
const tablesp = "system_permissions as sp";
const pd = "prb_data as pd";
const gam = "group_activity_mapping as gam";
const tablemg = "master_group as mg";
const tablelgm = "location_group_mapping as lgm";

exports.knx = () => DB;

exports.updateact = async (object, id) =>
  await DB(tableact)
    .where({ id: id })
    .update({ ...object, updated_at: DB.fn.now() });
exports.createact = async (object) => await DB(tableact).insert(object);
exports.updateayear = async (object, id) =>
  await DB(tablename).where({ id: id }).update(object);
exports.createYear = async (object) => await DB(tablename).insert(object);
exports.insertSystemMenu = async (object) => await DB(tablesm).insert(object);
exports.updateSystemMenu = async (object, id) =>
  await DB(tablesm).where({ id: id }).update(object);
exports.findMTSP = async (object) =>
  await DB(tablemtps).where(object).select().orderBy("state_name", "ASC");
exports.updateMTSP = async (object, id) =>
  await DB(tablemtps).where({ id: id }).update(object);
exports.findmenusystem = async (object) =>
  await DB(tablesm).where(object).select().orderBy("name", "ASC");
exports.findmenupermission = async (object) =>
  await DB(tablesp).where(object).select().orderBy("id", "DESC");
exports.findnotifications = async (object) =>
  await DB("notification").where(object).select();
exports.updateNotification = async (object, id) =>
  await DB("notification").where("id", id).update(object);
exports.createNotification = async (object) =>
  await DB("notification").insert(object);
exports.updateSubComponent = async (object, id) =>
  await DB("prb_sub_component").where("sub_component_id", id).update(object);
exports.createSubComponent = async (object) =>
  await DB("prb_sub_component").insert(object);
exports.updateSystemPermission = async (object, id) =>
  await DB(tablesp).where("id", id).update(object);
exports.createSystemPermission = async (object) =>
  await DB(tablesp).insert(object);
exports.deleteSystemPermission = async (object) =>
  await DB(tablesp).where(object).del();
exports.createSubActivity = async (object) => await DB(pd).insert(object);
exports.updateSubActivity = async (object, id) =>
  await DB(pd).update(object).where("id", id);
//exports.findGAMRecords = async object => await DB(gam).where(object).select();
exports.createMaster = async (object) => await DB(tablemg).insert(object);
exports.createActivityGroupMapping = async (object) =>
  await DB(gam).insert(
    object.map((row) => ({
      group_code: row.group_code,
      scheme_id: row.scheme_id,
      major_component_id: row.major_component_id,
      sub_component_id: row.sub_component_id,
      activity_master_id: row.activity_master_id,
      activity_master_details_id: row.activity_master_details_id,
      activity_level_id: row.activity_level_id,
      region_type_id: row.region_type_id,
    }))
  );
exports.updateActivityGroupMapping = async (object, id) =>
  await DB(gam).where("id", +id).update({
    group_code: object.group_code,
    scheme_id: object.scheme_id,
    major_component_id: object.major_component_id,
    sub_component_id: object.sub_component_id,
    activity_master_id: object.activity_master_id,
    activity_master_details_id: object.activity_master_details_id,
    activity_level_id: object.activity_level_id,
    region_type_id: object.region_type_id,
  });
//exports.updateActivityGroupMapping = async (object, id) => await DB(gam).where('id', id).update(object);
exports.deleteActivityGroupMapping = async (id) =>
  await DB(gam).where("id", id).del();
exports.getUniqueGAMData = async () =>
  await exports.knx()
    .raw(`SELECT MAX(gam.id) as id, gam.group_code, MAX(gam.scheme_id) as scheme_id,
                                                          MAX(gam.major_component_id) as major_component_id,
                                                          MAX(gam.sub_component_id) as sub_component_id,
                                                          MAX(gam.activity_master_id) as activity_master_id,
                                                          MAX(gam.activity_master_details_id) as activity_master_details_id,
                                                          MAX(gam.activity_level_id) as activity_level_id,
                                                          MAX(gam.region_type_id) as region_type_id
                                                          FROM group_activity_mapping gam GROUP BY gam.group_code;`);

exports.findGAMRecords = async (id) =>
  await exports.knx()
    .raw(`select gam.*, mg.group_name, ps.title as scheme_name, pmc.title as major_component_name,
                                                        psc.title as sub_component_name, pam.title as activity_master_name, pd.activity_master_details_name as activity_master_details_name
                                                        from group_activity_mapping gam
                                                        left join master_group mg on gam.group_code = mg.group_code
                                                        left join prb_schemes ps on gam.scheme_id = ps.id
                                                        left join prb_major_component pmc on gam.major_component_id = pmc.prb_major_component_id
                                                        left join prb_sub_component psc on gam.sub_component_id = psc.sub_component_id
                                                        left join prb_activity_master pam on gam.activity_master_id = pam.id
                                                        left join prb_data pd on gam.activity_master_details_id = pd.id
                                                        where gam.group_code = '${id}';`);

exports.getUniqueLGMData = async () =>
  await exports.knx()
    .raw(`SELECT MAX(lgm.location_group_mapping_id) as id, lgm.group_code, MAX(lgm.location_id) as location_id,
                                                        MAX(lgm.location_type) as location_type FROM location_group_mapping lgm GROUP BY lgm.group_code;`);

exports.findLGMRecords = async (id) =>
  await exports
    .knx()
    .raw(
      `select lgm.* from location_group_mapping lgm where lgm.group_code = '${id}';`
    );

exports.deleteLocationGroupMapping = async (id) =>
  await DB(tablelgm).where("location_group_mapping_id", id).del();

exports.createLocationGroupMapping = async (object) =>
  await DB(tablelgm).insert(
    object.map((row) => ({
      group_code: row.group_code,
      location_type: row.location_type,
      location_id: row.location_id,
    }))
  );

exports.updateLocationGroupMapping = async (object, id) =>
  await DB(tablelgm).where("location_group_mapping_id", +id).update({
    group_code: object.group_code,
    location_type: object.location_type,
    location_id: object.location_id,
  });
