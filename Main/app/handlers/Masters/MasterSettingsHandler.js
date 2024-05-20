const Model = require("../../models/Masters/MasterSettingsModel");
const DTime = require('node-datetime');

//---------------------------------------Master Year Settings------------------------------------------------------------
exports.addYear = async (req, res) => {
    try {
        const { year_code, year_name, status } = req.body

        const afterCreate = await Model.createYear({ year_code, year_name, status });
        if (afterCreate) {

            res.status(200).json({
                status: true,
                message: "success",
                data: afterCreate,
            })
        } else {
            res.status(400).json({
                status: false,
                message: false,
            })
        }
    } catch (error) {
        res.status(500).json({
            status: false,
            message: JSON.stringify(error),

        })
    }
}

exports.updateYear = async (req, res) => {
    try {
        const { year_name, year_code, id } = req.body

        const afterCreate = await Model.updateayear({ year_name, year_code }, id);
        console.log(afterCreate);
        if (afterCreate) {

            res.status(200).json({
                status: true,
                message: "success",
                data: afterCreate,
            })
        } else {
            res.status(400).json({
                status: false,
                message: false,
            })
        }
    } catch (error) {
        res.status(500).json({
            status: false,
            message: JSON.stringify(error),

        })
    }
}
//---------------------------------------Master Year Settings------------------------------------------------------------

//---------------------------------------Master State Tentative Proposed Settins-----------------------------------------
exports.getMSPT = async (req, res) => {
    try {
        const afterCreate = await Model.findMTSP({});
        if (afterCreate) {
            res.status(200).json({
                status: true,
                message: "success",
                data: afterCreate,
            })
        } else {
            res.status(400).json({
                status: false,
                message: false,
            })
        }
    } catch (error) {
        res.status(500).json({
            status: false,
            message: JSON.stringify(error),

        })
    }
}

exports.updateMSPT = async (req, res) => {
    try {
        const { tentative_central_share, tentative_state_share, tentative_total_estimates, id } = req.body

        const afterCreate = await Model.updateMTSP({ tentative_central_share, tentative_state_share, tentative_total_estimates }, id);
        console.log(afterCreate);
        if (afterCreate) {
            res.status(200).json({
                status: true,
                message: "success",
                data: afterCreate,
            })
        } else {
            res.status(400).json({
                status: false,
                message: false,
            })
        }
    } catch (error) {
        res.status(500).json({
            status: false,
            message: JSON.stringify(error),
        })
    }
}
//---------------------------------------Master State Tentative Proposed Settings----------------------------------------

//---------------------------------------Master Menu Settings------------------------------------------------------------
exports.getMenusList = async (req, res) => {
    try {
        const afterCreate = await Model.findmenusystem({});
        if (afterCreate) {
            res.status(200).json({
                status: true,
                message: "success",
                data: afterCreate,
            })
        } else {
            res.status(400).json({
                status: false,
                message: false,
            })
        }
    } catch (error) {
        res.status(500).json({
            status: false,
            message: JSON.stringify(error),
        })
    }
}

exports.handleMenus = async (req, res) => {
    try {
        const { active_url, menu_img, order_no, name, id, url, parent_id, module_group, status } = req.body

        let object, afterCreate;
        if (+id === 0) {
            object = await Model.knx().raw(`select max(id) as last_id from system_menus;`);
            let id = +object.rows[0].last_id + 1;

            afterCreate = await Model.insertSystemMenu({ id, active_url, menu_img, order_no, url, name, parent_id, module_group, status })
        }
        else {
            afterCreate = await Model.updateSystemMenu({ active_url, menu_img, order_no, url, name, parent_id, module_group, status }, id)
        }

        if (afterCreate) {
            res.status(200).json({
                status: true,
                message: "success",
                data: afterCreate,
            })
        } else {
            res.status(400).json({
                status: false,
                message: false,
            })
        }
    } catch (error) {
        res.status(500).json({
            status: false,
            message: JSON.stringify(error),
        })
    }
}
//---------------------------------------Master Menu Settings------------------------------------------------------------

//---------------------------------------System Permission Settings------------------------------------------------------
exports.getSystemPermission = async (req, res) => {
    try {
        const afterCreate = await Model.findmenupermission({});
        if (afterCreate) {
            res.status(200).json({
                status: true,
                message: "success",
                data: afterCreate,
            })
        } else {
            res.status(400).json({
                status: false,
                message: false,
            })
        }
    } catch (error) {
        res.status(500).json({
            status: false,
            message: JSON.stringify(error),
        })
    }
}

exports.handleSystemPermission = async (req, res) => {
    try {
        const { role_id, menu_id } = req.body.data;
        const id = req.body.id;

        let object, response, dataExists;

        dataExists = await Model.knx().raw(`select * from system_permissions where role_id = ${role_id} and menu_id = ${menu_id}`)

        if(dataExists.rows.length > 0){
           return res.status(200).json({
                status: false,
                message: "This entry already exists."
            })
        }
        if (req.body.flag == 'add') {
            let beforeCreate;
            if(+req.body.parent_id > 0){
                beforeCreate = await Model.findmenupermission({role_id, menu_id: req.body.parent_id});

                if(beforeCreate.length === 0){
                    object = await Model.knx().raw(`select max(id) as last_id from system_permissions;`);
                    let id = +object.rows[0].last_id + 1;
        
                    response = await Model.createSystemPermission({ id, role_id, menu_id: req.body.parent_id });
                }
            }
        
            object = await Model.knx().raw(`select max(id) as last_id from system_permissions;`);
            let id = +object.rows[0].last_id + 1;

            response = await Model.createSystemPermission({ id, role_id, menu_id });
        }
        else {
            response = await Model.updateSystemPermission({ role_id, menu_id }, id);
        }

        if (response) {
            res.status(200).json({
                status: true,
                message: "success"
            })
        }
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.error,
        })
    }
}

exports.deleteSystemPermission =  async (req, res) => {
    try {
        const { id } = req.body;
        const afterCreate = await Model.deleteSystemPermission({ id });
        if (afterCreate) {
            res.status(200).json({
                status: true,
                message: "success",
                data: afterCreate,
            })
        } else {
            res.status(400).json({
                status: false,
                message: false,
            })
        }
    } catch (error) {
        res.status(500).json({
            status: false,
            message: JSON.stringify(error),
        })
    }
}
//---------------------------------------System Permission Settings------------------------------------------------------

//---------------------------------------Master Notifications Settings---------------------------------------------------
exports.getNotifications = async (req, res) => {
    try {
        const afterCreate = await Model.findnotifications({})

        if (afterCreate) {
            res.status(200).json({
                status: true,
                message: "success",
                data: afterCreate,
            })
        }
    } catch (error) {
        res.status(500).json({
            status: false,
            message: JSON.stringify(error),
        })
    }
}

exports.handleNotifications = async (req, res) => {
    try {
        const request = req.body;
        let response;
        if (request.flag == 'add') {
            response = Model.createNotification(request.data);
        }
        else {
            response = Model.updateNotification(request.data, request.id);
        }

        if (response) {
            res.status(200).json({
                status: true,
                message: "success"
            })
        }
    } catch (error) {
        res.status(500).json({
            status: false,
            message: JSON.stringify(error),
        })
    }
}
//---------------------------------------Master Notiifcations Settings---------------------------------------------------

//---------------------------------------Master Sub Components Settings--------------------------------------------------
exports.getSubComponentsList = async (req, res) => {
    try {
        const { schemeid, major_component_id } = req.body;
        const object = await Model.knx().raw(`select sub_component_id, scheme_id, major_component_id, title, serial_order
                                      from prb_sub_component psc where scheme_id = ${schemeid} and major_component_id = ${major_component_id} order by sub_component_id desc`);

        res.status(200).json({
            status: true,
            message: "success",
            data: object,
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: JSON.stringify(error),
        })
    }
}

exports.handleSubComponents = async (req, res) => {
    try {
        const request = req.body;
        let object, response;

        const updated_by = req.auth.user.id;
        const updated_at = DTime.create().format("Y-m-d H:M:S");

        if (request.flag == 'add') {
            object = await Model.knx().raw(`select max(sub_component_id) as last_id from prb_sub_component;`);
            let id = +object.rows[0].last_id + 1;

            response = await Model.createSubComponent({ ...request.data, sub_component_id: id, created_by: updated_by });
        }
        else {
            response = await Model.updateSubComponent({ ...request.data, updated_by, updated_at }, request.sub_component_id);
        }

        if (response) {
            res.status(200).json({
                status: true,
                message: "success"
            })
        }
    } catch (error) {
        res.status(500).json({
            status: false,
            message: JSON.stringify(error),
        })
    }
}
//---------------------------------------Master Sub Components Settings--------------------------------------------------

//---------------------------------------Master Activities Settings------------------------------------------------------
exports.getActivitiesList = async (req, res) => {
    try {
        const { schemeid, major_component_id, sub_component_id } = req.body;
        const object = await Model.knx().raw(`select * from prb_activity_master pam
       where scheme_id = ${schemeid} and major_component_id = ${major_component_id} and sub_component_id = ${sub_component_id} order by id desc`);

        res.status(200).json({
            status: true,
            message: "success",
            data: object.rows,
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: JSON.stringify(error),
        })
    }
}

exports.addActivity = async (req, res) => {
    try {
        const { id, major_component_id, scheme_id, serial_number, sub_component_id, title } = req.body
        const created_by = req.auth.user.id;

        const afterCreate = await Model.createact({ created_by, id, major_component_id, scheme_id, serial_number, sub_component_id, title });
        if (afterCreate) {

            res.status(200).json({
                status: true,
                message: "success",
                data: afterCreate,
            })
        } else {
            res.status(400).json({
                status: false,
                message: false,
            })
        }
    } catch (error) {
        res.status(500).json({
            status: false,
            message: JSON.stringify(error),

        })
    }
}

exports.updateActivity = async (req, res) => {
    try {
        const { title, id } = req.body
        const updated_by = req.auth.user.id;

        const afterCreate = await Model.updateact({ title, updated_by }, id);

        if (afterCreate) {
            res.status(200).json({
                status: true,
                message: "success",
                data: afterCreate,
            })
        } else {
            res.status(400).json({
                status: false,
                message: false,
            })
        }
    } catch (error) {
        res.status(500).json({
            status: false,
            message: JSON.stringify(error),
        })
    }
}
//---------------------------------------Master Activities Settings------------------------------------------------------

//---------------------------------------Master Activity Details Settings------------------------------------------------
exports.getMaxActivityMasterID = async (req, res) => {
    try {
        const object = await Model.knx().raw(`select max(id) as last_id from prb_activity_master;`);

        if (object.rows[0]) {
            res.status(200).json({
                status: true,
                message: "success",
                data: object.rows[0]
            })
        }
    } catch (error) {
        res.status(500).json({
            status: false,
            message: JSON.stringify(error),
        })
    }
}

exports.getMaxActivitDetailsID = async (req, res) => {
    try {
        const object = await Model.knx().raw(`select max(id) as last_id from prb_data;`);

        if (object.rows[0]) {
            res.status(200).json({
                status: true,
                message: "success",
                data: object.rows[0]
            })
        }
    } catch (error) {
        res.status(500).json({
            status: false,
            message: JSON.stringify(error),
        })
    }
}

exports.handleActivityDetails = async (req, res) => {
    try {
        const request = req.body;
        const created_by = req.auth.user.id;
        let response;
        if (request.flag == 'add') {
            response = await Model.createSubActivity({ ...request.data, created_by });
        }

        if (request.flag == 'edit') {
            response = await Model.updateSubActivity({ ...request.data, created_by }, request.id);
        }

        if (response) {
            res.status(200).json({
                status: true,
                message: "success"
            })
        }
    } catch (error) {
        res.status(500).json({
            status: false,
            message: JSON.stringify(error),
        })
    }
}
//---------------------------------------Master Activity Details Settings------------------------------------------------

//---------------------------------------Master Group Settings--------------------------------------------------
exports.addGroup = async (req, res) => {
    try {
        const { group_code, group_name, group_description, group_type } = req.body;

        const afterCreate = await Model.createMaster({ group_code, group_name, group_description, group_type });

        if (afterCreate) {
            res.status(200).json({
                status: true,
                message: "success",
                data: afterCreate,
            })
        } else {
            res.status(400).json({
                status: false,
                message: false,
            })
        }
    } catch (error) {
        res.status(500).json({
            status: false,
            message: JSON.stringify(error),
        })
    }
}
//---------------------------------------Master Group Settings--------------------------------------------------

//---------------------------------------Master Activity Group Mapping Settings------------------------------------------
exports.getActivityGroupMapping = async (req, res) => {
    try {
        const object = await Model.getUniqueGAMData();

        if (object) {
            res.status(200).json({
                status: true,
                message: "success",
                data: object.rows,
            })
        } else {
            res.status(400).json({
                status: false,
                message: false,
            })
        }
    } catch (error) {
        res.status(500).json({
            status: false,
            message: JSON.stringify(error),
        })
    }
}

exports.getActivityGroupMappingDetails = async (req, res) => {
    try {
        const request = req.body;
        const object = await Model.findGAMRecords(request.group_code);

        if (object) {
            res.status(200).json({
                status: true,
                message: "success",
                data: object.rows,
            })
        } else {
            res.status(400).json({
                status: false,
                message: false,
            })
        }
    } catch (error) {
        res.status(500).json({
            status: false,
            message: JSON.stringify(error),
        })
    }
}

exports.handleGroupActivityMapping = async (req, res) => {
    try {
        const request = req.body;
        let response;
        if (request.flag == 'add') {
            response = Model.createActivityGroupMapping(request.data);
        }
        else {
            response = Model.updateActivityGroupMapping(request.data[0], request.id);
        }

        if (response) {
            res.status(200).json({
                status: true,
                message: "success"
            })
        }
    } catch (error) {
        res.status(500).json({
            status: false,
            message: JSON.stringify(error)
        })
    }
}

exports.deleteActivityGroupMapping = async (req, res) => {
    try {
        const request = req.body;
        let response = await Model.deleteActivityGroupMapping(request.id);

        if (response) {
            res.status(200).json({
                status: true,
                message: "success"
            })
        }
    } catch (error) {
        res.status(500).json({
            status: false,
            message: JSON.stringify(error)
        })
    }
}
//---------------------------------------Master Activity Group Mapping Settings------------------------------------------

//---------------------------------------Master Location Group Mapping Settings------------------------------------------
exports.getLocationGroupMapping = async (req, res) => {
    try {
        const object = await Model.getUniqueLGMData();

        if (object) {
            res.status(200).json({
                status: true,
                message: "success",
                data: object.rows,
            })
        } else {
            res.status(400).json({
                status: false,
                message: false,
            })
        }
    } catch (error) {
        res.status(500).json({
            status: false,
            message: JSON.stringify(error),
        })
    }
}

exports.getLocationGroupMappingDetails = async (req, res) => {
    try {
        const request = req.body;
        const object = await Model.findLGMRecords(request.group_code);

        if (object) {
            res.status(200).json({
                status: true,
                message: "success",
                data: object.rows,
            })
        } else {
            res.status(400).json({
                status: false,
                message: false,
            })
        }
    } catch (error) {
        res.status(500).json({
            status: false,
            message: JSON.stringify(error),
        })
    }
}

exports.handleLocationGroupMapping = async (req, res) => {
    try {
        const request = req.body;
        let response;
        if (request.flag == 'add') {
            response = Model.createLocationGroupMapping(request.data);
        }
        else {
            response = Model.updateLocationGroupMapping(request.data[0], request.id);
        }

        if (response) {
            res.status(200).json({
                status: true,
                message: "success"
            })
        }
    } catch (error) {
        res.status(500).json({
            status: false,
            message: JSON.stringify(error)
        })
    }
}

exports.deleteLocationGroupMapping = async (req, res) => {
    try {
        const request = req.body;
        let response = await Model.deleteLocationGroupMapping(request.id);

        if (response) {
            res.status(200).json({
                status: true,
                message: "success"
            })
        }
    } catch (error) {
        res.status(500).json({
            status: false,
            message: JSON.stringify(error)
        })
    }
}
//---------------------------------------Master Location Group Mapping Settings------------------------------------------
