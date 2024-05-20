const ActivitiesView  =   require('../../models').ActivitiesView;
const ContributionView  =   require('../../models').ContributionView;
const ActivityVolunteerModel    =   require('../../models').VolunteersActivities;
const ContributionVolunteers    =   require('../../models').ContributionVolunteers;
const Message           =   require('../../helpers/Message');
const { ClassCategory } = require('../../models');
const Exception         =   require('../Assets/ExceptionHandler');
const Response          = require('../Assets/ResponseHandler')
const dateTime          =   require('node-datetime');

exports.index = async(req,res) =>{
    /*try{
        const request   =   req.body;
        var where       =   {};
        var Query       =   ActivitiesView.query();                        
         
        if(request.catId > 0){
            var where   =   {...where,'activity_category_id':request.catId};
        } 
        if(request.subCatId > 0){
            var where   =   {...where,'activity_sub_category_id':request.subCatId};
        }
            
        const count     =   (await Query.select('id').where(where)).length;
        const object    =   await Query.select("*").where(where).limit(request.limit).offset(request.limit*(request.page-1));
        res.status(200).json({status:true,'data':object,'count':count}); 
    }catch(e){
        return Exception.handle(e,res,req,'');
    }*/
}

exports.assets = async(req,res) =>{
    try{
        const request   =   req.body;
        var where       =   {};
        var Query       =   ContributionView.query();                        
         
        if(request.catId > 0){
            var where   =   {...where,'asset_category_id':request.catId};
        } 
        if(request.subCatId > 0){
            var where   =   {...where,'asset_sub_category':request.subCatId};
        }

        const count     =   (await Query.select('id').where(where)).length;
        const object    =   await Query.select("*").where(where).limit(request.limit).offset(request.limit*(request.page-1));
    //    res.status(200).json({status:true,'data':object,'count':count}); 
        return Response.handle(req, res, 'assets', 200, {status:true,'data':object,'count':count})
    }catch(e){
        return Exception.handle(e,res,req,'assets');
    }
}

exports.volunteerParticipate =  async (req,res) => {
    try {
        const request = req.body;
        const data = {
            school_activity_post_id: request.activity_id,
            volunteer_id: request.volunteer_id,
            volunteer_status: request.status
        }

        const checkResult = await ActivityVolunteerModel.findOne({ school_activity_post_id: request.activity_id, volunteer_id: request.volunteer_id });
        
        if (checkResult === undefined) {
            const result = await ActivityVolunteerModel.create(data);
            var message = (result) ? Message.participated('Your') : Message.default();
        //    res.status(200).json({ status: true, message: message });
            return Response.handle(req, res, 'volunteerParticipate', 200, { status: true, message: message })
        } else {
        //    res.status(200).json({ status: false, message: 'You already participated !' });
            return Response.handle(req, res, 'volunteerParticipate', 200, { status: false, message: 'You already participated !' })
        }
    } catch (e) {
        return Exception.handle(e,res,req,'volunteerParticipate');
    }
}
exports.volunteerContribute =  async (req,res) => {
    try {
        const request = req.body;
        const data = {
            school_assets_post_id: request.contribution_id,
            volunteer_id: request.volunteer_id,
            asset_qty: request.asset_quantity,
            contribution_by_volunteer: request.contribution_by_volunteer,
            volunteer_status: 'Pending'

        }
        const checkResult = await ContributionVolunteers.findOne({ school_assets_post_id: request.contribution_id, volunteer_id: request.volunteer_id });
        
        if (checkResult === undefined) {
            const result = await ContributionVolunteers.create(data);
            var message = (result) ? Message.contribute('You') : Message.default();
        //    res.status(200).json({ status: true, message: message });
            return Response.handle(req, res, 'assets', 200, { status: true, message: message })
        } else {
            await ContributionVolunteers.query().where({'school_assets_post_id':request.contribution_id,'volunteer_id':request.volunteer_id}).update(data);
        //    return res.status(200).json({ status: true, message: Message.contribute('You') });
            return Response.handle(req, res, 'assets', 200, { status: true, message: Message.contribute('You') })
           
        }
    } catch (e) {
        return Exception.handle(e,res,req,'volunteerContribute');
    }
}
