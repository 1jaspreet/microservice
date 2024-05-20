const Model     =   require('../../models').Role;
const Maintenance     =   require('../../models').Maintenance;
const Message   =   require('../../helpers/Message');
const Exception =   require('../Assets/ExceptionHandler');
const Response  =   require('../Assets/ResponseHandler');

exports.index = async(req,res) =>{
    try{
        const request = req.body;
        const object  = await Model.query().select(['id','role_name','role_status']).orderBy('role_name').
                                    limit(request.limit).offset(request.limit*(request.page-1));
        const count   = await Model.count();
    //    res.status(200).json({status:true,'data':object,'count':count});
        return Response.handle(req, res, 'index', 200, {status:true,'data':object,'count':count})
    }catch(e){
        return Exception.handle(e,res,req,'index');
    }
}

exports.maintenanceList = async(req,res) =>{
    try{
        const object = await Maintenance.list()
    //    res.status(200).json({status:true,'data':object}); 
        return Response.handle(req, res, 'maintenanceList', 200, {status:true,'data':object})
    }catch(e){
        return Exception.handle(e,res,req,'maintenanceList');
    }
}

exports.list = async(req,res) =>{
    try{
        const object = await Model.list()
    //    res.status(200).json({status:true,'data':object}); 
        return Response.handle(req, res, 'list', 200, {status:true,'data':object})
    }catch(e){
        return Exception.handle(e,res,req,'list');
    }
}

exports.create = async(req,res) =>{
    try{
        const {role_name} = req.body;
        const result    = await Model.findOne({role_name}); 
        if(result.length == 0){ 
            const object    = await Model.create({role_name});
            const message   = (object) ? Message.created(role_name) : Message.default(); 
        //    res.status(200).json({status:true,message:message}); 
            return Response.handle(req, res, 'create', 200, {status:true,message:message})
        }else{
        //    res.status(200).json({status:true,message:Message.duplicate(role_name)});
            return Response.handle(req, res, 'create', 200, {status:true,message:Message.duplicate(role_name)})
        }
    }catch(e){
        return Exception.handle(e,res,req,'create');
    }
}

exports.update = async(req,res) =>{
    try{
        const {role_name,id}  = req.body;        
        const result = await Model.findOne({id});
        if(result !=null){
            const object    = await Model.update({role_name},id);
            const message   = (object) ? Message.updated(role_name) : Message.default(); 
            res.status(200).json({status:true,message:message}); 
        }else{
            res.status(200).json({status:true,message:Message.notFound('Record')});
        }
    }catch(e){
        return Exception.handle(e,res,req,'');
    }
}

exports.delete = async(req,res) =>{
    try{
        const {id}   = req.body; 
        const object = await Model.findOne({id});
        if(object !=null){
            const message   = (Model.delete({id})) ? Message.deleted(object.role_name) : Message.default();
            res.status(200).json({status:true,message:message});
        }else{
            res.status(404).json({status:false,message:Message.notFound('Record')});
        }
    }catch(e){
        return Exception.handle(e,res,req,'');
    }
}

exports.updateStatus = async(req,res) =>{
    try{
        const {id}   = req.body; 
        const object = await Model.findOne({id});
        if(object !=null){
            const status    = (object.role_status == 1) ? 0 : 1;
            const result    = await Model.update({role_status:status},id);
            const message   = (result) ? Message.status('Record',status) : Message.default();
            res.status(200).json({status:true,message:message});
        }else{
            res.status(404).json({status:false,message:Message.notFound('Record')});
        }
    }catch(e){ 
        return Exception.handle(e,res,req,'');
    }
}

exports.find = async(req,res) =>{
    try{
        const {id}   = req.body; 
        const object = await Model.findOne({id});
        if(object !=null){
            res.status(200).json({status:true,'data':object}); 
        }else{
            res.status(404).json({status:false,message:Message.notFound('Record')});
        }
    }catch(e){
        return Exception.handle(e,res,req,'');
    }
}