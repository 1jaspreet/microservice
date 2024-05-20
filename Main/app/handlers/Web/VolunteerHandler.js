const Model             =   require('../../models');
const Exception         =   require('../Assets/ExceptionHandler');

exports.volunteerProgrammeCounts = async(req,res) =>{
    try{
        const VRegistered    =  await Model.Volunteers.count({});
        const OSchool        =  await Model.School.count({school_onboard:1});
        const CImpacted      =  (await Model.Activities.query().sum('impected_students'))[0].sum;
        res.status(200).json({status:true,VolunteersRegistered:VRegistered,OnboardedSchool:OSchool,ChildrenImpacted:CImpacted}); 
    }catch(e){
        return Exception.handle(e,res,req,'');
    }
}