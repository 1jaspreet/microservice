const DB = require("../../../config/database/connection");

const table = "prb_state_documents as psds";

// STATE FILE UPLOAD IN STATE_UPLOAD_DOCUMENTS TABLE

exports.query = () => DB(table);

// exports.list = async () => await DB(table).select('id', 'type_code', 'title', 'description,status,').orderBy('title');

// exports.find = async object => await DB(table).where(object).select();

// exports.update = async (object, id) => await DB(table).where('id', id).update(object);

// exports.updateAll = async (object, id) => await DB(table).where('id', id).update(object);

exports.create = async (object) => await DB(table).insert(object);

exports.knx = () => DB;

exports.findCount = async (object = {}) => {
  const count =
    await DB.raw(`select count(*) as no_of_record from prb_state_documents psd 
	where psd.state_id ='${object.state_id}'
	and psd.plan_year = '${object.year}'
	and psd.activity_master_details_id = '${object.activity_master_detail_id}'`);
  return count.rows;
};
exports.findData = async (object = {}) => {
  let data =
    await DB.raw(`SELECT psds.id  ,psds.udise_code  , psm.school_name , psm.district_name , psds.physical_quantity , psds.financial_amount,psds.activity_master_details_id,psds.status, psds.valid_assset
    FROM prb_state_documents  psds , prb_school_master psm 
   WHERE psds.state_id = '${object.state_id}' and psds.activity_master_details_id = '${object.activity_master_detail_id}' and psds.plan_year = '${object.year}' and psm.udise_sch_code = psds.udise_code `);
  return data.rows;
};

exports.findProposeDetail = async (object = {}) => {
  let data =
    await DB.raw(`select  psawpbd.proposed_physical_quantity , proposed_financial_amount 
    from prb_state_ann_wrk_pln_bdgt_data psawpbd , prb_data pd 
    where pd.id = psawpbd.activity_master_details_id 
    and proposed_physical_quantity > 0 and plan_year = '${object.year}' and state = '${object.state_id}' and psawpbd.activity_master_details_id = '${object.activity_master_detail_id}' `);
  return data.rows;
};

exports.count = async (object) => (await DB(table).count("id"))[0].count;

exports.findOne = async (object) => (await DB(table).where(object).select())[0];

exports.findFileRow = async (id) => {
  let data = await DB.raw(`
    SELECT * from files_data as fd where fd.id=${id}`);
  return data.rows;
};

exports.delete = async (object) => await DB(table).where(object).delete();

exports.bulkDelete = async (object) =>
  await DB(table).whereIn("id", object).delete();
// INNER JOIN "master_districts" AS "md" ON "md"."id" = "psds"."district_id"
// INNER JOIN "master_blocks" AS "bk" ON "bk"."id" = "psds"."block_id"
// INNER JOIN "master_type" AS "mt" ON "psds"."master_type_id" = "mt"."id"
// exports.insertGetId = async object => await DB(table).returning('id').insert(object);

// exports.findOne = async object => (await DB(table).where(object).select())[0];

// exports.delete = async object => await DB(table).where(object).delete();

// exports.count = async object => ((await DB(table).count('id'))[0]).count;

// exports.findPublicFiles = async object => await DB(table).where({is_private: 0}).select();
