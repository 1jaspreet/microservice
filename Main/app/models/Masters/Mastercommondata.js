const DB = require("../../../config/database/connection");

const table = "master_common_data as mb";
const knex = require("knex");

exports.knx = () => DB;
exports.query = () => DB(table);
// exports.all = async () => await DB(table).select().orderBy('block_name');

// exports.list = async () => await DB(table).select('id', 'type_code', 'title', 'description,status,').orderBy('title');

exports.find = async (object) => await DB(table).where(object).select("title");

exports.update = async (object, id) =>
  await DB(table).where("id", id).update(object);

exports.create = async (object) => await DB(table).insert(object);

// exports.findLocation = async (object = {}, limit, page) => await DB(table).join('master_districts as md', 'md.id', 'mb.district_id').join('master_states as ms', 'ms.id', 'mb.state_id').join('master_type_detail as mtd','mtd.master_type_detail_id','mb.master_type_detail_id').join('master_blocks as bk', 'bk.id', 'mb.block_id').where(object).select('mb.*', 'md.district_name', 'ms.state_name', 'bk.block_name').orderBy('created_at','desc').limit(limit).offset(limit * (page - 1));
exports.findData = async (object = {}, limit, page) => {
  let data =
    await DB.raw(`SELECT "mb".*, "mtd"."atribute_name","mt"."title" as master_type_id, "md"."district_name", "ms"."state_name", "bk"."block_name"
    FROM "master_common_data" AS "mb"
    INNER JOIN "master_districts" AS "md" ON "md"."id" = "mb"."district_id"
    INNER JOIN "master_states" AS "ms" ON "ms"."id" = "mb"."state_id"
    INNER JOIN "master_type_detail" AS "mtd" ON CAST("mtd"."master_type_detail_id" AS INTEGER) = CAST("mb"."master_type_detail_id" AS INTEGER)
    INNER JOIN "master_blocks" AS "bk" ON "bk"."id" = "mb"."block_id"
    INNER JOIN "master_type" AS "mt" ON "mb"."master_type_id" = "mt"."id"
    ORDER BY "mb"."created_at" DESC limit ${limit} offset ${
      limit * (page - 1)
    }`);
  console.log(data.rows, "data.rowswswwwwwwwwwwwwwwwwwwwwwwwwwwww");
  return data.rows;
};

exports.findOnes = async (object) =>
  (await DB(table).where(object).select())[0];
exports.findOne = async (object = {}) => {
  let data =
    await DB.raw(`SELECT "mb".*, "mtd"."atribute_name","mtd"."master_type_detail_id" ,"mt"."id" as master_type_id, "md"."district_name", "ms"."state_name", "bk"."block_name"
    FROM "master_common_data" AS "mb"
    INNER JOIN "master_districts" AS "md" ON "md"."id" = "mb"."district_id"
    INNER JOIN "master_states" AS "ms" ON "ms"."id" = "mb"."state_id"
    INNER JOIN "master_type_detail" AS "mtd" ON CAST("mtd"."master_type_detail_id" AS INTEGER) = CAST("mb"."master_type_detail_id" AS INTEGER)
    INNER JOIN "master_blocks" AS "bk" ON "bk"."id" = "mb"."block_id"
    INNER JOIN "master_type" AS "mt" ON "mb"."master_type_id" = "mt"."id"
    WHERE "mb"."id"=${object.id}`);
  return data.rows[0];
};

exports.updateAll = async (object, id) =>
  await DB(table).where("id", id).update(object);

// exports.delete = async object => await DB(table).where(object).delete();

exports.count = async (object) => (await DB(table).count("id"))[0].count;
