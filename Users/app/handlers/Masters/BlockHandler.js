const Model     =    require('../../models').Block;
const Message   =    require('../../helpers/Message');
const Exception =    require('../Assets/ExceptionHandler');
const Response  =    require('../Assets/ResponseHandler');

exports.index = async(req,res) =>{
    try{
        const request = req.body;
        const object  = await Model.query().select(['mb.id','mb.block_name','mb.block_status','md.district_name','ms.state_name']).
                                    join('master_districts as md', 'md.id', '=', 'mb.block_district_id').
                                    join('master_states as ms', 'ms.id', '=', 'mb.block_state_id').
                                    orderBy('mb.block_name').limit(request.limit).offset(request.limit*(request.page-1));
        const count   = await Model.count();
        // res.status(200).json({status:true,'data':object,'count':count}); 
        return Response.handle(req, res, 'index', 200, {status:true,'data':object,'count':count})
    }catch(e){
        return Exception.handle(e,res, req, 'index');
    }
}

exports.districtsBlocks = async(req,res) =>{
    try{
        const object = await Model.find({block_district_id:req.body.district})
       // res.status(200).json({status:true,'data':object}); 
       return Response.handle(req, res, 'districtBlocks', 200, {status:true,'data':object})
    }catch(e){
        return Exception.handle(e,res, req, 'districtsBlocks');
    }
}

exports.list = async(req,res) =>{
    try{
        const object = await Model.list()
       // res.status(200).json({status:true,'data':object}); 
        return Response.handle(req, res, 'list', 200, {status:true,'data':object})
    }catch(e){
        return Exception.handle(e,res, req, 'list');
    }
}

exports.create = async(req,res) =>{
    try{
        const {block_name,block_id,block_state_id,block_district_id} = req.body;
        const result    = await Model.findOne({block_id,block_state_id,block_district_id,location_id}); 
        if(result.length == 0){ 
            const object    = await Model.create({block_name,block_id,block_state_id,block_district_id});
            const message   = (object) ? Message.created(block_name) : Message.default(); 
           // res.status(200).json({status:true,message:message}); 
            return Response.handle(req, res, 'create', 200, {status:true,message:message})
        }else{
           // res.status(200).json({status:false,message:Message.duplicate(name)});
            return Response.handle(req, res, 'create', 200, {status:false,message:Message.duplicate(name)})
        }
    }catch(e){
        return Exception.handle(e,res, req, 'create');
    }
}

exports.update = async(req,res) =>{
    try{
        const {block_name,block_id,block_state_id,block_district_id,id}  = req.body; 
        const result = await Model.findOne({id});
        if(result !=null){
            const object    = await Model.update({block_name,block_id,block_state_id,block_district_id},id);
            const message   = (object) ? Message.updated(block_name) : Message.default(); 
           // res.status(200).json({status:true,message:message}); 
            return Response.handle(req, res, 'update', 200, {status:true,message:message})
        }else{
          //  res.status(200).json({status:false,message:Message.notFound('Record')});
            return Response.handle(req, res, 'update', 200, {status:false,message:Message.notFound('Record')})
        }
    }catch(e){
        return Exception.handle(e,res, req, 'update');
    }
}

exports.delete = async(req,res) =>{
    try{
        const {id}   = req.body; 
        const object = await Model.findOne({id});
        if(object !=null){
            const message   = (Model.delete({id})) ? Message.deleted(object.block_name) : Message.default();
           // res.status(200).json({status:true,message:message});
            return Response.handle(req, res, 'delete', 200, {status:true,message:message})
        }else{
          //  res.status(404).json({status:false,message:Message.notFound('Record')});
            return Response.handle(req, res, 'delete', 404, {status:false,message:Message.notFound('Record')})
        }
    }catch(e){
        return Exception.handle(e,res, req, 'delete');
    }
}

exports.updateStatus = async(req,res) =>{
    try{
        const {id}   = req.body; 
        const object = await Model.findOne({id});
        if(object !=null){
            const status    = (object.block_status == 1) ? 0 : 1;
            const result    = await Model.update({block_status:status},id);
            const message   = (result) ? Message.status('Record',status) : Message.default();
           // res.status(200).json({status:true,message:message});
            return Response.handle(req, res, 'updateStatus', 200, {status:true,message:message})
        }else{
          //  res.status(404).json({status:false,message:Message.notFound('Record')});
          return Response.handle(req, res, 'updateStatus', 404, {status:false,message:Message.notFound('Record')})
        }
    }catch(e){ 
        return Exception.handle(e,res, req, 'updateStatus');
    }
}

exports.find = async(req,res) =>{
    try{
        //const {id}   = req.body; 
        const object = await Model.find(req.body);
        if(object !=null){
          //  res.status(200).json({status:true,'data':object}); 
            return Response.handle(req, res, 'find', 200, {status:true,'data':object})
        }else{
           // res.status(404).json({status:false,message:Message.notFound('Record')});
            return Response.handle(req, res, 'find', 404, {status:false,message:Message.notFound('Record')})
        }
    }catch(e){
        return Exception.handle(e,res, req, 'find');
    }
}