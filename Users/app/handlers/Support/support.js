const Model = require("../../models").supportModel;
const { log } = require("util");
const Exception = require("../Assets/ExceptionHandler");
const Response = require("../Assets/ResponseHandler");
const fs = require("fs")
const Message = require("../../helpers/Message");
exports.supportCreate = async (req, res, img_icon) => {

    try {
        const request = req.body;
        let message;
        const created_by = req.auth.user.id;

        const userData = await Model.findExistingUser(request);

        if (userData === undefined) {
            const result = await Model.create({
                name: request.name,
                description: request.description,
                file: img_icon,
                email: request.email,
                support_email: request.supportemail,
                support_type: request.supporttype,
                support_mobile:request.supportmobile,
                status:"panding",   
                created_by
            })
            if (result) {
              return  console.log(result,"fjpiejfkjegkjkgvjfkljvfkljvbklfjbv,fmvkljkfmnf,vjfkj");
                //    res.status(200).json({ status: true, message: message, result });
                return Response.handle(req, res, 'cmsCreate', 200, { status: true, message: message, result })
            } else {
                fs.unlinkSync(pathimg);
                //    res.status(400).json({ status: false, message: message, "a": "vbklfmbklfmnbk" });
                return Response.handle(req, res, 'cmsCreate', 400, { status: false, message: message})
            }

        } 
    } catch (e) {
        fs.unlinkSync(img_icon);
        return Exception.handle(e, res, req, 'cmsCreate');
    }
};