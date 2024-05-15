const Model = require("../../models").cmsSubcategoryModel;
const { log } = require("util");
const Exception = require("../Assets/ExceptionHandler");
const fs = require("fs")
const Message = require("../../helpers/Message");
exports.cmsCreate = async (req, res, img_icon) => {
    try {
        const request = req.body;
        const userData = await Model.findExistingUser(request);
        let message;
        if (userData === undefined) {
            const result = await Model.create({
                category_id: request.category_id,
                title: request.title,
                description: request.description,
                img_icon: img_icon,
                created_by: request.created_by,
                update_by: request.update_by,

            })
            if (result) {
                res.status(200).json({ status: true, message: message, result });
            } else {
                fs.unlinkSync(pathimg);
                res.status(400).json({ status: false, message: message, "a": "vbklfmbklfmnbk" });
            }
            var abobject = {}
        } else {

            if (img_icon) {
                // return  console.log("hgvjifrvrjhijvgrklej rrrrrrrrrrrrrrrrrrrrrrpublicuploads\cms\file-1700827045943.jpg", userData.img_icon);
                fs.unlinkSync(userData.img_icon)

                abobject = { ...request, img_icon }

                const object = await Model.update(abobject, request.created_by);
                if (object) {
                    res.status(200).json({ status: true, message: message, "uptade": "uptade" });
                } else {
                    res.status(401).json({ status: false, message: false, "uptade": false });
                }
            } else {
                //    img_icon=userData.img_icon

                abobject = { ...request, img_icon: userData.img_icon }

                const object = await Model.update(abobject, request.created_by);
                if (object) {
                    res.status(200).json({ status: true, message: message, "uptade": "uptadecvtgbvgtbht" });
                } else {
                    res.status(401).json({ status: false, message: false, "uptade": false });
                }
            }

        }
    } catch (e) {
        fs.unlinkSync(img_icon);
        return Exception.handle(e,res,req,'');

    }
};
exports.index = async (req, res) => {
    try {
        const request = req.body;
        let message;
        const result = await Model.find({
            created_by: request.created_by,
        });
        if (result) {
            res.status(200).json({ status: true, message: message, result });
        } else {

            res.status(400).json({ status: false, message: message });
        }


    } catch (e) {

        return Exception.handle(e,res,req,'');

    }
};
exports.deleteById = async (req, res) => {
    try {
        const id = req.body.id;
        console.log("=====>", req.body)
        //const userData    =   await Model.findExistingUser(request);
        let message;
        const result = await Model.delete({
            id: id,
        });
        console.log("=====>", req.body, "result", result)
        if (result) {
            res.status(200).json({ status: true, message: message });
        } else {
            res.status(400).json({ status: false, message: message, });
        }


    } catch (e) {

        return Exception.handle(e,res,req,'');

    }
};
exports.updateStatus = async (req, res) => {
    try {
        const { status, slug } = req.body.data;
        const result = await Model.findbyslug({ slug: slug });
        console.log("result::", result)
        if (result != null) {
            const object = await Model.updatestatus({ status }, slug);
            // const message = (object) ? Message.updated(status) : Message.status(status);
            res
                .status(200)
                .json({ status: true, message: Message.status("Category Type", status) });
        } else {
            res
                .status(200)
                .json({ status: false, message: Message.notFound("Record") });
        }
    } catch (e) {
        return Exception.handle(e,res,req,'');
    }
};




// const TimelineImage = await TimelineModel.find({
//     activity_id: request.aid,
//   });
// const clam = new clamscan.ClamScan({
//     clamdscan: {
//       path: '/usr/bin/clamdscan', // Path to clamdscan binary
//       config_file: '/etc/clamd.d/daemon.conf', // Path to clamd configuration file
//     },
//   });

//   // Scan the uploaded file
//   clam.scan_file(req.file.path, (err, object, malicious) => {
//     if (err) {
//       return res.status(500).send('Error scanning file');
//     }
//     if (malicious) {
//       return res.status(400).send('Malicious file detected');
//     }
//     res.send('File uploaded successfully');
//   });
// });