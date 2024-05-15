const Model     =   require('../../../models').ActivitySubCategory;
const Message   =   require('../../../helpers/Message');
const Exception =   require('../../Assets/ExceptionHandler');

exports.index = async(req,res) =>{
    try{
        const request = req.body;
        const object    = await Model.query().select(['masc.id','activity_sub_category_name','activity_sub_category_status','mac.activity_category_name']).
                                    join('master_activity_categories as mac', 'mac.id', '=', 'activity_category_id').
                                    orderBy('activity_sub_category_name').limit(request.limit).offset(request.limit*(request.page-1));
        const count     = await Model.count();
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
        const {activity_sub_category_name,activity_category_id} = req.body;
        const result    = await Model.findOne({activity_sub_category_name,activity_category_id}); 
        if(result.length == 0){ 
            const object    = await Model.create({activity_sub_category_name,activity_category_id});
            const message   = (object) ? Message.created(activity_sub_category_name) : Message.default(); 
            res.status(200).json({status:true,message:message}); 
        }else{
            res.status(200).json({status:false,message:Message.duplicate(activity_sub_category_name)});
        }
    }catch(e){
        return Exception.handle(e,res,req,'');
    }
}

exports.update = async(req,res) =>{
    try{
        const {activity_sub_category_name}  = req.body; 
        const result = await Model.findOne({id});
        if(result !=null){
            const object    = await Model.update({activity_sub_category_name},id);
            const message   = (object) ? Message.updated(activity_sub_category_name) : Message.default(); 
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
            const message   = (Model.delete({id})) ? Message.deleted(object.activity_sub_category_name) : Message.default();
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
            const status    = (object.activity_sub_category_status == 1) ? 0 : 1;
            const result    = await Model.update({activity_sub_category_status:status},id);
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