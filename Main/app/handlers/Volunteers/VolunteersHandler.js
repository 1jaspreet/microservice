const Model                         =   require('../../models').Activities;
const MasterBadge                   =   require('../../models').MasterBadge;
const UserModel                     =   require('../../models').User;
const VolunteerRating               =   require('../../models').VolunteerRating;
const ContributionView              =   require('../../models').ContributionView;
const VolunteerAsstestMaterialView  =   require('../../models').VolunteerAsstestMaterialView;
const SchoolAsstestMaterialView     =   require('../../models').SchoolAsstestMaterialView;
const TimelineModel                 =   require('../../models').ActivityTimeline;
const SchoolModel                   =   require('../../models').School;
const ActivityVolunteers            =   require('../../models').VolunteersActivities
const ContributionVolunteers        =   require('../../models').ContributionVolunteers
const Volunteers                    = require('../../models').Volunteers;
const Message                       =   require('../../helpers/Message');
const Helper                        =   require('../../helpers/Helper');
const Exception                     =   require('../Assets/ExceptionHandler');
const dateTime                      =   require('node-datetime');

const DB    = require('../../../config/database/connection');

exports.activities = async(req,res) =>{
    try{
        const request   =   req.body;
        var where       =   {};

        const select    =   [
                                'ac.activity_closed','av.rate_school','av.volunteer_status','ms.school_name','mac.activity_sub_category_name as activity_name','ac.activity_last_reciving_date',
                                'ac.activity_tentative_start_date','ac.id','av.id as avid','ms.id as school_id'
                            ];

        var Query       =   ActivityVolunteers.query().
                                leftJoin('school_activities_posts as ac','ac.id','=','av.school_activity_post_id').
                                leftJoin('master_schools as ms','ms.id','=','ac.school_id').
                                leftJoin('master_activity_sub_categories as mac','mac.id','=','ac.activity_sub_category_id');
          
        if(request.volunteerId > 0){
            var where   =   {...where,...{'av.volunteer_id':request.volunteerId}};            
            var where   =   {...where,...{'av.application_status':request.status}};
        }  

        const count     =   (await ActivityVolunteers.count(where));
        const object    =   await Query.select(select).where(where).limit(request.limit).orderBy('av.id','desc').offset(request.limit*(request.page-1));

        res.status(200).json({status:true,'data':object,'count':count}); 
    }catch(e){
        return Exception.handle(e,res,req,'');
    }
}

exports.contributions = async(req,res) =>{
    try{
        const request   =   req.body;
        var where       =   {};

        const select    =   [
                                'acp.asset_closed','cv.rate_school','cv.volunteer_status','ms.school_name','mac.asset_sub_category_name as material_name','acp.asset_expected_date',
                                'acp.asset_quantity','acp.id','cv.id as cvid','ms.id as school_id'
                            ];

        var Query       =   ContributionVolunteers.query().
                                rightJoin('school_assets_posts as acp','acp.id','=','cv.school_assets_post_id').
                                rightJoin('master_schools as ms','ms.id','=','acp.school_id').
                                rightJoin('master_asset_sub_categories as mac','mac.id','=','acp.asset_sub_category_id');

        if(request.volunteerId > 0){
            var where   =   {...where,...{'cv.volunteer_id':request.volunteerId}};            
            var where   =   {...where,...{'cv.application_status':request.status}};
        } 
        
        const count     =   (await ContributionVolunteers.count(where));
        const object    =   await Query.select(select).where(where).limit(request.limit).orderBy('cv.id','desc').offset(request.limit*(request.page-1));
        res.status(200).json({status:true,'data':object,'count':count}); 
    }catch(e){
        return Exception.handle(e,res,req,'');
    }
}

exports.contributionsBack = async(req,res) =>{
    try{
        const request   =   req.body;
        var where       =   {};
        var Query   =   VolunteerAsstestMaterialView.query().select("*");                      

        if(request.udicecode > 0 && request.udicecode.length === 11){
            var where   =   {...where,...{'va.udise_code':request.udicecode}};
        }else{ 
            if(request.state > 0){
                var where   =   {...where,...{'va.activity_state_id':request.state}};
            } 
            if(request.district > 0){
                var where   =   {...where,...{'va.activity_district_id':request.district}};
            } 
            if(request.gender > 0){
                var where   =   {...where,...{'va.gender_id':request.gender}};
            }  
            if(request.specialization > 0){
                var where   =   {...where,...{'va.specialization_id':request.specialization}};
            } 
            if(request.category > 0){
                var where   =   {...where,...{'va.activity_category_id':request.category}};
            }  
            if(request.volunteerId > 0){
                var where   =   {...where,...{'vam.volunteer_id':request.volunteerId}};
            }                             
        }
        
        const count     =   (await Query.select('vam.volunteer_id').where(where)).length;
        const object    =   await Query.where(where).limit(request.limit).orderBy('volunteer_id','desc').offset(request.limit*(request.page-1));
        res.status(200).json({status:true,'data':object,'count':count}); 
    }catch(e){
        return Exception.handle(e,res,req,'');
    }
}

exports.assetsDetailVolunteer = async(req,res) =>{
    try{
        const request   =   req.body;
        var where       =   {};
      if(request.id > 0 ){
            var where   =   {...where,...{'id':request.id}};
        }        
        const object    =   await VolunteerAsstestMaterialView.query().select("*").where(where);
        res.status(200).json({status:true,'data':object[0]}); 
    }catch(e){
        return Exception.handle(e,res,req,'');
    }
}

exports.assetsDetailSchool = async(req,res) =>{
    try{
        const request   =   req.body;
        var where       =   {};
      if(request.id > 0 ){
            var where   =   {...where,...{'id':request.id}};
        }        
        const object    =   await ContributionView.query().select("*").where(where);
        res.status(200).json({status:true,'data':object[0]}); 
    }catch(e){
        return Exception.handle(e,res,req,'');
    }
}

exports.activityTotal = async(req,res) =>{
    try{
        const request   =   req.body;
        var where       =   {};      
        if(request.volunteer_id > 0 ){
            var where   =   {...where,...{'av.volunteer_id':request.volunteer_id}};
        }        
        
        const total_count       =   (await ActivityVolunteers.count(where));
        const total_completed   =   (await ActivityVolunteers.query().select('av.id').leftJoin('school_activities_posts as acp','acp.id','=','av.school_activity_post_id').where(where).where({'av.application_status':1})).length;
        const total_pending     =   (await ActivityVolunteers.query().select('av.id').leftJoin('school_activities_posts as acp','acp.id','=','av.school_activity_post_id').where(where).where({'av.application_status':0})).length;
        const total_other       =   (await ActivityVolunteers.query().select('av.id').leftJoin('school_activities_posts as acp','acp.id','=','av.school_activity_post_id').where(where).where({'av.application_status':2})).length;        
        res.status(200).json({status:true,'total_count':total_count,'total_completed':total_completed,'total_pending':total_pending,'total_other':total_other}); 
    }catch(e){
        return Exception.handle(e,res,req,'');
    }
}


exports.AssetsTotal = async(req,res) =>{
    try{
        try{
            const request   =   req.body;
            var where       =   {};      
            if(request.volunteer_id > 0 ){
                var where   =   {...where,...{'cv.volunteer_id':request.volunteer_id}};
            }        
            const total_count       =   (await ContributionVolunteers.count(where));
            const total_completed   =   (await ContributionVolunteers.query().select('cv.id').leftJoin('school_assets_posts as acp','acp.id','=','cv.school_assets_post_id').where(where).where({'cv.application_status':1})).length;
            const total_pending     =   (await ContributionVolunteers.query().select('cv.id').leftJoin('school_assets_posts as acp','acp.id','=','cv.school_assets_post_id').where(where).where({'cv.application_status':0})).length;
            const total_other       =   (await ContributionVolunteers.query().select('cv.id').leftJoin('school_assets_posts as acp','acp.id','=','cv.school_assets_post_id').where(where).where({'cv.application_status':2})).length;        
            res.status(200).json({status:true,'total_count':total_count,'total_completed':total_completed,'total_pending':total_pending,'total_other':total_other}); 
        }catch(e){
            return Exception.handle(e,res,req,'');
        }
    }catch(e){
        return Exception.handle(e,res,req,'');
    }
}

exports.activityDetail = async(req,res) =>{
    try{
        const request   =   req.body;
        var where       =   {};
        const select    =   [
                                'ac.*','ms.specialization_name','s.school_postal_address','mg.gender_name','s.udise_code','s.school_name',
                                'sm.state_name','dm.district_name','mac.activity_category_name','masc.activity_sub_category_name',
                                's.school_email','s.school_mobile','s.school_state_name','s.school_district_name',
                                's.school_block_name'
                            ];

        var Query   =   Model.query().
                            join('master_schools as s','s.id','=','ac.school_id').
                            join('master_states as sm','sm.id','=','ac.activity_state_id').
                            join('master_districts as dm','dm.id','=','ac.activity_district_id').
                            join('master_activity_categories as mac','mac.id','=','ac.activity_category_id').
                            join('master_activity_sub_categories as masc','masc.id','=','ac.activity_sub_category_id').
                            join('master_specializations as ms','ms.id','=','ac.specialization_id').
                            join('master_genders as mg','mg.id','=','ac.gender_id');

        if(request.id > 0 ){
            var where   =   {...where,...{'ac.id':request.id}};
        }
        
        const count     =   (await Query.select('ac.id').where(where)).length;
        const object    =   await Query.select(select).where(where);
        res.status(200).json({status:true,'data':object,'count':count}); 
    }catch(e){
        return Exception.handle(e,res,req,'');
    }
}

exports.volunteerList = async(req,res) =>{
    try{
        const request   =   req.body;
        var where       =   {};
        const select    =   ['u.user_name','u.user_mobile','u.user_email','ms.state_name','md.district_name','av.status','av.meeting_date'];

        var Query   =   ActivityVolunteers.query().
                            join('activities as a','a.id','=','av.activity_id').
                            join('users as u','u.id','=','av.volunteer_id').
                            join('master_states as ms','ms.id','=','a.activity_state_id').
                            join('master_districts as md','md.id','=','a.activity_district_id');

        if(request.id > 0 ){
            var where   =   {...where,...{'av.activity_id':request.id}};
        }       
        const count     =   (await Query.select('av.id').where(where)).length;
        const object    =   await Query.select(select).where(where);
        res.status(200).json({status:true,'data':object,'count':count}); 
    }catch(e){
        return Exception.handle(e,res,req,'');
    }
}

exports.activityImage = async(req,res) =>{
    try{
        const request   =   req.body;
        var where       =   {};
      if(request.id > 0 ){
            var where   =   {...where,...{'activity_id':request.id}};
        }        
        const object    =   await TimelineModel.query().select(['activity_image']).where(where);
        res.status(200).json({status:true,'data':object}); 
    }catch(e){
        return Exception.handle(e,res,req,'');
    }
}

exports.schoolProfile = async(req,res) =>{
    try{
        const request   =   req.body;
        var where       =   {};
        if(request.id > 0 ){
            var where   =   {...where,...{'ms.id':request.id}};
        }  
        
        const select = ['ms.school_name','ms.school_mobile','ms.school_email','ms.school_address','ms.school_postal_code','mst.state_name']      
        var Query   =   SchoolModel.query().
                            join('master_states as mst','mst.id','=','ms.school_state_id');
                            //join('master_districts as md','md.id','=','u.user_district_id');
                            //join('master_school_categories as msc','msc.id','=','ms.school_category');
       
        const object    =    await Query.select(select).where(where);
      
        res.status(200).json({status:true,'data':object[0]}); 
    }catch(e){
        return Exception.handle(e,res,req,'');
    }
}

exports.volunteerProfile = async(req,res) =>{
    try{
        const request   =   req.body;
        var where       =   {};
        if(request.id > 0 ){
            var where   =   {...where,...{'u.id':request.id}};
        }  
        
        const select = ['u.user_name','u.user_mobile','u.user_email','u.user_address','u.user_postal_code','ms.state_name']      
        var Query   =   UserModel.query().
                            join('master_states as ms','ms.id','=','u.user_state_id');
                            //join('master_districts as md','md.id','=','u.user_district_id');
                            //join('master_school_categories as msc','msc.id','=','ms.school_category');
       
        const object    =    await Query.select(select).where(where);
        res.status(200).json({status:true,'data':object[0]}); 
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
            res.status(200).json({status:true,'data':object}); 
        }else{
            res.status(404).json({status:false,message:Message.notFound('Record')});
        }
    }catch(e){
        return Exception.handle(e,res,req,'');
    }
}


exports.getRating = async(req,res) =>{
    try{
        const PG    = require('../../../config/database/postgres');
        const request   =   req.body; 
        if(request.flag === 'volunteer'){      
            const object =   await PG.query(`select  AVG(volunteers_rating.rate) AS avgRate from volunteers_rating where volunteers_rating.volunteer_id=${request.Id}`);
            return res.status(200).json({status:true,'data':object.rows[0]});
        }else{
            const object =   await PG.query(`select  AVG(schools_rating.rate) AS avgRate from schools_rating where schools_rating.school_id=${request.Id}`);
            res.status(200).json({status:true,'data':object.rows[0]});  
        }
    }catch(e){
        return Exception.handle(e,res,req,'');
    }
}

exports.getSchoolRating = async(req,res) =>{
    try{
        const PG    = require('../../../config/database/postgres');
        const request   =   req.body;       
        const object =   await PG.query(`select  AVG(schools_rating.rate) AS avgRate from schools_rating where schools_rating.school_id=${request.schoolId}`);
       res.status(200).json({status:true,'data':object.rows[0]});
    }catch(e){
        return Exception.handle(e,res,req,'');
    }
}

exports.getBadge = async(req,res) =>{
    try{
        const request   = req.body; 
        const vdata = await Volunteers.findOne({id:request.volunteerId});
        if(vdata !=null){
            const badgeData = await MasterBadge.findOne({id:vdata.badge_id});            
            res.status(200).json({status:true,'data':badgeData}); 
        }else{
            res.status(404).json({status:false,message:Message.notFound('Record')});
        }
    }catch(e){
        return Exception.handle(e,res,req,'');
    }
}

