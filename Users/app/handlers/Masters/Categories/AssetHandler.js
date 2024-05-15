const Model     =   require('../../../models').AssetCategory;
const Message   =   require('../../../helpers/Message');
const Exception =   require('../../Assets/ExceptionHandler');

exports.index = async(req,res) =>{
    try{
        const request = req.body;
        const object  = await Model.query().select(['id','asset_category_name','asset_category_status']).
                                    orderBy('asset_category_name').limit(request.limit).offset(request.limit*(request.page-1));
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
        const {asset_category_name} = req.body;
        const result    = await Model.findOne({asset_category_name}); 
        if(result.length == 0){ 
            const object    = await Model.create({asset_category_name});
            const message   = (object) ? Message.created(asset_category_name) : Message.default(); 
            res.status(200).json({status:true,message:message}); 
        }else{
            res.status(200).json({status:false,message:Message.duplicate(asset_category_name)});
        }
    }catch(e){
        return Exception.handle(e,res,req,'');
    }
}

exports.update = async(req,res) =>{
    try{
        const {asset_category_name,id}  = req.body; 
        const result = await Model.findOne({id});
        if(result !=null){
            const object    = await Model.update({asset_category_name},id);
            const message   = (object) ? Message.updated(asset_category_name) : Message.default(); 
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
            const message   = (Model.delete({id})) ? Message.deleted(object.asset_category_name) : Message.default();
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
            const status    = (object.asset_category_status == 1) ? 0 : 1;
            const result    = await Model.update({asset_category_status:status},id);
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