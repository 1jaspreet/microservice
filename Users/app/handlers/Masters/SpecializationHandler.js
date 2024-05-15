const Model     =   require('../../models').Specialization;
const Message   =   require('../../helpers/Message');
const Exception =   require('../Assets/ExceptionHandler');

exports.index = async(req,res) =>{
    try{        
        const request = req.body;
        const object  = await Model.query().select(['id','specialization_name','specialization_status']).orderBy('specialization_order').
                                    limit(request.limit).offset(request.limit*(request.page-1));
        const count   = await Model.count();
        res.status(200).json({status:true,'data':object,'count':count}); 
    }catch(e){
        return Exception.handle(e,res,req,'');
    }
}

exports.list = async(req,res) =>{
    try{
        const object = await Model.list()
        res.status(200).json({status:true,'data':object}); 
    }catch(e){
        return Exception.handle(e,res,req,'');
    }
}

exports.create = async(req,res) =>{
    try{
        const {gender_name} = req.body;
        const result    = await Model.findOne({gender_name});
        if(result.length == 0){ 
            const object    = await Model.create({gender_name});
            const message   = (object) ? Message.created(gender_name) : Message.default(); 
            res.status(200).json({status:true,message:message}); 
        }else{
            res.status(200).json({status:false,message:Message.duplicate(gender_name)});
        }
    }catch(e){
        return Exception.handle(e,res,req,'');
    }
}

exports.update = async(req,res) =>{
    try{
        const {gender_name,id}  = req.body; 
        const result = await Model.findOne({id});
        if(result !=null){
            const object    = await Model.update({gender_name},id);
            const message   = (object) ? Message.updated(gender_name) : Message.default(); 
            res.status(200).json({status:true,message:message}); 
        }else{
            res.status(200).json({status:false,message:Message.notFound('Record')});
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
            const message   = (Model.delete({id})) ? Message.deleted(object.state_name) : Message.default();
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
            const status    = (object.state_status == 1) ? 0 : 1;
            const result    = await Model.update({state_status:status},id);
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
            res.status(200).json({status:true,'data':object[0]}); 
        }else{
            res.status(404).json({status:false,message:Message.notFound('Record')});
        }
    }catch(e){
        return Exception.handle(e,res,req,'');
    }
}