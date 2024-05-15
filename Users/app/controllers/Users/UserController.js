const express   =   require('express');
const routers   =   express.Router();
const Handler   =   require('../../handlers').User;

routers.post('/',async (req,res)=>{
    return await Handler.index(req,res);
});

routers.post('/create',async (req,res)=>{
    return await Handler.create(req,res);
});

routers.post('/update',async (req,res)=>{
    return await Handler.update(req,res);
});

routers.post('/complete-profile',async (req,res)=>{
    return await Handler.completeProfile(req,res);
});

routers.post('/approve',async (req,res)=>{
    return await Handler.approve(req,res);
});

routers.post('/update-status',async (req,res)=>{
    return await Handler.updateStatus(req,res);
});

routers.post('/find-user',async (req,res)=>{
    return await Handler.findById(req,res);
});

routers.post('/find-user-by-role',async (req,res)=>{
    return await Handler.findUserByRole(req,res);
});

routers.post('/find-user-by-email',async (req,res)=>{
    return await Handler.findByEmail(req,res);
});

routers.post('/find-user-by-mobile',async (req,res)=>{
    return await Handler.findByMobile(req,res);
});

routers.post('/find-user-by-udise',async (req,res)=>{
    return await Handler.findByUdiseCode(req,res);
});

routers.post('/generate-link',async (req,res)=>{
    return await Handler.generateLink(req,res);
});

routers.post('/check-volunteer',async (req,res)=>{
    return await Handler.checkVolunteer(req,res);
});

routers.post('/check-volunteer-offline',async (req,res)=>{
    return await Handler.checkVolunteerOffline(req,res);
})

routers.post('/store-volunteer',async (req,res)=>{
    return await Handler.storeVolunteer(req,res);
});

routers.post('/find-mobile',async (req,res)=>{
    return await Handler.findMobile(req,res);
});

routers.post('/find-email',async (req,res)=>{
    return await Handler.findEmail(req,res);
});

routers.post('/update-edit-user',async (req,res)=>{
    return await Handler.updateEditUser(req,res);
});

routers.post('/fetch-user',async (req,res)=>{
    return await Handler.fetchUser(req,res);
});

routers.post('/update-user',async (req,res)=>{
    return await Handler.updateUser(req,res);
});

routers.post('/fetch-user-profile-picture',async(req,res)=>{
    return await Handler.fetchUserProfilePicture(req,res);
});

routers.post('/update-user-profile-picture',async(req,res)=>{
    return await Handler.updateUserProfilePicture(req,res);
});

module.exports  =   routers;