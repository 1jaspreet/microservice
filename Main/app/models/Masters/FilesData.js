const DB = require("../../../config/database/connection");

const table = "files_data as fd";

exports.query = () => DB(table);

exports.knx = () => DB;
// exports.list = async () => await DB(table).select('id', 'type_code', 'title', 'description,status,').orderBy('title');

exports.find = async (object) => await DB(table).where(object).select();
exports.findst = async (object) =>
  await DB(table)
    .where({ role_id: 4 } && { role_id: 8 })
    .select();
exports.finddata = async (object = {}) => {
  let state = "";
  let district = "";
  console.log("object:::", object);
  if (object?.state_id) {
    console.log("state enter");
    state = `and "fd"."state_id" = ${object.state_id}`;
  }
  if (object?.district_id) {
    console.log("district enter");
    district = `and "fd"."district_id" = ${object.district_id}`;
  }

  let data =
    await DB.raw(` select fd.*, "md"."district_name" ,"ms"."state_name" from files_data fd 
    LEFT JOIN "master_districts" AS "md" ON "md"."id" = "fd"."district_id"
    LEFT JOIN "master_states" AS "ms" ON "ms"."id" = "fd"."state_id"
    where is_private = 0 
    or is_private = 1 and (role_id >= ${object?.role_id} or user_id = ${
      object?.user_id
    })  ${state} ${district}
     ORDER BY "fd"."id" DESC 
     LIMIT ${object?.limit}  OFFSET ${object.limit * (object.page - 1)};
    `);
  return data.rows;
  //  limit ${limit} offset ${limit * (page - 1)}
};

// exports.update = async (object, id) => await DB(table).where('id', id).update(object);

// exports.updateAll = async (object, id) => await DB(table).where('id', id).update(object);

exports.create = async (object) => await DB(table).insert(object);
exports.insertGetId = async (object) =>
  await DB(table).returning("id").insert(object);

exports.findOne = async (object) => (await DB(table).where(object).select())[0];

exports.delete = async (object) => await DB(table).where(object).delete();

exports.count = async (object) => (await DB(table).count("id"))[0].count;

exports.findPublicFiles = async (object) =>
  await DB(table).where({ is_private: 0 }).select();
