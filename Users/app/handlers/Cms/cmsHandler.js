const Model = require("../../models").cmsModele;
const { log } = require("util");
const Exception = require("../Assets/ExceptionHandler");
const Response = require("../Assets/ResponseHandler");
const fs = require("fs")
const Message = require("../../helpers/Message");
exports.cmsCreate = async (req, res, img_icon) => {
    try {
        const request = req.body;
        let message;

        const userData = await Model.findExistingUser(request);

        if (userData === undefined) {
            const result = await Model.create({
                title: request.title,
                description: request.description,
                img_icon: img_icon,
                created_by: request.created_by,
                update_by: request.update_by,

            })
            if (result) {
                //    res.status(200).json({ status: true, message: message, result });
                return Response.handle(req, res, 'cmsCreate', 200, { status: true, message: message, result })
            } else {
                fs.unlinkSync(pathimg);
                //    res.status(400).json({ status: false, message: message, "a": "vbklfmbklfmnbk" });
                return Response.handle(req, res, 'cmsCreate', 400, { status: false, message: message, "a": "vbklfmbklfmnbk" })
            }
            var abobject = {}
        } else {

            if (img_icon) {
                fs.unlinkSync(userData.img_icon)

                abobject = { ...request, img_icon }

                const object = await Model.update(abobject, request.created_by);
                if (object) {
                    //    res.status(200).json({ status: true, message: message, "update": "update" });
                    return Response.handle(req, res, 'cmsCreate', 200, { status: true, message: message, "update": "update" })
                } else {
                    //    res.status(401).json({ status: false, message: false, "update": false });
                    return Response.handle(req, res, 'cmsCreate', 401, { status: false, message: false, "update": false })
                }
            } else {

                abobject = { ...request, img_icon: userData.img_icon }

                const object = await Model.update(abobject, request.created_by);
                if (object) {
                    //    res.status(200).json({ status: true, message: message, "update": "updatecvtgbvgtbht" });
                    return Response.handle(req, res, 'cmsCreate', 200, { status: true, message: message, "update": "updatecvtgbvgtbht" })
                } else {
                    //    res.status(401).json({ status: false, message: false, "update": false });
                    return Response.handle(req, res, 'cmsCreate', 401, { status: false, message: false, "update": false })
                }
            }
        }
    } catch (e) {
        fs.unlinkSync(img_icon);
        return Exception.handle(e, res, req, 'cmsCreate');
    }
};

// cms creat by id

exports.cmsFindById = async (req, res) => {
    try {
        const request = req.body;
        //const userData    =   await Model.findExistingUser(request);
        let message;

        const TimelineImage = await Model.find({
            created_by: request.cid,
        });

        if (TimelineImage) {
            //    res.status(200).json({ status: true, message: message, TimelineImage });
            return Response.handle(req, res, 'cmsFindById', 200, { status: true, message: message, TimelineImage })
        } else {
            //    res.status(400).json({ status: false, message: message });
            return Response.handle(req, res, 'cmsFindById', 400, { status: false, message: message })
        }
    } catch (e) {
        return Exception.handle(e, res, req, 'cmsFindById');
    }
};

exports.deleteById = async (req, res) => {
    try {
        const request = req.body.id;
        let message;
        const TimelineImage = await Model.delete({
            created_by: request,
        });
        if (TimelineImage) {
            //    res.status(200).json({ status: true, message: message });
            return Response.handle(req, res, 'deleteById', 200, { status: true, message: message })
        } else {
            //    res.status(400).json({ status: false, message: message });
            return Response.handle(req, res, 'deleteById', 400, { status: false, message: message })
        }
    } catch (e) {
        return Exception.handle(e, res, req, 'deleteById');
    }
};

exports.updateStatus = async (req, res) => {
    try {
        const { status, slug } = req.body.data;
        const result = await Model.findbyslug({ slug: slug });

        if (result != null) {
            const object = await Model.updatestatus({ status }, slug);
            // res
            //     .status(200)
            //     .json({ status: true, message: Message.status("Category Type", status) });

            return Response.handle(req, res, 'updateStatus', 200, { status: true, message: Message.status("Category Type", status) })
        } else {
            // res
            //     .status(200)
            //     .json({ status: false, message: Message.notFound("Record") });

            return Response.handle(req, res, 'updateStatus', 200, { status: false, message: Message.notFound("Record") })
        }
    } catch (e) {
        return Exception.handle(e, res, req, 'updateStatus');
    }
};




// const TimelineImage = await TimelineModel.find({
//     activity_id: request.aid,
//   });
