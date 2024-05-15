const Model     =   require('../../models')
const Exception =   require('../Assets/ExceptionHandler');
const Response  =   require('../Assets/ResponseHandler');
const Pool      =   require('../../../config/database/postgres');

exports.userLogs = async(req,res) =>{
    try{
        const request   =   req.body;
        
        const query     =   `SELECT ul.*,
                            CASE
                                WHEN (ul.user_flag = 'admin') THEN (select user_name from admin_users where id=ul.users_id)
                                WHEN (ul.user_flag = 'school') THEN (select school_name from master_schools where id=ul.users_id)
                                WHEN (ul.user_flag = 'volunteer') THEN (select volunteer_name from volunteers where id=ul.users_id)
                            END AS user_name
                            FROM log_users ul  ORDER BY ul.id DESC  limit ${request.limit} offset ${request.limit*(request.page-1)}`;
                            
        const object    =   await Pool.query(query);
        const count     =   await Model.UserLog.count();
        
    //    return res.status(200).json({status:true,'data':object.rows,'count':count}); 
        return Response.handle(req, res, 'userLogs', 200, {status:true,'data':object.rows,'count':count})
    }catch(e){
        return Exception.handle(e,res,req,'userLogs');
    }
}

exports.errorLogs = async(req,res) =>{
    try{
        const request   =   req.body;
        const object    =   await Model.ErrorLog.query().select().orderBy('id', 'desc').limit(request.limit).offset(request.limit*(request.page-1))                   
        const count     =   await Model.ErrorLog.count();

    //    res.status(200).json({status:true,'data':object,'count':count}); 
        return Response.handle(req, res, 'errorLogs', 200, {status:true,'data':object,'count':count})
    }catch(e){
        return Exception.handle(e,res,req,'errorLogs');
    }
}

exports.activityLogs = async(req,res) =>{
    try{
        const request   =   req.body;
        const object    =   await Model.ActivityLog.query().select().orderBy('id', 'desc').limit(request.limit).offset(request.limit*(request.page-1))                   
        const count     =   await Model.ActivityLog();

    //    res.status(200).json({status:true,'data':object,'count':count}); 
        return Response.handle(req, res, 'activityLogs', 200, {status:true,'data':object,'count':count})
    }catch(e){
        return Exception.handle(e,res,req,'activityLogs');
    }
}
