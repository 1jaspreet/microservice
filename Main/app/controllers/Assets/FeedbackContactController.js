const express   =   require('express');
const Exception =   require('../../handlers/Assets/ExceptionHandler');
const Crypto    =   require('../../libraries/crypto');
const Model     =   require('../../models').FeedbackContact;
const Message   =   require("../../helpers/Message");
const routers   =   express.Router();

routers.post('/',async (req,res)=>{
    try {
        const request  = req.body;
        console.log(request,Crypto.decrypt(request.otc),request.captcha)
        if(Crypto.decrypt(request.otc) ===  request.captcha){
            const data = await Model.create({
                name : request.name,
                mobile : request.mobile,
                email : request.email,
                message : request.message,
                feedback_type : request.feedback_type,
                subject : request.subject,
                status : 1,
                flag : request.flag,
                rating : 0,
            });

            if(data !== null) {
                if(request.falg == 1) {
                    return res.status(200).json({'status':true,'message': 'Feedback submitted successfully.'});
                }
                return res.status(200).json({'status':true,'message': 'Enquiry submitted successfully.'})
            }
        }
        return res.status(200).json({status:false,captcha:true,message:Message.captcha()}); 
    } catch (e) {
        return Exception.handle(e,res,req,'');
    }
});

module.exports = routers;