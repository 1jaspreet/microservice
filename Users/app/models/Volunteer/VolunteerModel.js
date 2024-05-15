const DB = require("../../../config/database/connection");

const table = "volunteers as vs";

exports.db = DB;

exports.query = () => DB(table);

exports.all = async (object) => await DB(table).select().limit(object.limit);

exports.list = async () => await DB(table).select("id", "name");

exports.find = async (object) => await DB(table).where(object).select();

exports.update = async (object, id) =>
  await DB(table).where("id", id).update(object);

exports.create = async (object) => await DB(table).insert(object);

exports.findOne = async (object) => (await DB(table).where(object).select())[0];

exports.count = async (object) =>
  (await DB(table).where(object).count("id"))[0].count;

exports.delete = async (object) => await DB(table).where(object).delete();

//exports.rawdata  = async object => await DB.raw('select count(*) from users as user_count');

exports.isEmailExist = async (object) => {
  return (
    await DB(table)
      .where({ volunteer_email: object.email })
      .whereNot({ id: object.id })
      .count("id")
  )[0].count > 0
    ? true
    : false;
  // var Query  = DB(table);
  // var Query  = (object.flag) ? Query.where({role_id:object.role}) : Query.whereNot({id:object.id});
  // return ((await Query.where({email:object.email}).count('id'))[0]).count > 0 ? true :false;
};

exports.isMobileExist = async (object) => {
  return (
    await DB(table)
      .where({ volunteer_mobile: object.mobile })
      .whereNot({ id: object.id })
      .count("id")
  )[0].count > 0
    ? true
    : false;
  // var Query  = DB(table);
  // var Query  = (object.flag) ? Query.where({role_id:object.role}) : Query.whereNot({id:object.id});
  // return ((await Query.where({mobile:object.mobile}).count('id'))[0]).count > 0 ? true :false;
};
