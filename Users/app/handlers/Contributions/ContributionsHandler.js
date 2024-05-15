const Model = require("../../models").SchoolContributions;
const QuantityReceived = require("../../models").QuantityReceived;
const ContributionView = require("../../models").ContributionView;
const AssetTimeLine = require("../../models").AssetTimeLine;
const SchoolModel = require("../../models").School;
const VolunteerRating = require("../../models").VolunteerRating;
const Volunteers = require("../../models").Volunteers;
const SchoolRating = require("../../models").SchoolRating;
const ContributionVolunteers = require("../../models").ContributionVolunteers;
const OfflineContribution = require("../../models").OfflineContribution;
const Message = require("../../helpers/Message");
const { ClassCategory } = require("../../models");
const Exception = require("../Assets/ExceptionHandler");
const dateTime = require("node-datetime");
const Helper = require("../../helpers/Helper");
const { FileUploader } = require("../../middlware");
const fs = require("fs");
const path = require("path");
const CHelper = require("../../helpers/Common");

exports.index = async (req, res) => {
  try {
    const request = req.body;
    var where = {};
    var Query = ContributionView.query();
    if (request.udicecode > 0 && request.udicecode.length === 11) {
      var where = { ...where, ...{ "vsc.udise_code": request.udicecode } };
    } else {
      if (request.specialization > 0) {
        var where = {
          ...where,
          ...{ "vsc.specialization_id": request.specialization },
        };
      }
      if (request.category > 0) {
        var where = {
          ...where,
          ...{ "vsc.type_mastery_id": request.category },
        };
      }
      if (request.schoolid > 0) {
        var where = { ...where, ...{ "vsc.school_id": request.schoolid } };
      }
      var where = { ...where, ...{ "vsc.application_status": request.status } };
    }

    const count = (await Query.select("vsc.id").where(where)).length;
    const object = await Query.select("*")
      .where(where)
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
    const school = await SchoolModel.findOne({ id: request.school_id });
    if (school) {
      const obj = {
        school_id: request.school_id,
        asset_quantity: request.asset_qty,
        maintenance_required: request.maintenance,
        asset_category_id: request.asset_category,
        asset_sub_category_id: request.sub_category,
        asset_details: request.details,
        asset_state_id: school.school_state_id,
        asset_district_id: school.school_district_id,
        asset_expected_date: request.expected_date,
        asset_last_application_date: request.last_application_date,
      };
      const result = await Model.create(obj);
      if (result) {
        return res
          .status(200)
          .json({ status: true, message: Message.created("Contribution") });
      }
      return res
        .status(200)
        .json({ status: false, message: Message.default() });
    }
  } catch (e) {
    return Exception.handle(e,res,req,'');
  }
};

exports.offlineCreate = async (req, res) => {
  try {
    const request = req.body;
    // const school  = await OfflineContribution.findOne({ id: request.school_id });
    const school = await SchoolModel.findOne({ id: request.school_id });
    if (school) {
      const obj = {
        school_id: request.school_id,
        volunteer_type_id: request.vtype,
        mobile: request.vmobile,
        email: request.email,
        name: request.name,
        state_id: request.state,
        district_id: request.district,
        country_code: request.country,
        categoery_id: request.type_master_id,
        sub_categoery_id: request.sub_category,
        maintenance_required: request.maintenance_required,
        quantity: request.asset_qty,
        date_of_receiving: request.last_application_date,
      };
      const result = await OfflineContribution.create(obj);
      if (result) {
        return res.status(200).json({
          status: true,
          message: Message.created("Offline Contribution"),
        });
      }
      return res
        .status(200)
        .json({ status: false, message: Message.default() });
    }
  } catch (e) {
    return Exception.handle(e,res,req,'');
  }
};

exports.update = async (req, res) => {
  try {
    const request = req.body;
    const result = await Model.findOne({ id: request.id });
    var data = {};
    if (result != null) {
      if (request.assets_category !== undefined) {
        var data = { ...request, assets_category_id: request.assets_category };
      }
      if (request.sub_category !== undefined) {
        var data = { ...data, assets_sub_category_id: request.sub_category };
      }
      if (request.maintenance !== undefined) {
        var data = { ...data, maintenance_required: request.maintenance };
      }
      if (request.asset_qty !== undefined) {
        var data = { ...data, asset_quantity: request.asset_qty };
      }
      if (request.last_application_date !== undefined) {
        var data = {
          ...data,
          asset_last_application_date: request.last_application_date,
        };
      }
      if (request.expected_date !== undefined) {
        var data = { ...data, asset_expected_date: request.expected_date };
      }
      if (request.details !== undefined) {
        var data = { ...data, asset_details: request.details };
      }
      if (request.status === "publish") {
        var data = { ...data, asset_status: 1 };
      }
      const object = await Model.update(data, request.id);
      const message = object
        ? Message.updated("Contribution")
        : Message.default();
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

exports.contributionTotal = async (req, res) => {
  try {
    const request = req.body;
    var where = {};
    if (request.school_id > 0) {
      var where = { ...where, ...{ "sc.school_id": request.school_id } };
    }
    const total_count = (await Model.query().select("sc.id").where(where))
      .length;
    const total_completed = (
      await Model.query()
        .select("sc.id")
        .where(where)
        .where({ "sc.asset_closed": 1 })
    ).length;
    const total_pending = (
      await Model.query()
        .select("sc.id")
        .where(where)
        .where({ "sc.asset_closed": 0 })
    ).length;
    const total_not_published = (
      await Model.query()
        .select("sc.id")
        .where(where)
        .where({ "sc.asset_status": 0 })
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
      "sc.*",
      "s.school_postal_address",
      "s.udise_code",
      "s.school_name",
      "mac.asset_category_name",
      "masc.asset_sub_category_name",
    ];

    var Query = Model.query()
      .join("master_schools as s", "s.id", "=", "sc.school_id")
      .join(
        "master_asset_categories as mac",
        "mac.id",
        "=",
        "sc.asset_category_id"
      )
      .join(
        "master_asset_sub_categories as masc",
        "masc.id",
        "=",
        "sc.asset_sub_category_id"
      );

    if (request.id > 0) {
      var where = { ...where, ...{ "sc.id": request.id } };
    }

    const count = (await Query.select("sc.id").where(where)).length;
    const object = await Query.select(select).where(where);
    res.status(200).json({ status: true, data: object, count: count });
  } catch (e) {
    return Exception.handle(e,res,req,'');
  }
};

exports.volunteerList = async (req, res) => {
  try {
    const request = req.body;
    var where = {};
    const select = [
      "sc.asset_closed",
      "cv.rate",
      "u.id as volunteer_id",
      "cv.application_status",
      "cv.total_received_deliver_qty",
      "cv.accepted_by_school",
      "cv.volunteer_id",
      "cv.school_assets_post_id",
      "cv.accepted_by_school",
      "cv.meeting_date",
      "cv.decline_reason",
      "cv.volunteer_status",
      "cv.accepted_by_school",
      "cv.contribution_by_volunteer",
      "u.volunteer_name",
      "u.volunteer_mobile",
      "u.volunteer_email",
      "ms.state_name",
      "md.district_name",
    ];
    var Query = ContributionVolunteers.query()
      .join(
        "school_assets_posts as sc",
        "sc.id",
        "=",
        "cv.school_assets_post_id"
      )
      .join("volunteers as u", "u.id", "=", "cv.volunteer_id")
      .join("master_states as ms", "ms.id", "=", "sc.asset_state_id")
      .join("master_districts as md", "md.id", "=", "sc.asset_district_id");
    if (request.id > 0) {
      var where = { ...where, ...{ "cv.school_assets_post_id": request.id } };
    }
    const count = (await Query.select("cv.id").where(where)).length;
    const object = await Query.select(select).where(where);
    res.status(200).json({ status: true, data: object, count: count });
  } catch (e) {
    return Exception.handle(e,res,req,'');
  }
};

exports.schoolDetail = async (req, res) => {
  try {
    const request = req.body;
    var where = {};
    if (request.id > 0) {
      var where = { ...where, ...{ id: request.id } };
    }
    const select = [
      "udise_code",
      "school_name",
      "school_email",
      "school_mobile",
      "school_address",
      "school_state_name",
      "school_district_name",
      "school_block_name",
    ];
    const object = await SchoolModel.query().select(select).where(where);
    res.status(200).json({ status: true, data: object });
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

exports.findVolunteer = async (req, res) => {
  try {
    const { id } = req.body;
    const object = await ContributionVolunteers.findOne({ id });
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

exports.contributionDetail = async (req, res) => {
  try {
    const request = req.body;
    var where = {};
    const select = [
      "vsc.asset_category_name",
      "vsc.asset_sub_category_name",
      "vsc.asset_quantity",
      "vsc.asset_expected_date",
      "vsc.asset_last_application_date",
      "vsc.udise_code",
      "vsc.school_name",
      "vsc.state_name",
      "vsc.district_name",
    ];

    var Query = ContributionView.query();

    if (request.id > 0) {
      var where = { ...where, ...{ "vsc.id": request.id } };
    }

    const count = (await Query.select("vsc.id").where(where)).length;
    const object = await Query.select(select).where(where);
    res.status(200).json({ status: true, data: object, count: count });
  } catch (e) {
    return Exception.handle(e,res,req,'');
  }
};

exports.inviteAccept = async (req, res) => {
  try {
    const request = req.body;
    const result = await ContributionVolunteers.findOne({ id: request.rowId });
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
        var data = { ...data, location: request.details };
      }

      if (request.details !== undefined) {
        var data = {
          ...data,
          meeting_date: Helper.dateYMD(request.meetingDate),
        };
      }

      const object = await ContributionVolunteers.update(data, request.rowId);
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
    const result = await ContributionVolunteers.findOne({ id: request.rowId });
    var data = {};
    if (result != null) {
      if (request.status !== undefined) {
        var data = { ...data, volunteer_status: request.status };
      }
      if (request.approve_qty !== undefined) {
        var data = { ...data, accepted_by_school: request.approve_qty };
      }
      const object = await ContributionVolunteers.update(data, request.rowId);
      const message = object
        ? Message.confirmed("Volunteer")
        : Message.default();
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

exports.AddDelivery = async (req, res) => {
  try {
    const request = req.body;
    const result = await ContributionVolunteers.findOne({ id: request.rowId });
    var data = {};
    var received_data = {};
    if (result != null) {
      if (request.volunteer_id !== undefined) {
        var received_data = {
          ...received_data,
          volunteer_id: request.volunteer_id,
        };
      }
      if (request.contribution_id !== undefined) {
        var received_data = {
          ...received_data,
          contribution_id: request.contribution_id,
        };
      }
      if (request.recived_qty !== undefined) {
        var received_data = {
          ...received_data,
          received_qty: request.recived_qty,
        };
      }
      if (request.receiptDate !== undefined) {
        var received_data = {
          ...received_data,
          received_date: Helper.dateYMD(request.receiptDate.trim()),
        };
      }
      const result = await QuantityReceived.create(received_data);
      if (result) {
        if (request.receiptDate !== undefined) {
          var where = {};
          const select = ["qrc.id", "qrc.received_qty"];
          var Query = QuantityReceived.query();
          if (request.volunteer_id > 0) {
            var where = {
              ...where,
              ...{
                "qrc.contribution_id": request.contribution_id,
                volunteer_id: request.volunteer_id,
              },
            };
          }
          var QtyReceived = await Query.select(select).where(where);
          var total_recived = 0;
          QtyReceived.forEach((val) => {
            total_recived = total_recived + val.received_qty;
          });
          if (+request.approve_by_school === +total_recived) {
            var data = { ...data, application_status: 1 };
            const result = await Volunteers.findOne({
              id: request.volunteer_id,
            });
            if (result != null) {
              var participation_count = result.total_participation + 1;
              const badge_id = Helper.badge(result.total_participation);
              await Volunteers.update(
                {
                  total_participation: participation_count,
                  badge_id: badge_id,
                },
                request.volunteer_id
              );
            }
          }
          var data = {
            ...data,
            completed_delivery_date: Helper.dateYMD(request.receiptDate),
            total_received_deliver_qty: total_recived,
          };
          var object = await ContributionVolunteers.update(data, request.rowId);
        }
      }

      const message = object ? Message.deliver("Quantity") : Message.default();
      res
        .status(200)
        .json({ status: true, message: message, data: QtyReceived });
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
        (select count(cv.id) as cnt from contribution_volunteers as cv where cv.school_assets_post_id = sap.id and cv.volunteer_status != 'WithdrawAppliaction') as volunteer_count,
        (SELECT COUNT(contribution_volunteers.id) FROM contribution_volunteers WHERE contribution_volunteers.school_assets_post_id = sap.id AND contribution_volunteers.volunteer_status = 'Invited') as invite_vol_count,
        (SELECT COUNT(contribution_volunteers.id) FROM contribution_volunteers WHERE contribution_volunteers.school_assets_post_id = sap.id AND contribution_volunteers.volunteer_status = 'Reschedule Invited For Meeting') as reschedule_invite_vol_count,
        (SELECT COUNT(contribution_volunteers.id) FROM contribution_volunteers WHERE contribution_volunteers.school_assets_post_id = sap.id AND contribution_volunteers.volunteer_status = 'Pending') as pending_vol_count,
        (SELECT COUNT(contribution_volunteers.id) FROM contribution_volunteers WHERE contribution_volunteers.school_assets_post_id = sap.id AND contribution_volunteers.volunteer_status = 'Approved') as approve_vol_count,
        (SELECT COUNT(contribution_volunteers.id) FROM contribution_volunteers WHERE contribution_volunteers.school_assets_post_id = sap.id AND (contribution_volunteers.volunteer_status = 'Decline' OR contribution_volunteers.volunteer_status = 'Decline For Confirmed')) as rejected_vol_count
        from school_assets_posts sap where sap.id=${request.contribution_id}`);
    //const volunteerStatus =   await PG.query(`select volunteer_status,accepted_by_school, total_received_deliver_qty from contribution_volunteers where school_assets_post_id =${request.contribution_id}`);
    const volunteerStatus = await ContributionVolunteers.query()
      .select([
        "cv.volunteer_status",
        "cv.accepted_by_school",
        "cv.total_received_deliver_qty",
      ])
      .where({ id: request.contribution_id });
    res.status(200).json({
      status: true,
      data: object.rows[0],
      volunteerStatus: volunteerStatus[0],
    });
  } catch (e) {
    return Exception.handle(e,res,req,'');
  }
};

exports.contributionImage = async (req, res) => {
  try {
    const request = req.body;
    var where = {};
    if (request.id > 0) {
      var where = { ...where, ...{ school_asstes_post_id: request.id } };
    }
    const object = await AssetTimeLine.query()
      .select(["contribution_image", "asset_flag"])
      .where(where);
    const assetCloseStatus = await Model.findOne({ id: request.id });
    let images = {};

    if (object !== null) {
      const filePath = path.join(
        process.cwd(),
        `public/uploads/school/assets/${request.id}/`
      );
      object.map((item) => {
        images = {
          ...images,
          [item.asset_flag]: `data:image/png;base64,${CHelper.base64Encode(
            filePath + item.contribution_image
          )}`,
        };
      });
    }
    res.status(200).json({
      status: true,
      data: images,
      assetCloseStatus: assetCloseStatus.asset_closed,
    });
  } catch (e) {
    return Exception.handle(e,res,req,'');
  }
};

exports.uploadImages = (req, res) => {
  try {
    req.singleFile = "profile";
    req.pathname = "school/assets/";
    req.flag = "school";
    const parseToken = Helper.decodeToken(req);
    FileUploader(req, res, (response) => {
      if (response.status) {
        const request = response.body;
        AssetTimeLine.findOne({
          school_asstes_post_id: request.contribution_id,
          asset_flag: +request.flag + 1,
        }).then((result) => {
          if (result !== undefined) {
            const filePath = path.join(
              process.cwd(),
              `public/uploads/school/assets/${request.contribution_id}/` +
                result.contribution_image
            );
            fs.exists(filePath, (exists) => {
              if (exists) {
                fs.unlink(filePath, (err) => {
                  if (err) {
                    return Exception.handle(e,res,req,'');
                  }
                });
              }
              AssetTimeLine.update(
                { contribution_image: response.filename },
                result.id
              )
                .then((result) => {
                  return res.status(200).json({
                    status: true,
                    message: Message.updated("Assets Image"),
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
              school_asstes_post_id: request.contribution_id,
              contribution_image: response.filename,
              asset_flag: +request.flag + 1,
              created_by: parseToken.user.id,
            };
            AssetTimeLine.create(object).then((result) => {
              if (result !== null) {
                return res.status(200).json({
                  status: true,
                  message: Message.uploaded("Assets Image"),
                });
              }
              return res
                .status(200)
                .json({ status: false, message: Message.default() });
            });
          }
        });
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

exports.uploadOfflineImages = (req, res) => {
  try {
    req.singleFile = "profile";
    req.pathname = "school/assets/";
    req.flag = "school";
    const parseToken = Helper.decodeToken(req);
    FileUploader(req, res, (response) => {
      if (response.status) {
        const request = response.body;
        AssetTimeLine.findOne({
          school_asstes_post_id: request.contribution_id,
          asset_flag: +request.flag + 1,
        }).then((result) => {
          if (result !== undefined) {
            const filePath = path.join(
              process.cwd(),
              `public/uploads/school/assets/` + result.contribution_image
            );
            fs.exists(filePath, (exists) => {
              if (exists) {
                fs.unlink(filePath, (err) => {
                  if (err) {
                    return Exception.handle(e,res,req,'');
                  }
                });
              }
              AssetTimeLine.update(
                { contribution_image: response.filename },
                result.id
              )
                .then((result) => {
                  return res.status(200).json({
                    status: true,
                    message: Message.updated("Assets Image"),
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
              school_asstes_post_id: request.contribution_id,
              contribution_image: response.filename,
              asset_flag: +request.flag + 1,
              created_by: parseToken.user.id,
            };
            AssetTimeLine.create(object).then((result) => {
              if (result !== null) {
                return res.status(200).json({
                  status: true,
                  message: Message.uploaded("Assets Image"),
                });
              }
              return res
                .status(200)
                .json({ status: false, message: Message.default() });
            });
          }
        });
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
exports.closeContribution = async (req, res) => {
  try {
    const request = req.body;
    const result = await Model.findOne({ id: request.cid });
    if (
      request.impected_student !== undefined &&
      request.impected_student !== ""
    ) {
      const TimelineImage = await AssetTimeLine.find({
        school_asstes_post_id: request.cid,
      });
      var data = {};
      if (+Object.keys(TimelineImage).length === 3) {
        if (result != null) {
          if (request.reason_closer !== undefined) {
            var data = {
              ...data,
              asset_close_reason: request.reason_closer,
              asset_closed: 1,
              application_status: 1,
            };
          }
          if (request.impected_student !== undefined) {
            var data = { ...data, impected_students: request.impected_student };
          }
          const object = await Model.update(data, request.cid);
          if (object) {
            const select = [
              "cv.volunteer_id",
              "cv.application_status",
              "cv.total_received_deliver_qty",
            ];
            var Query = ContributionVolunteers.query();
            var volunteer_ids = await Query.select(select).where({
              school_assets_post_id: request.cid,
            });
            var vid = [];
            volunteer_ids.forEach((val) => {
              if (val.application_status !== 1) {
                run(val.volunteer_id)
                  .then((res) => {})
                  .catch((err) => console.log(err.message, err.stack));
              }
            });
            async function run(volunteer_id) {
              const Volunteer = await Volunteers.findOne({ id: volunteer_id });
              var participation_count = Volunteer.total_participation + 1;
              const badge_id = Helper.badge(participation_count);
              await Volunteers.query().where({ id: Volunteer.id }).update({
                total_participation: participation_count,
                badge_id: badge_id,
              });
              return Volunteer;
            }
            await ContributionVolunteers.query()
              .where({ school_assets_post_id: request.cid })
              .update({ application_status: 1 });
            return res
              .status(200)
              .json({ status: true, message: Message.closed("Contribution") });
          }
          return res
            .status(200)
            .json({ status: false, message: Message.default() });
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
            asset_close_reason: request.reason_closer,
            asset_closed: 1,
            application_status: 1,
          };
        }
        const object = await Model.update(data, request.aid);
        const message = object
          ? Message.closed("Contribution")
          : Message.default();
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

exports.ratingToVolunteerBySchool = async (req, res) => {
  try {
    const request = req.body;
    const data = {
      suggestion: request.comment,
      rate: request.rate,
      contribution_id: request.contribution_id,
      volunteer_id: request.volunteer_id,
      school_id: request.schoolId,
      module: request.module,
    };
    const result = await VolunteerRating.create(data);
    if (result) {
      await ContributionVolunteers.query()
        .where({
          school_assets_post_id: request.contribution_id,
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
      contribution_id: request.contribution_id,
      volunteer_id: request.volunteer_id,
      school_id: request.schoolId,
      module: request.module,
    };
    const result = await SchoolRating.create(data);
    if (result) {
      //const object = await Model.update(rate, request.id);
      await ContributionVolunteers.query()
        .where({
          school_assets_post_id: request.contribution_id,
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
