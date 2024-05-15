const PreferenceVolunteers             =   require('../../models').PreferenceVolunteers;
const TimelineModel     =   require('../../models').ActivityTimeline;
const SchoolModel       =   require('../../models').School;
const VolunteerModel    =   require('../../models').VolunteersActivities
const User              =   require('../../models').User;
const Message           =   require('../../helpers/Message');
const Exception         =   require('../Assets/ExceptionHandler');

exports.index = async(req,res) =>{
    try{
        const PG    = require('../../../config/database/postgres');
        const request   =   req.body;
        const offset_value = request.limit*(request.page-1);
        const limit_value  = request.limit; 
        // console.log(limit_value,offset_value);
        const object      =   await PG.query(`select
        ap.id as id,
        ap.user_id as user_id,
        users.user_email as email,
        users.user_mobile as mobile,
        users.user_name as name,
        ms.state_name,
        md.district_name,
        (
            select string_agg(categoryname::text,' | ') from
            (
            select aa.*, mstact.activity_sub_category_name categoryname from
            (
            select pref.id,
            unnest(regexp_split_to_array(activity_type_master_id,',')) bb
            from public.activity_preferences  pref 
            where district_id=713 
            and id=ap.id 
            --and id!=13327
            and coalesce(length(activity_type_master_id),0)> 0
            ) aa
            inner join public.master_activity_sub_categories mstact
            on aa.bb::integer=mstact.id::integer
            ) interest
            group by id 
    ) interest,
    (
        select string_agg(assetscategoryname::text,' | ') from
        (
        select aa.*, mstact.asset_sub_category_name assetscategoryname from
        (
        select pref.id,
        unnest(regexp_split_to_array(contribution_type_master_id,',')) bb
        from public.activity_preferences  pref 
        where district_id=713 
        and id=ap.id 
        --and id!=13327
        and coalesce(length(contribution_type_master_id),0)> 0
        ) aa
        inner join public.master_asset_sub_categories mstact
        on aa.bb::integer=mstact.id::integer
        ) interest
        group by id 
    ) assetinterest
        from
            activity_preferences ap
        join users on
            users.id = ap.user_id
        join master_states ms on
            ms.id = users.user_state_id
        join master_districts md on
            md.id = users.user_district_id
        
        where
        ap.district_id =713
        and coalesce(length(activity_type_master_id),0)> 0  limit ${limit_value} offset ${offset_value}`);
        const count      =   await PG.query(`select count(id) as cnt from activity_preferences as ap where ap.district_id = 713`);
        res.status(200).json({status:true,'data':object.rows,'count':count.rows[0].cnt}); 
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
        const select    =   [
                                'u.user_name','u.user_mobile','u.user_email','ms.state_name','md.district_name'
                            ];

        var Query   =   VolunteerModel.query().
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

exports.schoolDetail = async(req,res) =>{
    try{
        const request   =   req.body;
        var where       =   {};
      if(request.id > 0 ){
            var where   =   {...where,...{'id':request.id}};
        }  
        const select = ['udise_code','school_name','school_email','school_mobile','school_address','school_state_name','school_district_name','school_block_name']      
        const object    =   await SchoolModel.query().select(select).where(where);
        res.status(200).json({status:true,'data':object}); 
    }catch(e){
        return Exception.handle(e,res,req,'');
    }
}

exports.update = async(req,res) =>{
    try{ 
        const {state_name,id}  = req.body; 
        const result = await Model.findOne({id});
        if(result !=null){
            const object    = await Model.update({state_name},id);
            const message   = (object) ? Message.updated(state_name) : Message.default(); 
            res.status(200).json({status:true,message:message}); 
        }else{
            res.status(200).json({status:false,message:Message.notFound('Record')});
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
            res.status(200).json({status:true,'data':object}); 
        }else{
            res.status(404).json({status:false,message:Message.notFound('Record')});
        }
    }catch(e){
        return Exception.handle(e,res,req,'');
    }
}