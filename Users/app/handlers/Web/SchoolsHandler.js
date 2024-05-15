const Model             =   require('../../models');
const Exception         =   require('../Assets/ExceptionHandler');

exports.onBoardSchools = async(req,res) =>{
    try{
        const request   =   req.body;
        var where       =   {};
        const select    =   [
                                'ms.id','udise_code','school_name','mst.school_type_name','msc.school_category_name',
                                'school_class_from', 'school_class_to','msm.school_management_name','school_address',
                                'sm.state_name','dm.district_name','bm.block_name','school_onboard'
                            ];
        
        var Query       =   Model.School.query()
                            .join('master_school_categories as msc','msc.id','=','school_category')
                            .join('master_school_managements as msm','msm.id','=','school_management_center')
                            .leftOuterJoin('master_school_types as mst', function() { this.on('mst.id', '=', 'school_type');})
                            .leftOuterJoin('master_states as sm', function() { this.on('sm.id', '=', 'school_state_id');})
                            .leftOuterJoin('master_districts as dm', function() { this.on('dm.id', '=', 'school_district_id');})
                            .leftOuterJoin('master_blocks as bm', function() { this.on('bm.id', '=', 'school_block_id'); })

        if(request.schoolName !== null && request.schoolName != 0){
            var Query   =   Query.whereILike('school_name',`%${request.schoolName}%`)
        }
        if(request.state > 0){
            var where   =   {...where,...{'school_state_id':request.state}};
        } 
        if(request.district > 0){
            var where   =   {...where,...{'school_district_id':request.district}};
        }   
        if(request.block > 0){
            var where   =   {...where,...{'school_block_id':request.block}};
        }  
        if(request.onboard !== null ){
            var where   =   {...where,...{'school_onboard':request.onboard}};
        }               
       
        const object    =   await Query.select(select).where(where).limit(request.limit).offset(request.limit*(request.page-1))                   
       
        const count     =   await Model.School.count(where);

        res.status(200).json({status:true,'data':object,'count':count}); 
    }catch(e){
        return Exception.handle(e,res,req,'');
    }
}