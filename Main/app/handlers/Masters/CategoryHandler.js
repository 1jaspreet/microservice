const Model     =   require('../../models').Category;
const Message   =   require('../../helpers/Message');
const Exception =   require('../Assets/ExceptionHandler');
const Response = require('../Assets/ResponseHandler')

exports.index = async(req,res) =>{
    try{
        const object = await Model.all();
    //    res.status(200).json({status:true,'data':object}); 
        return Response.handle(req, res, 'index', 200, {status:true,'data':object})
    }catch(e){
        return Exception.handle(e,res,req,'index');
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
        const {category_name} = req.body;
        const result    = await Model.findOne({category_name}); 
        if(result.length == 0){ 
            const object    = await Model.create({category_name});
            const message   = (object) ? Message.created(category_name) : Message.default(); 
        //    res.status(200).json({status:true,message:message}); 
            return Response.handle(req, res, 'create', 200, {status:true,message:message})
        }else{
        //    res.status(200).json({status:false,message:Message.duplicate(category_name)});
            return Response.handle(req, res, 'create', 200, {status:false,message:Message.duplicate(category_name)})
        }
    }catch(e){
        return Exception.handle(e,res,req,'create');
    }
}

exports.update = async(req,res) =>{
    try{
        const {category_name,id}  = req.body; 
        const result = await Model.findOne({id});
        if(result !=null){
            const object    = await Model.update({category_name},id);
            const message   = (object) ? Message.updated(category_name) : Message.default(); 
        //    res.status(200).json({status:true,message:message}); 
            return Response.handle(req, res, 'update', 200, {status:true,message:message})
        }else{
        //    res.status(200).json({status:false,message:Message.notFound('Record')});
            return Response.handle(req, res, 'update', 404, {status:false,message:Message.notFound('Record')})
        }
    }catch(e){
        return Exception.handle(e,res,req,'update');
    }
}

exports.delete = async(req,res) =>{
    try{
        const {id}   = req.body; 
        const object = await Model.findOne({id});
        if(object !=null){
            const message   = (Model.delete({id})) ? Message.deleted(object.category_name) : Message.default();
        //    res.status(200).json({status:true,message:message});
            return Response.handle(req, res, 'delete', 200, {status:true,message:message})
        }else{
        //    res.status(404).json({status:false,message:Message.notFound('Record')});
            return Response.handle(req, res, 'delete', 404, {status:false,message:Message.notFound('Record')})
        }
    }catch(e){
        return Exception.handle(e,res,req,'delete');
    }
}

exports.updateStatus = async(req,res) =>{
    try{
        const {id}   = req.body; 
        const object = await Model.findOne({id});
        if(object !=null){
            const status    = (object.status == 1) ? 0 : 1;
            const result    = await Model.update({status:status},id);
            const message   = (result) ? Message.status('Record',status) : Message.default();
        //    res.status(200).json({status:true,message:message});
            return Response.handle(req, res, 'updateStatus', 200, {status:true,message:message})
        }else{
        //    res.status(404).json({status:false,message:Message.notFound('Record')});
            return Response.handle(req, res, 'updateStatus', 404, {status:false,message:Message.notFound('Record')})
        }
    }catch(e){ 
        return Exception.handle(e,res,req,'updateStatus');
    }
}

exports.find = async(req,res) =>{
    try{
        const {id}   = req.body; 
        const object = await Model.findOne({id});
        if(object !=null){
        //    res.status(200).json({status:true,'data':object}); 
            return Response.handle(req, res, 'find', 200, {status:true,'data':object})
        }else{
        //    res.status(404).json({status:false,message:Message.notFound('Record')});
            return Response.handle(req, res, 'find', 404, {status:false,message:Message.notFound('Record')})
        }
    }catch(e){
        return Exception.handle(e,res,req,'find');
    }
}