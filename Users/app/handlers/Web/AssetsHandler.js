const Model             =   require('../../models');
const Exception         =   require('../Assets/ExceptionHandler');

exports.successStories = async(req,res) =>{
    try{
        const object    =  await Model.VolunteerAsstestMaterialView.query().select("*").limit(10);
        res.status(200).json({status:true,'data':object}); 
    }catch(e){
        return Exception.handle(e,res,req,'');
    }
}

exports.assetsDetail = async(req,res) =>{
    try{
        const request   =   req.body;
        var where       =   {};
        const select    =   [
                                'masc.units','sc.*','s.school_postal_address','s.udise_code','s.school_name',
                                'sm.state_name','dm.district_name','mac.asset_category_name','masc.asset_sub_category_name',
                                's.school_email','s.school_mobile','s.school_state_name','s.school_district_name',
                                's.school_block_name'
                            ];

        var Query   =   Model.SchoolContributions.query().
                            join('master_schools as s','s.id','=','sc.school_id').
                            join('master_states as sm','sm.id','=','sc.asset_state_id').
                            join('master_districts as dm','dm.id','=','sc.asset_district_id').
                            join('master_asset_categories as mac','mac.id','=','sc.asset_category_id').
                            join('master_asset_sub_categories as masc','masc.id','=','sc.asset_sub_category_id');

        if(request.id > 0 ){
            var where   =   {...where,...{'sc.id':request.id}};
        }
        
        const count     =   (await Query.select('sc.id').where(where)).length;
        const object    =   await Query.select(select).where(where);
        res.status(200).json({status:true,'data':object,'count':count}); 
    }catch(e){
        return Exception.handle(e,res,req,'');
    }
}
exports.volunteerParticipationStatus = async (req, res) => {
    try {
        const request = req.body;
        const select = ['cv.volunteer_status','cv.contribution_by_volunteer','cv.accepted_by_school'];
        var volunteerStatus = await Model.ContributionVolunteers.query().select(select).where({ 'cv.school_assets_post_id': request.id, 'cv.volunteer_id': request.vid });
        if (volunteerStatus.length > 0) {
            res.status(200).json({ status: true, 'VolunteerStatus': volunteerStatus[0].volunteer_status,'contributionByVolunteer': volunteerStatus[0].contribution_by_volunteer});
        } else {
            res.status(200).json({ status: true, 'VolunteerStatus': 0 });
        }
    } catch (e) {
        return Exception.handle(e,res,req,'');
    }
}

exports.assetsList = async(req,res) =>{
    try{
        const object    =  await Model.AssetCategory.query().select('id','asset_category_name as name','sub_cat_count as count').where({'asset_category_status':1}).orderBy('asset_category_name');
        res.status(200).json({status:true,'data':object}); 
    }catch(e){
        return Exception.handle(e,res,req,'');
    }
}

// exports.subAssetsList = async(req,res) =>{
//     try{
//         const object    =  await Model.AssetSubCategory.query().select('id','asset_category_id as parent_id','asset_sub_category_name as name').where({'asset_sub_category_status':1}).orderBy('asset_sub_category_name');
//         res.status(200).json({status:true,'data':object}); 
//     }catch(e){
//         return Exception.handle(e,res,req,'');
//     }
// }


// exports.subAssetsList = async(req,res) =>{
//     try{
//         const PG    = require('../../../config/database/postgres');
//         const request   =   req.body;
//         const offset_value = request.limit*(request.page-1);
//         const limit_value  = request.limit;
//         const object =   await PG.query(`select sap.asset_category_id as parent_id,
//         sap.asset_sub_category_id as id,
//         masc.asset_sub_category_name as name,
//         count(sap.id) 
//         from school_assets_posts sap 
//         left join master_asset_sub_categories masc 
//         on masc.id =  sap.asset_sub_category_id
//         where sap.asset_last_application_date>=CURRENT_DATE and sap.application_status=0
//         group by sap.asset_category_id,sap.asset_sub_category_id,masc.asset_sub_category_name
//         order by sap.asset_category_id,sap.asset_sub_category_id`);        
//         res.status(200).json({status:true,'data':object.rows});
//     }catch(e){
//         return Exception.handle(e,res,req,'');
//     }
// }

exports.subAssetsList = async(req,res) =>{
    try{
        const PG    = require('../../../config/database/postgres');
        const request   =   req.body;
        const offset_value = request.limit*(request.page-1);
        const limit_value  = request.limit;
        const object =   await PG.query(`select masc.asset_category_id as parent_id, masc.id,masc.asset_sub_category_name as name, count(*) from master_asset_sub_categories masc 
        left join school_assets_posts sap on sap.asset_sub_category_id = masc.id and sap.asset_status = 1 and sap.asset_last_application_date >= current_date 
        where masc.asset_sub_category_status = 1 
        group by masc.id,masc.asset_category_id,masc.asset_sub_category_name 
        order by masc.asset_category_id`);        
        res.status(200).json({status:true,'data':object.rows});
    }catch(e){
        return Exception.handle(e,res,req,'');
    }
}


exports.contributeAssetsList = async(req,res) =>{
    try{
        const request   =   req.body;
        var where       =   {};
        var todayDate   =   new Date().toISOString().slice(0, 10);
        var Query       =   Model.ContributionView.query().where('asset_last_application_date','>=',todayDate); 

        if(request.search !==null){
            var Query   =   Query.whereILike('state_name',`%${request.search}%`)
                                 .orWhereILike('district_name',`%${request.search}%`)
                                 .orWhereILike('asset_category_name',`%${request.search}%`)
                                 .orWhereILike('asset_sub_category_name',`%${request.search}%`)
                                 .orWhereILike('school_name',`%${request.search}%`);
        }

        if(request.state > 0){
            var Query   =   Query.where({'asset_state_id':request.state});
        }

        if(request.district > 0){
            var Query   =   Query.where({'asset_district_id':request.district});
        }

        if(request.category > 0){
            var Query   =   Query.where({'asset_category_id':request.category});
        } 

        if(request.subcategory.length > 0){
            var Query   = Query.where((Query)=>{
                return request.subcategory.map(value=>{
                    if(value > 0){
                        Query.orWhere({'asset_sub_category_id':value});
                    }
                })
            });
        }

        const count     =   (await Query.select('id')).length;
        const object    =   await Query.select("*").limit(request.limit).offset(request.limit*(request.page-1));

        return res.status(200).json({status:true,'data':object,'count':count}); 
    }catch(e){
        return Exception.handle(e,res,req,'');
    }
}
