
const express = require('express');
const routers = express.Router();
const Model = require('../models');
const mysql = require('../../config/database/mysql');

routers.get('/countries', async (req, res) => {
    try {
        mysql.query('select * from countries order by country_name', function (err, result) {
            if (err) {
                res.status(200).json({ "err": err });
            } else {
                //return res.status(200).json(result);
                var data = [];
                result.forEach(row => {
                    data = [...data, ...[{ 'id': row.id, 'country_name': row.country_name, 'country_code': row.country_code }]];
                });
                const response = Model.Country.create(data);
                if (response != null) {
                    res.status(200).json('done');
                }
            }
        });
    } catch (e) {
        res.status(200).json(e);
    }
});

routers.get('/states', async (req, res) => {
    try {
        mysql.query('select * from states order by name', function (err, result) {
            if (err) {
                res.status(200).json({ "err": err });
            } else {
                //return res.status(200).json(result);
                var data = [];
                result.forEach(row => {
                    data = [...data, ...[{ 'id': row.id, 'state_name': row.name, 'state_status': row.status, 'state_order': row.rank }]];
                });
                const response = Model.State.create(data);
                if (response != null) {
                    res.status(200).json('done');
                }
            }
        });
    } catch (e) {
        res.status(200).json(e);
    }
});

routers.get('/districts', async (req, res) => {
    try {
        mysql.query('select * from districts order by district_name', function (err, result) {
            if (err) {
                res.status(200).json({ "err": err });
            } else {
                var data = [];
                result.forEach((row, i) => {
                    data = [...data, ...[{ 'id': row.id, 'district_state_id': row.state_id, 'district_name': row.district_name, 'district_status': row.status, 'district_order': ++i }]];
                });
                const response = Model.District.create(data);
                if (response != null) {
                    res.status(200).json('done');
                }
            }
        });
    } catch (e) {
        res.status(200).json(e);
    }
});

routers.get('/blocks', async (req, res) => {
    try {
        mysql.query('select * from block_master order by block_name', function (err, result) {
            if (err) {
                res.status(200).json({ "err": err });
            } else {
                var data = [];
                result.forEach((row, i) => {
                    data = [...data, ...[{ 'id': row.udise_block_code, 'block_state_id': row.udise_state_code, 'block_district_id': row.udise_dist_code, 'block_name': row.block_name, 'block_status': 1, 'block_order': ++i }]];
                });
                const response = Model.Block.create(data);
                if (response != null) {
                    res.status(200).json('done');
                }
            }
        });
    } catch (e) {
        res.status(200).json(e);
    }
});

routers.get('/roles', async (req, res) => {
    try {
        mysql.query('select * from roles order by id', function (err, result) {
            if (err) {
                res.status(200).json({ "err": err });
            } else {
                var data = [];
                result.forEach((row, i) => {
                    const role = JSON.parse(row.name);
                    data = [...data, ...[{ 'id': row.id, 'role_name': role.default, 'role_status': row.status, 'role_order': ++i }]];
                });
                //return res.status(200).json(data);
                const response = Model.Role.create(data);
                if (response != null) {
                    res.status(200).json('done');
                }
            }
        });
    } catch (e) {
        res.status(200).json(e);
    }
});
routers.get('/school-categories', async (req, res) => {
    try {
        mysql.query('select * from category_master order by id', function (err, result) {
            if (err) {
                res.status(200).json({ "err": err });
            } else {
                var data = [];
                result.forEach((row, i) => {
                    data = [...data, ...[{ 'id': row.id, 'school_category_name': row.sch_category_type, 'school_category_order': ++i }]];
                });
                //return res.status(200).json(data);
                const response = Model.SchoolCategory.create(data);
                if (response != null) {
                    res.status(200).json('done');
                }
            }
        });
    } catch (e) {
        res.status(200).json(e);
    }
});

routers.get('/activity-categories', async (req, res) => {
    try {
        mysql.query(`select * from type_master where acronym = 'INTEREST_AREAS_MAIN' order by id`, function (err, result) {
            if (err) {
                res.status(200).json({ "err": err });
            } else {
                var ids = [];
                var data = [];

                result.forEach((row, i) => {
                    ids = [...ids, ...[row.id]];
                    data = [...data, ...[{ 'id': row.id, 'activity_category_name': row.name, 'activity_category_status': row.status, 'activity_category_order': ++i }]];
                });

                if (result != null) {
                    mysql.query(`select * from type_master where parent_id in(${ids})  order by id`, function (err, sresult) {
                        var sdata = [];
                        sresult.forEach((rows, j) => {
                            sdata = [...sdata, ...[{ 'id': rows.id, 'activity_category_id': rows.parent_id, 'activity_sub_category_name': rows.name, 'activity_sub_category_status': rows.status, 'activity_sub_category_order': ++j }]];
                        });

                        const response = Model.ActivityCategory.create(data);
                        if (response != null) {
                            Model.ActivitySubCategory.create(sdata);
                            res.status(200).json('done');
                        }
                    });
                }
            }
        });
    } catch (e) {
        res.status(200).json(e);
    }
});

routers.get('/master-school-managements', async (req, res) => {
    try {
        mysql.query('select * from center_management_master order by sch_mgmt_type', function (err, result) {
            if (err) {
                res.status(200).json({ "err": err });
            } else {
                //return res.status(200).json(result);
                var data = [];
                result.forEach(row => {
                    data = [...data, ...[{ 'id': row.sch_mgmt_id, 'school_management_name': row.sch_mgmt_type, 'school_management_status': 1, 'school_management_order': 0 }]];
                });
                const response = Model.SchoolManagement.create(data);
                if (response != null) {
                    res.status(200).json('done');
                }
            }
        });
    } catch (e) {
        res.status(200).json(e);
    }
});
routers.get('/master-school-types', async (req, res) => {
    try {
        mysql.query('select * from school_type order by school_type', function (err, result) {
            if (err) {
                res.status(200).json({ "err": err });
            } else {
                //return res.status(200).json(result);
                var data = [];
                result.forEach(row => {
                    data = [...data, ...[{ 'id': row.school_type, 'school_type_name': row.school_type_desc }]];
                });
                const response = Model.SchoolType.create(data);
                if (response != null) {
                    res.status(200).json('done');
                }
            }
        });
    } catch (e) {
        res.status(200).json(e);
    }
});

routers.get('/asset-categories', async (req, res) => {
    try {
        mysql.query(`select * from type_master where acronym = 'CONTRIBUTION_CATEGORY' order by id`, function (err, result) {
            if (err) {
                res.status(200).json({ "err": err });
            } else {
                var ids = [];
                var data = [];

                result.forEach((row, i) => {
                    ids = [...ids, ...[row.id]];
                    data = [...data, ...[{ 'id': row.id, 'asset_category_name': row.name, 'asset_category_status': row.status, 'asset_category_order': ++i }]];
                });

                if (result != null) {
                    mysql.query(`select * from type_master where parent_id in(${ids})  order by id`, function (err, sresult) {
                        var sdata = [];
                        sresult.forEach((rows, j) => {
                            sdata = [...sdata, ...[{ 'id': rows.id, 'asset_category_id': rows.parent_id, 'asset_sub_category_name': rows.name, 'asset_sub_category_status': rows.status, 'asset_sub_category_order': ++j }]];
                        });

                        const response = Model.AssetCategory.create(data);
                        if (response != null) {
                            Model.AssetSubCategory.create(sdata);
                            res.status(200).json('done');
                        }
                    });
                }
            }
        });
    } catch (e) {
        res.status(200).json(e);
    }
});

function insertSchoolData(i, j) {
    const limit = 2000;
    const schools = 1647935;
    if (schools >= j) {
        const select = `id,udise_number,name,school_image,email,mobile,alternate_email_id,school_type,address,postal_code,postal_address,
        school_category,school_management_center,state_id,state_name,district_id,district_name,school_location_id,block_name,class_from,
        class_to,location_type,ori_state_id,ori_district_id,reg_allowed`;
        mysql.query(`select ${select} from schools limit ${j},${limit}`, function (err, result) {
            if (err) {
                return false;
            } else {
                var data = [];
                result.forEach(row => {
                    data = [...data, ...[{
                        'id': row.id,
                        'udise_code': row.udise_number,
                        'school_name': row.name,
                        'school_profile_image': row.school_image,
                        'school_email': row.email,
                        'school_mobile': row.mobile,
                        'school_type': row.school_type,
                        'school_address': row.address,
                        'school_postal_code': row.postal_code,
                        'school_postal_address': row.postal_address,
                        'school_category': row.school_category,
                        'school_management_center': row.school_management_center,
                        'school_state_id': row.state_id,
                        'school_state_name': row.state_name,
                        'school_district_id': row.district_id,
                        'school_district_name': row.district_name,
                        'school_block_id': row.school_location_id,
                        'school_block_name': row.block_name,
                        'school_class_from': row.class_from,
                        'school_class_to': row.class_to,
                        'school_location_type': row.location_type,
                        'school_ori_state_id': row.ori_state_id,
                        'school_ori_district_id': row.ori_district_id,
                        'reg_allowed': row.reg_allowed,
                        'special_flag': 0,
                        'school_onboard': 0
                    }]];
                });
                if (Model.School.create(data)) {
                    i++;
                    const j = limit * i;
                    if (j <= schools) {
                        insertSchoolData(i, j);
                    }
                }
            }
        });
    } else {
        callback(true);
    }
}

routers.get('/schools', (req, res) => {
    try {
        insertSchoolData(0, 0, res, (response) => {
            if (response) {
                return res.status(200).json('Task Done');
            }
        });
    } catch (e) {
        res.status(200).json(e);
    }
});

function estatus(value) {
    if (value == 'None')
        return 0;
    if (value == 'Employed')
        return 1;
    if (value == 'Unemployed')
        return 2;
}

function pancard(row) {
    if (row.volunteer_type == 2)
        return row.ngo_pan;
    if (row.volunteer_type == 3)
        return row.organization_pan;
    if (row.volunteer_type == 1 || row.role_id == 4)
        return row.pancard_desc;
}

function insertVolunteerData(i, j) {
    try {
        //${j},${limit}
        const limit = 2000;
        const volunteers = 531249;
        if (volunteers >= j) {
            const select = `*`
            mysql.query(`select ${select} from users where role_id !=3 order by id limit ${j},${limit}`, function (err, result) {
                if (err) {
                    console.log(err);
                    return false;
                } else {
                    var data = [];
                    //var details =[];
                    result.forEach(row => {
                        data = [...data, ...[{
                            'id': row.id,
                            'volunteer_name': row.name,
                            'volunteer_mobile': row.mobile_no,
                            'volunteer_email': row.email_id,
                            'volunteer_role_id': (row.role_id != null) ? row.role_id : 0,
                            'volunteer_type_id': (row.volunteer_type != null) ? row.volunteer_type : 0,
                            'volunteer_state_id': (row.state_id != null) ? row.state_id : 0,
                            'volunteer_district_id': (row.district_id != null) ? row.district_id : 0,
                            'volunteer_country_id': (row.country_code_id !== null || row.country_code_id !== '') ? row.country_code_id : 91,
                            'volunteer_address': row.address,
                            'volunteer_postal_code': row.postal_code,
                            'volunteer_qualification_id': (row.qualification !== null || row.qualification !== '' || row.qualification == undefined) ? row.qualification : 0,
                            'volunteer_profile_image': row.image,
                            'volunteer_gender_id': (row.gender == 'Female') ? 1 : (row.gender == 'Male') ? 1 : 0,
                            'volunteer_status': (row.status != null) ? row.status : 0,
                            'volunteer_experience': (row.has_volunteer_experience != null) ? row.has_volunteer_experience : 0,
                            'volunteer_rating': (row.rating != null) ? row.rating : 0,
                            'darapan_id': row.darapan_id,
                            'pancard_number': pancard(row),
                            'created_at': row.created_at,
                            'updated_at': row.modified_at
                        }]];

                    });

                    //Model.User.create(data);
                    //if(Model.User.create(data)){
                    Model.Volunteers.create(data)
                    i++;
                    const j = limit * i;
                    if (j <= volunteers) {
                        insertVolunteerData(i, j);
                    }

                    //}
                }
            });
        }
    } catch (e) {
        res.status(200).json(e);
    }
}

routers.get('/volunteers', async (req, res) => {
    try {
        insertVolunteerData(0, 0);
    } catch (e) {
        res.status(200).json(e);
    }
});

routers.get('/admin-users', async (req, res) => {
    try {
        const created_by = req.auth.user.id;
        mysql.query(`select admin_users.*, ms.state_name, md.district_name from admin_users 
            join master_states ms on ms.id = admin_users.user_state_id 
            join master_districts md on md.id = admin_users.user_district_id
            order by admin_users.id`, function (err, result) {
            if (err) {
                res.status(200).json({ "err": err });
            } else {
                var data = [];
                result.forEach(row => {
                    data = [...data, ...[{
                        'id': row.id,
                        'user_name': row.first_name + ' ' + row.last_name,
                        'user_email': row.email_id,
                        'user_mobile': row.mobile_no,
                        'user_password': row.password,
                        'user_role_id': row.role_id,
                        'user_status': (row.status) ? row.status : 0,
                        'created_at': row.created_at,
                        'updated_at': row.updated_at,
                        created_by,
                        'user_state_id': (row.state_id) ? row.state_id : 0,
                        'user_district_id': (row.district_id) ? row.district_id : 0,
                        'fp_token': ''
                    }]];
                });
                console.log(data);
                const response = Model.AdminUsers.create(data);
                if (response != null) {
                    res.status(200).json('done');
                }
            }
        });
    } catch (e) {
        res.status(200).json(e);
    }
});
function gender(value) {
    if (value == 'Male')
        return 1;
    if (value == 'Female')
        return 2;
    if (value == 'Transgender')
        return 3;
    if (value == 'Any' || 'Other')
        return 4;
}

function insertActivitiesData(i, j) {
    try {
        const limit = 2000;
        const records = 49314;
        if (records >= j) {
            //mysql.query(`select * from activities order by id  limit ${j},${limit}`, function (err, result) {
            mysql.query(`select * from activities where type_master_id != 'NULL' order by id  limit ${j},${limit}`, function (err, result) {
                if (err) {
                    res.status(200).json({ "err": err });
                } else {
                    var data = [];
                    result.forEach((row, i) => {
                        data = [...data, ...[{
                            'id': row.id,
                            'school_id': row.school_id,
                            'activity_state_id': row.activity_state_id,
                            'activity_district_id': row.activity_district_id,
                            'activity_category_id': row.type_master_id,
                            'activity_sub_category_id': (row.name != '') ? parseInt(row.name) : 0,
                            'specialization_id': (row.specialization_id) ? row.specialization_id : 0,
                            'class_category_id': row.activity_class,
                            'gender_id': gender(row.gender),
                            'activity_details': row.detail,
                            'activity_frequency': row.activity_frequency,
                            'activity_duration': (row.duration) ? parseInt(row.duration) : 0,
                            'impected_students': row.student_count,
                            'activity_publish': row.publish,
                            'activity_status': row.status,
                            'activity_closed': row.is_closed,
                            'activity_close_reason': row.reason_closer,
                            'admin_approval': row.admin_status,
                            'admin_remark': row.admin_modify_remarks,
                            'activity_last_reciving_date': row.last_application_date,
                            'activity_tentative_start_date': row.tentative_start_date,
                            'activity_actual_start_date': row.start_date,
                            'created_at': row.created_at,
                            'updated_at': row.modified_at
                        }]];
                    });
                    console.log(data)
                    Model.Activities.create(data)
                    i++;
                    const j = limit * i;
                    if (j <= records) {
                        insertActivitiesData(i, j);
                    }

                }
            });
        }
    } catch (e) {
        res.status(200).json(e);
    }
}

routers.get('/activities', async (req, res) => {
    try {
        insertActivitiesData(0, 0);
    } catch (e) {
        res.status(200).json(e);
    }
});

function insertActivitiesVolunteersData(i, j) {
    try {
        const limit = 2000;
        const records = 11692;
        if (records >= j) {
            mysql.query(`select * from activity_volunteers  order by id  limit ${j},${limit}`, function (err, result) {
                //mysql.query(`select * from activity_volunteers order by id limit 251`, function (err, result) {
                if (err) {
                    // res.status(200).json({"err":err});
                    return false;
                } else {
                    var data = [];
                    result.forEach((row, i) => {
                        data = [...data, ...[{
                            'id': row.id,
                            'activity_id': row.activity_id,
                            'volunteer_id': row.volunteer_id,
                            'volunteer_status': row.status,
                            'interview_mode': row.interview_mode,
                            'decline_reason': row.decline_reason,
                            'meeting_details': row.meeting_details,
                            'meeting_date': row.meeting_date,
                            'meeting_start_date': row.meeting_start_date,
                            'meeting_end_date': row.meeting_end_date,
                            'meeting_end_time': row.meeting_end_time,
                            'created_at': row.created_at,
                            'created_by': row.created_by,
                            'modified_at': row.modified_at,
                            'modified_by': row.modified_by,
                            'location': row.location,
                            'completion_status': row.completion_status,
                            'withdrawal_reason': row.withdrawal_reason,
                            'interview_date_acceptance': row.interview_date_acceptance,
                            'activity_meeting_time': row.activity_meeting_time,
                            'meeting_time': row.meeting_time,
                            'block_profile': row.block_profile,
                            'interview_procedure': row.interview_procedure
                        }]];
                    });
                    Model.ActivityContributions.create(data);
                    //console.log(j);
                    i++;
                    const j = limit * i;
                    if (j <= records) {
                        console.log(j);
                        insertActivitiesVolunteersData(i, j);
                    }
                    //}
                }
            });
        }
    } catch (e) {
        res.status(200).json(e);
    }
}

routers.get('/activities-volunteers', async (req, res) => {
    try {
        insertActivitiesVolunteersData(0, 0);
    } catch (e) {
        res.status(200).json(e);
    }
});
function insertActivitiesPreferenceData(i, j) {
    try {
        const limit = 2000;
        const records = 17832;
        if (records >= j) {
            mysql.query(`select * from activity_preferences order by id  limit ${j},${limit}`, function (err, result) {
                // mysql.query(`select * from activity_preferences order by id limit 100`, function (err, result) {
                if (err) {
                    // res.status(200).json({"err":err});
                    return false;
                } else {
                    var data = [];
                    result.forEach((row, i) => {
                        data = [...data, ...[{
                            'id': row.id,
                            'type': row.type,
                            'user_id': row.user_id,
                            'state_id': row.state_id,
                            'district_id': row.district_id,
                            'activity_type_master_id': row.activity_type_master_id,
                            'contribution_type_master_id': row.contribution_type_master_id,
                            'created_at': row.created_at
                        }]];
                    });
                    if (Model.PreferenceVolunteers.create(data)) {
                        i++;
                        const j = limit * i;
                        if (j <= records) {
                            insertActivitiesPreferenceData(i, j);
                        }
                    }
                }
            });
        }
    } catch (e) {
        res.status(200).json(e);
    }
}

routers.get('/preference-volunteers', async (req, res) => {
    try {
        insertActivitiesPreferenceData(0, 0);
    } catch (e) {
        res.status(200).json(e);
    }
});

routers.get('/activity-timeline', async (req, res) => {
    try {
        mysql.query('select * from activity_timelines order by id', function (err, result) {
            if (err) {
                res.status(200).json({ "err": err });
            } else {
                //return res.status(200).json(result);
                var data = [];
                result.forEach(row => {
                    data = [...data, ...[{ 'id': row.id, 'activity_id': row.activity_id, 'activity_image': row.image, 'activity_description': row.description, 'created_at': row.created_at, 'modified_at': row.modified_at, 'created_by': row.created_by }]];
                });
                const response = Model.ActivityTimeline.create(data);
                if (response != null) {
                    res.status(200).json('done');
                }
            }
        });
    } catch (e) {
        res.status(200).json(e);
    }
});

function insertContributionTimeLineData(i, j) {
    try {
        const limit = 2000;
        const records = 56286;
        if (records >= j) {
            mysql.query(`select * from contribution_timelines order by id  limit ${j},${limit}`, function (err, result) {
                if (err) {
                    // res.status(200).json({"err":err});
                    return false;
                } else {
                    var data = [];
                    result.forEach((row, i) => {
                        data = [...data, ...[{ 'id': row.id, 'contribution_id': row.contribution_id, 'contribution_image': row.image, 'created_at': row.created_at, 'modified_at': row.modified_at, 'created_by': row.created_by }]];
                    });
                    if (Model.ContributionTimeline.create(data)) {
                        i++;
                        const j = limit * i;
                        if (j <= records) {
                            insertContributionTimeLineData(i, j);
                        }
                    }
                }
            });
        }
    } catch (e) {
        res.status(200).json(e);
    }
}

routers.get('/contribution-timeline', async (req, res) => {
    try {
        insertContributionTimeLineData(0, 0);
    } catch (e) {
        res.status(200).json(e);
    }
})

function insertSchoolContributionData(i, j) {
    try {
        const limit = 2000;
        const records = 40737;
        if (records >= j) {
            mysql.query(`select * from school_contributions where status !=0 order by id  limit ${j},${limit}`, function (err, result) {
                // mysql.query(`select * from school_contributions order by id  limit 100`, function (err, result) {
                if (err) {
                    result.status(200).json({ "err": err });
                } else {
                    var data = [];
                    result.forEach((row, i) => {
                        data = [...data, ...[{
                            'id': row.id,
                            'school_id': row.school_id,
                            'asset_category_id': row.sub_category,
                            'asset_sub_category_id': row.type_master_id,
                            'asset_quantity': (row.asset_qty) ? row.asset_qty : 0,
                            'asset_details': row.details,
                            'asset_status': row.status,
                            'asset_expected_date': row.expected_date,
                            'asset_last_application_date': row.last_application_date,
                            'asset_closed': row.is_closed,
                            'asset_close_reason': row.reason_closer,
                            'impected_students': row.student_count,
                            'maintenance_required': row.maintenance_required,
                            'asset_state_id': row.contribution_state_id,
                            'asset_district_id': row.contribution_district_id,
                            'created_at': row.created_at,
                            'updated_at': row.modify_at,
                        }]];
                    });
                    Model.SchoolContributions.create(data);
                    i++;
                    const j = limit * i;
                    if (j <= records) {
                        console.log(j);
                        insertSchoolContributionData(i, j);
                    }
                }
            });
        }
    } catch (e) {
        res.status(200).json(e);
    }
}

routers.get('/school-contribution', async (req, res) => {
    try {
        insertSchoolContributionData(0, 0);
    } catch (e) {
        res.status(200).json(e);
    }
});

function insertContributionVolunteersData(i, j) {
    try {
        const limit = 2000;
        const records = 29254;
        if (records >= j) {
            mysql.query(`select * from contribution_volunteers order by id  limit ${j},${limit}`, function (err, result) {
                // mysql.query(`select * from contribution_volunteers order by id`, function (err, result) {
                if (err) {
                    res.status(200).json({ "err": err });
                } else {
                    var data = [];
                    result.forEach((row, i) => {
                        data = [...data, ...[{
                            'id': row.id,
                            'contribution_id': row.contribution_id,
                            'volunteer_id': row.volunteer_id,
                            'status': row.status,
                            'asset_qty': row.asset_qty,
                            'contribution_by_volunteer': row.contribution_by_volunteer,
                            'accepted_by_school': row.accepted_by_school,
                            'collection_status': row.collection_status,
                            'collection_status_image': row.collection_status_image,
                            'meeting_date': row.meeting_date,
                            'meeting_start_date': row.meeting_start_date,
                            'meeting_end_date': row.meeting_end_date,
                            'meeting_start_time': row.meeting_start_time,
                            'location': row.location,
                            'interview_mode': row.interview_mode,
                            'decline_reason': row.decline_reason,
                            'decline_reason_other': row.decline_reason_other,
                            'created_at': row.created_at,
                            'created_by': row.created_by,
                            'modified_at': row.modified_at,
                            'modified_by': row.modified_by,
                            'last_collection_id': row.last_collection_id,
                            'withdrawal_reason': row.withdrawal_reason,
                            'meeting_time': row.meeting_time,
                            'block_profile': row.block_profile,
                            'invited_disclaimer': row.invited_disclaimer,
                            'completed_delivery_date': row.completed_delivery_date,
                            'interview_procedure': row.interview_procedure
                        }]];
                    });
                    //console.log(data)
                    Model.ContributionVolunteers.create(data);
                    i++;
                    const j = limit * i;
                    if (j <= records) {
                        //console.log(j);
                        insertContributionVolunteersData(i, j);
                    }
                }
            });
        }
    } catch (e) {
        res.status(200).json(e);
    }
}

routers.get('/contribution-volunteers', async (req, res) => {
    try {
        insertContributionVolunteersData(0, 0);
    } catch (e) {
        res.status(200).json(e);
    }
});

//  Data fetch for categoery and sub categoery acivity and asstes

routers.get('/activity-cat-sub-cat-data', async (req, res) => {
    try {
        const object = await Model.ActivitySubCategory.query().select(['mac.sub_cat_count', 'masc.id', 'activity_sub_category_name', 'activity_sub_category_status', 'mac.activity_category_name']).
            join('master_activity_categories as mac', 'mac.id', '=', 'activity_category_id').
            orderBy('activity_sub_category_name');
        return res.status(200).json({ 'data': object });
    } catch (e) {
        res.status(200).json(e);
    }
});

routers.get('/asstes-cat-sub-cat-data', async (req, res) => {
    try {
        const object = await Model.AssetSubCategory.query().select(['masc.id', 'mac.sub_cat_count', 'asset_sub_category_name', 'asset_sub_category_status', 'asset_category_name', 'units', 'details']).
            join('master_asset_categories as mac', 'mac.id', '=', 'asset_category_id').
            orderBy('asset_sub_category_name');

        return res.status(200).json({ 'data': object });
    } catch (e) {
        res.status(200).json(e);
    }
});

routers.get('/sub_activity-wise_ongoing_count', async (req, res) => {
    try {

        const object = (await Model.Activities.query().select(['ac.id', 'ac.activity_sub_category_id', 'ac.activity_details']).
            join('master_activity_sub_categories as masc', 'masc.id', '=', 'ac.activity_sub_category_id').
            where({ 'ac.application_status': 0 })).length;
        // const object    = await Model.Activities.query().select(['ac.id']).
        //  join('master_activity_sub_categories as masc', 'masc.id', '=', 'ac.activity_sub_category_id').
        //  orderBy('ac.id');        
        return res.status(200).json({ 'data': object });
    } catch (e) {
        res.status(200).json(e);
    }
});


function insertRequestOnboardData(i, j) {
    try {
        const limit = 2000;
        const records = 405903;
        if (records >= j) {
            mysql.query(`select * from request_onboard order by id  limit ${j},${limit}`, function (err, result) {
                // mysql.query(`select * from contribution_volunteers order by id`, function (err, result) {
                if (err) {
                    res.status(200).json({ "err": err });
                } else {
                    var data = [];
                    result.forEach((row, i) => {
                        data = [...data, ...[{ 'id': row.id, 'school_id': row.school_id }]];
                    });
                    //console.log(data)
                    Model.RequestOnboard.create(data);
                    i++;
                    const j = limit * i;
                    if (j <= records) {
                        //console.log(j);
                        insertRequestOnboardData(i, j);
                    }
                }
            });
        }
    } catch (e) {
        res.status(200).json(e);
    }
}
routers.get('/request-onboard', async (req, res) => {
    try {
        insertRequestOnboardData(0, 0);
    } catch (e) {
        res.status(200).json(e);
    }
    //console.log("gfgkfkg");
    // try{
    //     mysql.query('select * from request_onboard order by id', function (err, result) {
    //         if (err){
    //             res.status(200).json({"err":err});
    //         }else{
    //             var data = [];
    //             result.forEach((row,i) => {
    //                 console.log({'id':row.id ,'school_id':row.school_id});
    //                 Model.RequestOnboard.create({'id':row.id ,'school_id':row.school_id});
    //                 //data = [...data,...[{'id':row.id ,'school_id':row.school_id}]];
    //             });
    //             //console.log(data);
    //             return res.status(200).json(data);
    //             // const response = Model.RequestOnboard.create(data);
    //             // if(response != null){
    //             //     res.status(200).json('done');
    //             // }
    //         }
    //     });
    // }catch(e){
    //     res.status(200).json(e); 
    // }
});

module.exports = routers;