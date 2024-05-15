const express   =   require('express');
const routers   =   express.Router();
const Handler   =   require('../../handlers').School;

routers.post('/onboard-school',async (req,res)=>{
    return await Handler.onboardSchool(req,res);
});

routers.post('/marks',async (req,res)=>{
    return await Handler.marks(req,res);
});

routers.post('/preview',async (req,res)=>{
    return await Handler.preview(req,res);
});

routers.post('/store-final',async (req,res)=>{
    return await Handler.final(req,res);
});

routers.post('/ask-to-district-to-make-corrections',async (req,res)=>{
    return Handler.askToDistrictToMakeCorrections(req, res);
});

routers.post('/store-school-declaration',async (req,res)=>{
    return await Handler.storeSchoolDeclaration(req,res);
});

routers.post('/store-documents',async (req,res)=>{
    return await Handler.storeDocuments(req,res);
});

routers.post('/fetch-documents',async (req,res)=>{
    return await Handler.fetchDocuments(req,res);
});

routers.post('/store-varification-protocol',(req,res)=>{
    return Handler.storeVerificationProtocol(req, res);
});

routers.post('/is-school-final',async (req,res)=>{                  
    return await Handler.isSchoolFinal(req,res);
});

routers.post('/fetch-school-declaration',async (req,res)=>{
    return await Handler.fetchSchoolDeclaration(req,res);
});

routers.post('/fetch-school-detail',async (req,res)=>{                 
    return await Handler.fetchSchoolDetail(req,res);
});

routers.post('/fetch-school-question-markings',async (req,res)=>{                 
    return await Handler.fetchSchoolQuestionMarkings(req,res);
});

routers.post('/fetch-school-question-marking-section-wise',async (req,res)=>{                 
    return await Handler.fetchSchoolQuestionMarkingSectionWise(req,res);
});

routers.post('/fetch-school-final-submission',async (req,res)=>{                 
    return await Handler.fetchSchoolFinalSubmission(req,res);
});

routers.post('/fetch-school-summary',async (req,res)=>{                 
    return await Handler.fetchSchoolSummary(req,res);
});




module.exports = routers;