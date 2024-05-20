const Model     =   require('../../../models').AssetSubCategory;
const Message   =   require('../../../helpers/Message');
const Exception =   require('../../Assets/ExceptionHandler');

exports.index = async(req,res) =>{
    try{
        const request = req.body;
        const object    = await Model.query().select(['masc.id','asset_sub_category_name','asset_sub_category_status','asset_category_name','units','details']).
                                    join('master_asset_categories as mac', 'mac.id', '=', 'asset_category_id').
                                    orderBy('asset_sub_category_name').limit(request.limit).offset(request.limit*(request.page-1));
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
        const {asset_sub_category_name,asset_category_id} = req.body;
        const result    = await Model.findOne({asset_sub_category_name,asset_category_id}); 
        if(result.length == 0){ 
            const object    = await Model.create({asset_sub_category_name,asset_category_id});
            const message   = (object) ? Message.created(asset_sub_category_name) : Message.default(); 
            res.status(200).json({status:true,message:message}); 
        }else{
            res.status(200).json({status:false,message:Message.duplicate(asset_sub_category_name)});
        }
    }catch(e){
        return Exception.handle(e,res,req,'');
    }
}

exports.update =  async(req,res) =>{
    try{
        const {asset_category_id ,units, details ,id, asset_sub_category_name }  = req.body;
        const object = await Model.findOne({id});
        if(object != null ){
            const result  = await Model.update({asset_category_id, asset_sub_category_name ,units, details},id)
            const message   = (result) ? Message.created(asset_sub_category_name) : Message.default(); 
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
            const message   = (Model.delete({id})) ? Message.deleted(object.asset_sub_category_name) : Message.default();
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
            const status    = (object.asset_sub_category_status == 1) ? 0 : 1;
            const result    = await Model.update({asset_sub_category_status:status},id);
            const message   = (result) ? Message.status('Record',status) : Message.default();
            res.status(200).json({status:true,message:message});
        }else{
            res.status(404).json({status:false,message:Message.notFound('Record')});
        }
    }catch(e){ 
        return Exception.handle(e,res,req,'');
    }
}

exports.findOne = async(req,res) =>{
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