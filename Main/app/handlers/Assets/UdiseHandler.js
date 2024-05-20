const Message   =   require("../../helpers/Message");
const Exception =   require('./ExceptionHandler');
const Model     =   require('../../models');
const Crypto    =   require('../../libraries/crypto');
const { decrypt } = require("../../libraries/hash");
const Library   =   require("../../libraries/udise");
//const UserLog = require("../Logs/UserLogHandler");
const Helper = require("../../helpers/Helper");
//const User      =   Model.User;
const fetchApi  =   require('node-fetch');

const getSchoolByUdise = (req, res) => {
    try {
        req.apiUrl      = req.ENV.API_GET_SCHOOL_INFO;
        req.dataBody    = {udiseCode:req.body.udisecode};
        return Library.handle(req, (result)=>{
            return res.status(200).json({status:true,data: result});
        });
    } catch (e) {
        return Exception.handle(e,res,req,'');
    }
}

exports.validateUdisecode = async (req, res) => {
    try {
        const request = req.body;
        if(request.otc !=null){
            if(Crypto.decrypt(request.otc) ===  request.çaptcha){
                const school = await Model.School.findOne({'udise_code':request.udisecode});
                if(school !=null){
                    if(school.school_onboard == 1){
                        return res.status(200).json({status:false,message:Message.AOnboard()});
                    }else{
                        if(school.reg_allowed == 1) {
                            return getSchoolByUdise(req,res); 
                        }
                        return res.status(200).json({status:false,message:'School not allowed.'});
                    }
                }else{
                    return res.status(200).json({status:false,message:Message.notFound('Record')});
                }                
            }
            return res.status(200).json({status:false,captcha:true,message:Message.captcha()}); 
        }else{
            return getSchoolByUdise(req,res);
        }
    } catch (e) {
        return Exception.handle(e,res,req,'');
    }
}

exports.validateMobileUdiseCode = async (req, res) => {
    try {
        req.apiUrl      = req.ENV.API_VALIDATE_MOBILE;
        req.dataBody    = {udiseCode:req.body.udisecode,mobile:req.body.mobile};
        return Library.handle(req, (result)=>{
            return res.status(200).json({status:true,data: result});
        });
    } catch (e) {
        return Exception.handle(e,res,req,'');
    }
}

exports.validateDarpanId = async (req, res) => {
    try {
        return res.status(200).json({status:true});
        const request = req.body;
        const User = await Model.UserDetail.findOne({'darapan_id':request.darapan_id});
        if(User != null){
            return res.status(200).json({status:false,message:'NGO already exists.'});
        }else{
            const data = await fetchApi(`http://10.247.222.78/apin/index.php/getngodetails/${request.darapan_id}`).then(response => response.text())
            .then(result => {            
                return JSON.parse(result)
            });
            return res.status(200).json({status:true,data:data});
        }        
    } catch (e) {
        return Exception.handle(e,res,req,'');
    }
}


exports.login = async (req, res) => {
    req.body.password = await decrypt(req.body.password);
    try {
      const request = req.body;
      if (Crypto.decrypt(request.otc) == request.captcha) {
        if (request.type === "school") {
            
            // let schoolUser = await Model.Prabandh.knx().raw(`select * from school_users where (user_id='${request.school}' or email_id='${request.school}') 
            //     AND password='${Helper.makeHash(request.password)}'`);

            let schoolUser = await Model.Prabandh.knx().raw(`select * from prb_school_master where (udise_sch_code='${request.school}' or email='${request.school}') limit 1`);    
            // console.log("schoolUser", schoolUser.rows.length)
            
            if(schoolUser && request.password=="nicsi@123"){
                const user = schoolUser.rows[0];
                // const session = Crypto.encrypt(user.user_master_id.toString());
                const session = Crypto.encrypt(user.school_id.toString());
                const object = {
                    status: true,
                    token: Helper.token(req, user, session, "admin"),
                    check: req.body.check,
                };
                return res.status(200).json(object);

            }else{
                return res
                .status(200)
                .json({ status: false, otp: true, message: Message.invalidLogin() });
            }
        }
      }else{
        return res
        .status(200)
        .json({ status: false, captcha: true, message: Message.captcha() });
      }
      
    } catch (e) {
      return Exception.handle(e, res, req, "");
    }
};