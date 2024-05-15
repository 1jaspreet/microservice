const Model = require("../../models");
const Exception = require("../Assets/ExceptionHandler");

exports.onGoginEvents = async (req, res) => {
  try {
    const object = await Model.ActivitiesView.query().select("*").limit(10);
    res.status(200).json({ status: true, data: object });
  } catch (e) {
    return Exception.handle(e,res,req,'');
  }
};

exports.successStories = async (req, res) => {
  try {
    const object = await Model.VolunteersActivitiesView.query()
      .select("*")
      .limit(10);
    res.status(200).json({ status: true, data: object });
  } catch (e) {
    return Exception.handle(e,res,req,'');
  }
};

exports.activitiesList = async (req, res) => {
  try {
    const object = await Model.ActivityCategory.query()
      .select("id", "activity_category_name as name", "sub_cat_count as count")
      .where({ activity_category_status: 1 })
      .orderBy("activity_category_name");
    res.status(200).json({ status: true, data: object });
  } catch (e) {
    return Exception.handle(e,res,req,'');
  }
};

exports.contributeActivitiesList = async (req, res) => {
  try {
    const request = req.body;
    var todayDate = new Date().toISOString().slice(0, 10);
    var Query = Model.ActivitiesView.query().where(
      "activity_last_reciving_date",
      ">=",
      todayDate
    );

    if (request.search !== null) {
      var Query = Query.whereILike("specialization_name", `%${request.search}%`)
        .orWhereILike("gender_name", `%${request.search}%`)
        .orWhereILike("state_name", `%${request.search}%`)
        .orWhereILike("district_name", `%${request.search}%`)
        .orWhereILike("activity_category_name", `%${request.search}%`)
        .orWhereILike("activity_sub_category_name", `%${request.search}%`)
        .orWhereILike("school_name", `%${request.search}%`);
    }

    if (request.category > 0) {
      var Query = Query.where({ activity_category_id: request.category });
    }

    if (request.state > 0) {
      var Query = Query.where({ activity_state_id: request.state });
    }

    if (request.district > 0) {
      var Query = Query.where({ activity_district_id: request.district });
    }

    if (request.gender.length > 0) {
      var Query = Query.where((Query) => {
        return request.gender.map((value) => {
          Query.orWhere({ gender_id: value });
        });
      });
    }

    if (request.specialization.length > 0) {
      var Query = Query.where((Query) => {
        return request.specialization.map((value) => {
          Query.orWhere({ specialization_id: value });
        });
      });
    }

    if (request.subcategory.length > 0) {
      var Query = Query.where((Query) => {
        request.subcategory.map((value) => {
          if (value > 0) {
            Query.orWhere({ activity_sub_category_id: value });
          }
        });
      });
    }

    const count = await Query.select("id");
    const object = await Query.select("*")
      .limit(request.limit)
      .orderBy("id", "desc")
      .offset(request.limit * (request.page - 1));

    return res
      .status(200)
      .json({ status: true, data: object, count: count.length });
  } catch (e) {
    return Exception.handle(e,res,req,'');
  }
};

// exports.subActivitiesList = async(req,res) =>{
//     try{
//         const object    =  await Model.ActivitySubCategory.query().select('id','activity_category_id as parent_id','activity_sub_category_name as name').where({'activity_sub_category_status':1}).orderBy('activity_sub_category_name');
//         res.status(200).json({status:true,'data':object});
//     }catch(e){
//         return Exception.handle(e,res,req,'');
//     }
// }

exports.subActivitiesList = async (req, res) => {
  try {
    const PG = require("../../../config/database/postgres");
    const request = req.body;
    const offset_value = request.limit * (request.page - 1);
    const limit_value = request.limit;
    const object = await PG.query(`select sap.activity_category_id as parent_id,
        sap.activity_sub_category_id as id,
        masc.activity_sub_category_name as name,
        masc.activity_sub_description as description,
        count(sap.id) 
        from school_activities_posts sap 
        inner join master_activity_sub_categories masc 
        on masc.id =  sap.activity_sub_category_id
        where sap.activity_last_reciving_date>=CURRENT_DATE and sap.application_status=0 and masc.activity_sub_category_status = 1
        group by sap.activity_category_id,sap.activity_sub_category_id,masc.activity_sub_category_name,masc.activity_sub_description
        order by sap.activity_category_id,sap.activity_sub_category_id`);
    return res.status(200).json({ status: true, data: object.rows });
  } catch (e) {
    return Exception.handle(e,res,req,'');
  }
};
