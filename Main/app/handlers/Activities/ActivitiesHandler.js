const Model = require("../../models").Activities;
const MasterBadge = require("../../models").MasterBadge;
const VolunteerRating = require("../../models").VolunteerRating;
const SchoolRating = require("../../models").SchoolRating;
const ActivityTimeLine = require("../../models").ActivityTimeLine;
const Volunteers = require("../../models").Volunteers;
const UserModel = require("../../models").User;
const ActivitiesView = require("../../models").ActivitiesView;
const TimelineModel = require("../../models").ActivityTimeline;
const SchoolModel = require("../../models").School;
const VolunteerModel = require("../../models").VolunteersActivities;
const Message = require("../../helpers/Message");
const Helper = require("../../helpers/Helper");
const Exception = require("../Assets/ExceptionHandler");
const dateTime = require("node-datetime");
const { FileUploader } = require("../../middlware");
const fs = require("fs");
const path = require("path");
const CHelper = require("../../helpers/Common");
///const DB    = require('../../../config/database/connection');

exports.uploadImages = (req, res) => {
  try {
    req.singleFile = "profile";
    req.pathname = "school/activities/";
    req.flag = "school";
    const parseToken = Helper.decodeToken(req);

    FileUploader(req, res, (response) => {
      if (response.status) {
        const request = response.body;
        ActivityTimeLine.findOne({
          activity_id: request.activity_id,
          activity_flag: +request.flag + 1,
        }).then((result) => {
          if (result !== undefined) {
            const filePath = path.join(
              process.cwd(),
              `public/uploads/school/activities/${request.activity_id}/` +
                result.activity_image
            );
            fs.exists(filePath, (exists) => {
              if (exists) {
                fs.unlink(filePath, (err) => {
                  if (err) {
                    return Exception.handle(e,res,req,'');
                  }
                });
              }
              ActivityTimeLine.update(
                { activity_image: response.filename },
                result.id
              )
                .then((result) => {
                  return res.status(200).json({
                    status: true,
                    message: Message.updated("Activity Image"),
                  });
                })
                .catch((err) => {
                  return res
                    .status(200)
                    .json({ status: false, message: Message.default() });
                });
            });
          } else {
            const object = {
              activity_id: request.activity_id,
              activity_image: response.filename,
              activity_flag: +request.flag + 1,
              created_by: parseToken.user.id,
            };
            ActivityTimeLine.create(object).then((result) => {
              if (result !== null) {
                return res.status(200).json({
                  status: true,
                  message: Message.uploaded("Activity Image"),
                });
              }
              return res
                .status(200)
                .json({ status: false, message: Message.default() });
            });
          }
        });

        // ActivityTimeLine.create(obj).then(result=>{
        //     if(image !== null || image !== ''){
        //         const filePath = path.join(process.cwd(),`public/uploads/profile/${parseToken.flag}/`+image);
        //         fs.exists(filePath, (exists) => {
        //             if(exists) {
        //                 fs.unlink(filePath, (err) => {
        //                     if(err){
        //                         return Exception.handle(e,res,req,'');
        //                     }
        //                 });
        //             }
        //         });
        //     }
        //     //return res.status(200).json({ status: true, message: Message.uploaded('Activity Image')});
        // })
      } else {
        return res
          .status(200)
          .json({ status: false, message: Message.default() });
      }
    });
  } catch (e) {
    return Exception.handle(e,res,req,'');
  }
};

exports.uploadImages11 = async (req, res) => {
  try {
    const request = req.body;
    return res.json({ s: false });

    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, "images/");
      },
      filename: (req, file, cb) => {
        cb(null, file.originalname);
      },
    });
    const upload = multer({ storage: storage });
    // upload.single('file');
    //image upload
    // app.post('/image', upload.single('file'), function (req, res) {
    // res.json({})
    // })
  } catch (e) {
    return Exception.handle(e,res,req,'');
  }
};

exports.index = async (req, res) => {
  try {
    const request = req.body;
    var where = {};
    var Query = ActivitiesView.query();

    if (request.udicecode > 0 && request.udicecode.length === 11) {
      var where = { ...where, ...{ "va.udise_code": request.udicecode } };
    } else {
      if (request.state > 0) {
        var where = { ...where, ...{ "va.activity_state_id": request.state } };
      }
      if (request.district > 0) {
        var where = {
          ...where,
          ...{ "va.activity_district_id": request.district },
        };
      }
      if (request.gender > 0) {
        var where = { ...where, ...{ "va.gender_id": request.gender } };
      }
      if (request.specialization > 0) {
        var where = {
          ...where,
          ...{ "va.specialization_id": request.specialization },
        };
      }
      if (request.category > 0) {
        var where = {
          ...where,
          ...{ "va.activity_category_id": request.category },
        };
      }
      if (request.schoolid > 0) {
        var where = { ...where, ...{ "va.school_id": request.schoolid } };
      }
      if (request.status !== undefined) {
        var where = {
          ...where,
          ...{ "va.application_status": request.status },
        };
      }
      //var where   =   {...where,...{'va.application_status':request.status}};
    }

    const count = (await Query.select("id").where(where)).length;
    const object = await Query.select("*")
      .where(where)
      .limit(request.limit)
      .offset(request.limit * (request.page - 1));
    res.status(200).json({ status: true, data: object, count: count });
  } catch (e) {
    return Exception.handle(e,res,req,'');
  }
};

exports.indexBack = async (req, res) => {
  try {
    const request = req.body;
    var where = {};
    const select = [
      "ac.*",
      "ms.specialization_name",
      "s.school_postal_address",
      "mg.gender_name",
      "s.udise_code",
      "s.school_name",
      "sm.state_name",
      "dm.district_name",
      "mac.activity_category_name",
      "masc.activity_sub_category_name",
    ];

    var Query = Model.query()
      .select(select)
      .join("master_schools as s", "s.id", "=", "ac.school_id")
      .join("master_states as sm", "sm.id", "=", "ac.activity_state_id")
      .join("master_districts as dm", "dm.id", "=", "ac.activity_district_id")
      .join(
        "master_activity_categories as mac",
        "mac.id",
        "=",
        "ac.activity_category_id"
      )
      .join(
        "master_activity_sub_categories as masc",
        "masc.id",
        "=",
        "ac.activity_sub_category_id"
      )
      .join(
        "master_specializations as ms",
        "ms.id",
        "=",
        "ac.specialization_id"
      )
      .join("master_genders as mg", "mg.id", "=", "ac.gender_id");

    if (request.udicecode > 0 && request.udicecode.length === 11) {
      var where = { ...where, ...{ "s.udise_code": request.udicecode } };
    } else {
      if (request.state > 0) {
        var where = { ...where, ...{ "ac.activity_state_id": request.state } };
      }
      if (request.district > 0) {
        var where = {
          ...where,
          ...{ "ac.activity_district_id": request.district },
        };
      }
      if (request.gender > 0) {
        var where = { ...where, ...{ "ac.gender_id": request.gender } };
      }
      if (request.specialization > 0) {
        var where = {
          ...where,
          ...{ "ac.specialization_id": request.specialization },
        };
      }
      if (request.category > 0) {
        var where = {
          ...where,
          ...{ "ac.activity_category_id": request.category },
        };
      }
      if (request.schoolid > 0) {
        var where = { ...where, ...{ "ac.school_id": request.schoolid } };
      }

      // if(request.block > 0){
      //     var where   =   {...where,...{'school_block_id':request.block}};
      // }
    }

    const count = (await Query.select("ac.id").where(where)).length;
    const object = await Query.where(where)
      .limit(request.limit)
      .offset(request.limit * (request.page - 1));
    res.status(200).json({ status: true, data: object, count: count });
  } catch (e) {
    return Exception.handle(e,res,req,'');
  }
};

exports.create = async (req, res) => {
  try {
    const request = req.body;
    const data = {
      school_id: request.schoolId,
      activity_state_id: 20,
      activity_district_id: 2016,
      activity_category_id: request.activity_category,
      activity_sub_category_id: request.activity_name,
      class_category_id: request.activity_class,
      specialization_id: request.specialization,
      gender_id: request.gender,
      activity_details: request.details,
      activity_duration: request.duration,
      activity_last_reciving_date: request.last_date,
      activity_tentative_start_date: request.start_date,
      activity_actual_start_date: request.start_date,
      activity_publish: 1,
    };
    // if (request.btnStatus === 'draft') {
    //     var obj = { ...data, activity_publish: 0 };
    //     var dflag = 0;
    // }
    // else {
    //     var obj = { ...data, activity_publish: 1 };
    //     var dflag = 1;
    // }
    const result = await Model.create(data);

    // if (dflag) {
    //     var message = (result) ? Message.created('Activity') : Message.default();
    // } else {
    //     var message = (result) ? Message.createdDraft('Activity') : Message.default();
    // }
    var message = result ? Message.created("Activity") : Message.default();
    res.status(200).json({ status: true, message: message });
  } catch (e) {
    return Exception.handle(e,res,req,'');
  }
};

exports.ratingToVolunteerBySchool = async (req, res) => {
  try {
    const request = req.body;
    const data = {
      suggestion: request.comment,
      rate: request.rate,
      activity_id: request.activity_id,
      volunteer_id: request.volunteer_id,
      school_id: request.schoolId,
      module: request.module,
    };
    const result = await VolunteerRating.create(data);
    if (result) {
      await VolunteerModel.query()
        .where({
          school_activity_post_id: request.activity_id,
          volunteer_id: request.volunteer_id,
        })
        .update({ rate: request.rate });
      var message = result ? Message.created("Rating") : Message.default();
    }
    const volunteer_data = await Volunteers.findOne({
      id: request.volunteer_id,
    });
    if (volunteer_data != null) {
      var no_rating_count = volunteer_data.total_number_of_rating + 1;
      var total_rating_count = volunteer_data.total_rating + request.rate;
      await Volunteers.update(
        {
          total_number_of_rating: no_rating_count,
          total_rating: total_rating_count,
        },
        request.volunteer_id
      );
    }
    res.status(200).json({ status: true, message: message });
  } catch (e) {
    return Exception.handle(e,res,req,'');
  }
};

exports.ratingToSchoolByVolunteer = async (req, res) => {
  try {
    const request = req.body;
    const data = {
      suggestion: request.comment,
      rate: request.rate,
      activity_id: request.activity_id,
      volunteer_id: request.volunteer_id,
      school_id: request.schoolId,
      module: request.module,
    };
    const result = await SchoolRating.create(data);
    if (result) {
      //const object = await Model.update(rate, request.id);
      await VolunteerModel.query()
        .where({
          school_activity_post_id: request.activity_id,
          volunteer_id: request.volunteer_id,
        })
        .update({ rate_school: request.rate });
      var message = result ? Message.created("Rating") : Message.default();
    }
    res.status(200).json({ status: true, message: message });
  } catch (e) {
    return Exception.handle(e,res,req,'');
  }
};

exports.update = async (req, res) => {
  try {
    const request = req.body;
    const result = await Model.findOne({ id: request.id });

    if (result != null) {
      var data = {};
      if (request.activity_category !== undefined) {
        var data = { ...data, activity_category_id: request.activity_category };
      }
      if (request.activity_name !== undefined) {
        var data = { ...data, activity_sub_category_id: request.activity_name };
      }
      if (request.activity_class !== undefined) {
        var data = { ...data, class_category_id: request.activity_class };
      }
      if (request.specialization !== undefined) {
        var data = { ...data, specialization_id: request.specialization };
      }
      if (request.gender !== undefined) {
        var data = { ...data, gender_id: request.gender };
      }
      // if (request.btnStatus !== undefined) {
      //     if (request.btnStatus === 'draft') {
      //         var data = { ...data, activity_publish: 0 }
      //     } else {
      //         var data = { ...data, activity_publish: 1 }
      //     }
      // }
      if (request.details !== undefined) {
        var data = { ...data, activity_details: request.details };
      }
      if (request.duration !== undefined) {
        var data = { ...data, activity_duration: request.duration };
      }
      if (request.last_date !== undefined) {
        var data = { ...data, activity_last_reciving_date: request.last_date };
      }
      if (request.start_date !== undefined) {
        var data = {
          ...data,
          activity_tentative_start_date: request.start_date,
        };
      }

      const object = await Model.update(data, request.id);

      const message = object ? Message.updated("User") : Message.default();
      res.status(200).json({ status: true, message: message });
    } else {
      res
        .status(200)
        .json({ status: false, message: Message.notFound("Record") });
    }
  } catch (e) {
    return Exception.handle(e,res,req,'');
  }
};

exports.inviteAccept = async (req, res) => {
  try {
    const request = req.body;
    const result = await VolunteerModel.findOne({ id: request.rowId });
    var data = {};
    if (result != null) {
      if (request.status !== undefined) {
        var data = { ...data, volunteer_status: request.status };
        var data = { ...data, decline_reason: "NULL" };
      }

      if (request.interviewMode !== undefined) {
        var data = { ...data, interview_mode: request.interviewMode };
      }

      if (request.details !== undefined) {
        var data = { ...data, meeting_details: request.details };
      }

      if (request.details !== undefined) {
        var data = {
          ...data,
          meeting_date: Helper.dateYMD(request.meetingDate),
        };
      }

      const object = await VolunteerModel.update(data, request.rowId);
      const message = object ? Message.invited("Volunteer") : Message.default();
      res.status(200).json({ status: true, message: message });
    } else {
      //res.status(200).json({status:false,message:Message.notFound('Record')});
    }
  } catch (e) {
    return Exception.handle(e,res,req,'');
  }
};

exports.ConfirmAccept = async (req, res) => {
  try {
    const request = req.body;
    const result = await VolunteerModel.findOne({ id: request.rowId });
    var data = {};
    if (result != null) {
      if (request.status !== undefined) {
        var data = {
          ...data,
          volunteer_status: request.status,
          application_status: 1,
        };
      }
      if (request.complete_status !== undefined) {
        var data = { ...data, completion_status: request.complete_status };
      }
      if (request.actualStartDate !== undefined) {
        var data = {
          ...data,
          meeting_start_date: Helper.dateYMD(request.actualStartDate),
        };
      }
      if (request.actualEndDate !== undefined) {
        var data = {
          ...data,
          meeting_end_date: Helper.dateYMD(request.actualEndDate),
        };
      }
      const object = await VolunteerModel.update(data, request.rowId);
      const result = await Volunteers.findOne({ id: request.vid });
      if (result != null) {
        var participation_count = result.total_participation + 1;
        const badge_id = Helper.badge(result.total_participation);
        await Volunteers.update(
          { total_participation: participation_count, badge_id: badge_id },
          request.vid
        );
      }
      const message = object
        ? Message.confirmed("Volunteer")
        : Message.default();
      res.status(200).json({ status: true, message: message });
    } else {
      //res.status(200).json({status:false,message:Message.notFound('Record')});
    }
  } catch (e) {
    return Exception.handle(e,res,req,'');
  }
};

exports.volunteerReject = async (req, res) => {
  try {
    const request = req.body;
    const result = await VolunteerModel.findOne({ id: request.rowId });
    var data = {};
    if (result != null) {
      if (request.status !== undefined) {
        var data = {
          ...data,
          volunteer_status: request.status,
          application_status: 2,
        };
      }
      if (request.decline_reason !== undefined) {
        var data = { ...data, decline_reason: request.decline_reason };
      }
      const object = await VolunteerModel.update(data, request.rowId);
      const message = object
        ? Message.rejected("Volunteer")
        : Message.default();
      res.status(200).json({ status: true, message: message });
    } else {
      //res.status(200).json({status:false,message:Message.notFound('Record')});
    }
  } catch (e) {
    return Exception.handle(e,res,req,'');
  }
};

exports.activityTotal = async (req, res) => {
  try {
    const request = req.body;
    var where = {};
    if (request.school_id > 0) {
      var where = { ...where, ...{ "ac.school_id": request.school_id } };
    }
    const total_count = (await Model.query().select("ac.id").where(where))
      .length;
    const total_completed = (
      await Model.query()
        .select("ac.id")
        .where(where)
        .where({ "ac.activity_closed": 1 })
    ).length;
    const total_pending = (
      await Model.query()
        .select("ac.id")
        .where(where)
        .where({ "ac.activity_closed": 0 })
    ).length;
    const total_not_published = (
      await Model.query()
        .select("ac.id")
        .where(where)
        .where({ "ac.activity_publish": 0 })
    ).length;
    res.status(200).json({
      status: true,
      total_count: total_count,
      total_completed: total_completed,
      total_pending: total_pending,
      total_not_published: total_not_published,
    });
  } catch (e) {
    return Exception.handle(e,res,req,'');
  }
};

exports.activityDetail = async (req, res) => {
  try {
    const request = req.body;
    var where = {};
    const select = [
      "ac.*",
      "ms.specialization_name",
      "s.school_postal_address",
      "mg.gender_name",
      "s.udise_code",
      "s.school_name",
      "sm.state_name",
      "dm.district_name",
      "mac.activity_category_name",
      "masc.activity_sub_category_name",
      "s.school_email",
      "s.school_mobile",
      "s.school_state_name",
      "s.school_district_name",
      "s.school_block_name",
    ];

    var Query = Model.query()
      .leftJoin("master_schools as s", "s.id", "=", "ac.school_id")
      .leftJoin("master_states as sm", "sm.id", "=", "ac.activity_state_id")
      .leftJoin(
        "master_districts as dm",
        "dm.id",
        "=",
        "ac.activity_district_id"
      )
      .leftJoin(
        "master_activity_categories as mac",
        "mac.id",
        "=",
        "ac.activity_category_id"
      )
      .leftJoin(
        "master_activity_sub_categories as masc",
        "masc.id",
        "=",
        "ac.activity_sub_category_id"
      )
      .leftJoin(
        "master_specializations as ms",
        "ms.id",
        "=",
        "ac.specialization_id"
      )
      .leftJoin("master_genders as mg", "mg.id", "=", "ac.gender_id");

    if (request.id > 0) {
      var where = { ...where, ...{ "ac.id": request.id } };
    }

    const count = (await Query.select("ac.id").where(where)).length;
    const object = await Query.select(select).where(where);
    res.status(200).json({ status: true, data: object, count: count });
  } catch (e) {
    return Exception.handle(e,res,req,'');
  }
};

exports.volunteerParticipationStatus = async (req, res) => {
  try {
    const request = req.body;
    const select = ["av.volunteer_status"];
    var volunteerStatus = await VolunteerModel.query().select(select).where({
      "av.school_activity_post_id": request.id,
      "av.volunteer_id": request.vid,
    });
    if (volunteerStatus.length > 0) {
      res.status(200).json({
        status: true,
        VolunteerStatus: volunteerStatus[0].volunteer_status,
      });
    } else {
      res.status(200).json({ status: true, VolunteerStatus: 0 });
    }
  } catch (e) {
    return Exception.handle(e,res,req,'');
  }
};

exports.volunteerList = async (req, res) => {
  try {
    const request = req.body;
    var where = {};
    const select = [
      "a.activity_closed",
      "av.rate",
      "u.id as volunteer_id",
      "u.volunteer_name",
      "u.volunteer_mobile",
      "u.volunteer_email",
      "ms.state_name",
      "md.district_name",
      "av.volunteer_status",
      "av.meeting_date",
      "av.completion_status",
      "av.decline_reason",
    ];

    var Query = VolunteerModel.query()
      .join(
        "school_activities_posts as a",
        "a.id",
        "=",
        "av.school_activity_post_id"
      )
      .join("volunteers as u", "u.id", "=", "av.volunteer_id")
      .join("master_states as ms", "ms.id", "=", "a.activity_state_id")
      .join("master_districts as md", "md.id", "=", "a.activity_district_id");

    if (request.id > 0) {
      var where = { ...where, ...{ "av.school_activity_post_id": request.id } };
    }
    const count = (await Query.select("av.id").where(where)).length;
    const object = await Query.select(select).where(where);
    res.status(200).json({ status: true, data: object, count: count });
  } catch (e) {
    return Exception.handle(e,res,req,'');
  }
};

exports.activityImage = async (req, res) => {
  try {
    const request = req.body;
    var where = {};
    if (request.id > 0) {
      var where = { ...where, ...{ activity_id: request.id } };
    }

    const object = await TimelineModel.query()
      .select(["activity_image", "activity_flag"])
      .where(where);
    const activityClosedStatus = await Model.findOne({ id: request.id });
    let images = {};

    if (object !== null) {
      const filePath = path.join(
        process.cwd(),
        `public/uploads/school/activities/${request.id}/`
      );
      object.map((item) => {
        images = {
          ...images,
          [item.activity_flag]: `data:image/png;base64,${CHelper.base64Encode(
            filePath + item.activity_image
          )}`,
        };
      });
    }
    res.status(200).json({
      status: true,
      data: images,
      activityCloseStatus: activityClosedStatus.activity_closed,
    });
  } catch (e) {
    return Exception.handle(e,res,req,'');
  }
};

exports.schoolProfile = async (req, res) => {
  try {
    const request = req.body;
    var where = {};
    if (request.id > 0) {
      var where = { ...where, ...{ "ms.id": request.id } };
    }

    const select = [
      "ms.school_name",
      "ms.school_block_name",
      "ms.school_mobile",
      "ms.school_email",
      "ms.school_address",
      "ms.school_postal_code",
      "ms.school_postal_address",
      "mst.state_name",
      "md.district_name",
    ];
    var Query = SchoolModel.query()
      .join("master_states as mst", "mst.id", "=", "ms.school_state_id")
      .join("master_districts as md", "md.id", "=", "ms.school_district_id");
    // join('master_school_categories as msc','msc.id','=','ms.school_category');

    const object = await Query.select(select).where(where);

    res.status(200).json({ status: true, data: object[0] });
  } catch (e) {
    return Exception.handle(e,res,req,'');
  }
};

exports.volunteerProfile = async (req, res) => {
  try {
    const request = req.body;
    var where = {};
    if (request.id > 0) {
      var where = { ...where, ...{ "u.id": request.id } };
    }

    const select = [
      "u.user_name",
      "u.user_mobile",
      "u.user_email",
      "u.user_address",
      "u.user_postal_code",
      "ms.state_name",
    ];
    var Query = UserModel.query().join(
      "master_states as ms",
      "ms.id",
      "=",
      "u.user_state_id"
    );
    //join('master_districts as md','md.id','=','u.user_district_id');
    //join('master_school_categories as msc','msc.id','=','ms.school_category');

    const object = await Query.select(select).where(where);
    res.status(200).json({ status: true, data: object[0] });
  } catch (e) {
    return Exception.handle(e,res,req,'');
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.body;
    const object = await Model.findOne({ id });
    if (object != null) {
      const status = object.state_status == 1 ? 0 : 1;
      const result = await Model.update({ state_status: status }, id);
      const message = result
        ? Message.status("Record", status)
        : Message.default();
      res.status(200).json({ status: true, message: message });
    } else {
      res
        .status(404)
        .json({ status: false, message: Message.notFound("Record") });
    }
  } catch (e) {
    return Exception.handle(e,res,req,'');
  }
};

exports.closeActivity = async (req, res) => {
  try {
    const request = req.body;
    const result = await Model.findOne({ id: request.aid });
    if (
      request.impected_student !== undefined &&
      request.impected_student !== ""
    ) {
      const TimelineImage = await TimelineModel.find({
        activity_id: request.aid,
      });
      var data = {};
      if (+Object.keys(TimelineImage).length === 3) {
        if (result != null) {
          if (request.reason_closer !== undefined) {
            var data = {
              ...data,
              activity_close_reason: request.reason_closer,
              activity_closed: 1,
              application_status: 1,
            };
          }
          if (request.impected_student !== undefined) {
            var data = { ...data, impected_students: request.impected_student };
          }
          const object = await Model.update(data, request.aid);
          const message = object
            ? Message.closed("Activity")
            : Message.default();
          res.status(200).json({ status: true, message: message });
        } else {
          res
            .status(200)
            .json({ status: false, message: Message.notFound("Record") });
        }
      } else {
        res
          .status(200)
          .json({ status: true, message: "Please upload close images." });
      }
    } else {
      if (result != null) {
        if (request.reason_closer !== undefined) {
          var data = {
            ...data,
            activity_close_reason: request.reason_closer,
            activity_closed: 1,
            application_status: 1,
          };
        }
        const object = await Model.update(data, request.aid);
        const message = object ? Message.closed("Activity") : Message.default();
        res.status(200).json({ status: true, message: message });
      } else {
        res
          .status(200)
          .json({ status: false, message: Message.notFound("Record") });
      }
    }
  } catch (e) {
    return Exception.handle(e,res,req,'');
  }
};

exports.find = async (req, res) => {
  try {
    const { id } = req.body;
    const object = await Model.findOne({ id });
    if (object != null) {
      res.status(200).json({ status: true, data: object });
    } else {
      res
        .status(404)
        .json({ status: false, message: Message.notFound("Record") });
    }
  } catch (e) {
    return Exception.handle(e,res,req,'');
  }
};

exports.PendingInviteCount = async (req, res) => {
  try {
    const PG = require("../../../config/database/postgres");
    const request = req.body;
    const object = await PG.query(`select       
         (select count(av.id) as cnt from activity_volunteers as av where av.school_activity_post_id = ac.id and av.volunteer_status != 'WithdrawAppliaction') as volunteer_count,
         (SELECT COUNT(activity_volunteers.id) FROM activity_volunteers WHERE activity_volunteers.school_activity_post_id = ac.id AND activity_volunteers.volunteer_status = 'Invited') as invite_vol_count,
         (SELECT COUNT(activity_volunteers.id) FROM activity_volunteers WHERE activity_volunteers.school_activity_post_id = ac.id AND activity_volunteers.volunteer_status = 'Reschedule Invited For Meeting') as reschedule_invite_vol_count,
         (SELECT COUNT(activity_volunteers.id) FROM activity_volunteers WHERE activity_volunteers.school_activity_post_id = ac.id AND activity_volunteers.volunteer_status = 'Pending') as pending_vol_count,
         (SELECT COUNT(activity_volunteers.id) FROM activity_volunteers WHERE activity_volunteers.school_activity_post_id = ac.id AND activity_volunteers.volunteer_status = 'Confirmed') as confirm_vol_count,
         (SELECT COUNT(activity_volunteers.id) FROM activity_volunteers WHERE activity_volunteers.school_activity_post_id = ac.id AND (activity_volunteers.volunteer_status = 'Decline' OR activity_volunteers.volunteer_status = 'Decline For Confirmed')) as rejected_vol_count
        from school_activities_posts ac where ac.id =${request.activity_id}`);
    const volunteerStatus = await PG.query(
      `select volunteer_status from activity_volunteers where school_activity_post_id =${request.activity_id}`
    );
    // console.log(volunteerStatus);
    res.status(200).json({
      status: true,
      data: object.rows[0],
      volunteerStatus: volunteerStatus,
    });
  } catch (e) {
    return Exception.handle(e,res,req,'');
  }
};
