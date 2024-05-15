const Message   =   require('../../helpers/Message');
const Exception =   require('../Assets/ExceptionHandler');
const Response  =   require('../Assets/ResponseHandler');
const Model     =   require('../../models');

exports.storeVerificationProtocol = (req,res) => {
    const request   =   req.body;
    Model.QuestionMarking.findOne({'id':request.question_id}).then((SQM)=>{
        SQM.update({
            district_id: request.user_id,
            district_marks: request.marks,
            district_remark: request.remark,
            district_protocol_id: request.protocol_id,
            district_varification_at: new Date()
        }).then(()=>{
        //    res.status(200).json({status:true,message:'Question verification done.'});
        return Response.handle(req, res, 'storeVerificationProtocol', 200, {status:true,message:'Question verification done.'})
        }).catch((e)=>{
            // Exception.handle(e,res,req,'');
            // res.status(500).json({message:Message.default()});
            return Response.handle(req, res, 'storeVerificationProtocol', 500, {message:Message.default()})
        });
    }).catch((e)=>{
        // Exception.handle(e,res,req,'');
        // res.status(500).json({message:Message.notFound('Question')});
        return Response.handle(req, res, 'storeVerificationProtocol', 500, {message:Message.notFound('Question')})
    });
}

exports.askToDistrictToMakeCorrections = (req,res) =>{
    const request   =   req.body;
    Model.Benchmark.findOne({udise_code:request.udise}).then((BSchool)=>{
        BSchool.update({reopen:1}).then((BSData)=>{
            if(req.ENV.APP_ENV == 'production'){
                Model.User.findOne({district_id:request.district_id,role_id:6,permision:1}).then((UData)=>{
                    const data ={district:UData.email,district_name:UData.name,school_name:BSData.school_name};
                });
            }
        //    res.status(200).json({status:true,message:'Your request sent to District Nodal officer for approval. Please wait for activation, you will receive email for confirmaiton.'});
            return Response.handle(req, res, 'askToDistrictToMakeCorrections', 200, {status:true,message:'Your request sent to District Nodal officer for approval. Please wait for activation, you will receive email for confirmation.'})
        }).catch((e)=>{
            // Exception.handle(e,res,req,'');
            // return res.status(200).status({status:false,message:Message.updateIssue()});
            return Response.handle(req, res, 'askToDistrictToMakeCorrections', 200, {status:false,message:Message.updateIssue()})
        });
    }).catch((e)=>{
        // Exception.handle(e,res,req,'');
        // res.status(500).json({message:Message.notFound('School')});
        return Response.handle(req, res, 'askToDistrictToMakeCorrections', 500, {message:Message.notFound('School')})
    });
}

exports.storeSchoolDeclaration = async(req,res) =>{
    try{
    const request   =   req.body;
    const BSchool   =   await Model.Benchmark.findOne({udise_code:request.udise});
        if(BSchool  !=null){
            const BSResult = await BSchool.update({school_declartion:request.remark,declartion_flag:1});
            if(BSResult != null){
               // res.status(200).json({status:true,status:true, message:'School remark saved successfully.'});
                return Response.handle(req, res, 'storeSchoolDeclaration', 200, {status:true,status:true, message:'School remark saved successfully.'})
            }
           // return res.status(200).status({status:false,message:Message.updateIssue()});
            return Response.handle(req, res, 'storeSchoolDeclaration', 200, {status:false,message:Message.updateIssue()})
        }else{
          //  res.status(200).json({status:true,status:false,message:Message.notFound('School')});
            return Response.handle(req, res, 'storeSchoolDeclaration', 200, {status:true,status:false,message:Message.notFound('School')})
        }
    }catch(e){
        return Exception.handle(e,res, req, 'storeSchoolDeclaration');
    }
}

exports.isSchoolFinal = async(req,res) => {
    try{
        const request   =   req.body;
        const BSchool   =   await Model.Benchmark.query().select('final_flag').where({udise_code:request.udise});        
        if(BSchool != null){
        //    res.status(200).json({status:true,status:true,final:BSchool[0].final_flag});
            return Response.handle(req, res, 'isSchoolFinal', 200, {status:true,status:true,final:BSchool[0].final_flag})
        }else{
        //    res.status(200).json({status:true,status:false,message:Message.notFound('School')})
            return Response.handle(req, res, 'isSchoolFinal', 200, {status:true,status:false,message:Message.notFound('School')})
        }
    }catch(e){
        return Exception.handle(e,res, req, 'isSchoolFinal');
    }
}

exports.fetchSchoolDeclaration = async(req,res) => {
    try{
        const request   =   req.body;
        const BSchool   =   await Model.Benchmark.query().select('school_declaration').where({udise_code:request.udise});
        if(BSchool != null){
        //    res.status(200).json({status:true,status:true,declaration:BSchool[0].school_declaration});
            return Response.handle(req, res, 'fetchSchoolDeclaration', 200, {status:true,status:true,declaration:BSchool[0].school_declaration})
        }else{
        //    res.status(200).json({status:true,status:false,message:Message.notFound('School')})
            return Response.handle(req, res, 'fetchSchoolDeclaration', 200, {status:true,status:false,message:Message.notFound('School')})
        }
    }catch(e){
        return Exception.handle(e,res, req, 'fetchSchoolDeclaration');
    }
}

exports.fetchSchoolDetail = async (req,res) =>{
    try{
        const request   =   req.body;
        const select    =   [
                                'bs.udise_code','school_name','block_name','district_name','state_name','mgmt_center_id','location_type','final_flag','su.id as school_id',
                                'school_medium','drink_water','pucca_building','electricity','toilet_functional','class_frm','class_to','total_enrolment','school_declaration',
                                'school_type','total_teacher','bs.email','bs.mobile','school_head','msd.name as head_designation','mc.name as category_name','pmshri_category_id',
                                'schemes_id','back_image','front_image','panchayat_letter','commitment_letter'
                            ];

        const data      =   await Model.Benchmark.query().select(select).where({'bs.udise_code':request.udise})
                                    .join('master_categories as mc','mc.id','=','bs.pmshri_category_id')
                                    .join('master_school_designations as msd','msd.id','=','bs.head_designation')
                                    .join('school_users as su','su.udise_code','=','bs.udise_code');
        if(data !==null){
        //    res.status(200).json({status:true,'data':data});
            return Response.handle(req, res, 'fetchSchoolDetail', 200, {status:true,'data':data})
        }else{
        //    res.status(404).json({status:false,message: Message.notFound('School')});
            return Response.handle(req, res, 'fetchSchoolDetail', 200, {status:false,message: Message.notFound('School')})
        }
    }catch(e){
        return Exception.handle(e,res, req, 'fetchSchoolDetail');
    }
}

exports.fetchSchoolQuestionMarkings = async (req,res) =>{
    try{
        const request   =   req.body;
        const data  =  await Model.QuestionMarking.find({'udise_code':request.udise});
        if(data !==null){
        //    res.status(200).json({status:true,'data':data});
            return Response.handle(req, res, 'fetchSchoolQuestionMarkings', 200, {status:true,'data':data})
        }else{
        //    res.status(404).json({status:false,message: Message.notFound('School')});
            return Response.handle(req, res, 'fetchSchoolQuestionMarkings', 404, {status:false,message: Message.notFound('School')})
        }
    }catch(e){
        return Exception.handle(e,res,req,'fetchSchoolQuestionMarkings');
    }
}

exports.fetchSchoolQuestionMarkingSectionWise = async (req,res) =>{
    try{
        const request   =   req.body;
        const data  =  await Model.QuestionMarkingSectionWise.find({'udise_code':request.udise});
        if(data !==null){
        //    res.status(200).json({status:true,'data':data});
            return Response.handle(req, res, 'fetchSchoolQuestionMarkingSectionWise', 200, {status:true,'data':data})
        }else{
        //    res.status(404).json({status:false,message: Message.notFound('School')});
            return Response.handle(req, res, 'fetchSchoolQuestionMarkingSectionWise', 404, {status:false,message: Message.notFound('School')})
        }
    }catch(e){
        return Exception.handle(e,res,req,'fetchSchoolQuestionMarkingSectionWise');
    }
}

exports.fetchSchoolFinalSubmission = async (req,res) =>{
    try{
        const request   =   req.body;
        const data  =  await Model.QuestionMarkingFinalSection.find({'udise_code':request.udise});
        if(data !==null){
        //    res.status(200).json({status:true,'data':data});
            return Response.handle(req, res, 'fetchSchoolFinalSubmission', 200, {status:true,'data':data})
        }else{
        //    res.status(404).json({status:false,message: Message.notFound('School')});
            return Response.handle(req, res, 'fetchSchoolFinalSubmission', 404, {status:false,message: Message.notFound('School')})
        }
    }catch(e){
        return Exception.handle(e,res,req,'fetchSchoolFinalSubmission');
    }
}

exports.fetchSchoolSummary = async (req,res) =>{
    try{
        const request   =   req.body;
        const data   =   await Model.Scheme.query().select('sc.id','sc.name','sc.hindi_name','sc.score as target_marks','sc.question_count','ssw.school_marks as obtain_marks','ssw.created_at as submit_date')
                                          .join('school_section_wises as ssw','ssw.schemes_id','=','sc.id')
                                          .where('ssw.udise_code',request.udise);
        if(data !==null){
        //    res.status(200).json({status:true,'data':data});
            return Response.handle(req, res, 'fetchSchoolSummary', 200, {status:true,'data':data})
        }else{
        //    res.status(404).json({status:false,message: Message.notFound('School')});
            return Response.handle(req, res, 'fetchSchoolSummary', 404, {status:false,message: Message.notFound('School')})
        }
    }catch(e){
        return Exception.handle(e,res,req,'fetchSchoolSummary');
    }
}