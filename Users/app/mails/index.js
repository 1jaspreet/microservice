const Mailer        =   require('../libraries/mailer');
const ejs           =   require("ejs");
const path          =   require("path");
const fs            =   require('fs-extra');

const getLayout   =   async (body) =>{ 
    const layout  =   ejs.compile(await fs.readFile(path.join(process.cwd(),'resourses/views/mail/layout.ejs'), 'utf8'));        
    return layout({'body':body});
}

const getTemplate   =   async (filename,data) =>{
    console.log(data);
    const template  =   ejs.compile(await fs.readFile(path.join(process.cwd(),`resourses/views/mail/${filename}.ejs`), 'utf8')); 
    const body      =   template({'data':data});       
    return getLayout(body);
}

exports.sendOTP = async(req,object) =>{
    console.log("object---------", object)
    const data  =   {OTP:object.OTP};
    getTemplate('send-otp',data).then(body=>{       
        req.mail    =   {'to':object.to,'subject':'PRABANDH: OTP ( One Time Password )','body':body};
        let mailres = Mailer.sendMail(req);
        
        console.log("mailres------------------", mailres)
    });
}

exports.createUser = async(req,object) =>{
    getTemplate('create-user',object).then((body)=>{
        req.mail    =   {'to':object.to,'subject':'Account Created PRABANDH','body':body};
        Mailer.sendMail(req);
    });
}

exports.updateUser = async(req,object) =>{
    getTemplate('update-user',object).then((body)=>{
        req.mail    =   {'to':object.to, 'subject':object.subject , 'body':body};
        Mailer.sendMail(req);
    });
}


exports.planApproved = async(req,object) =>{
    getTemplate('plan-approved',object).then((body)=>{
        req.mail    =   {'to':object.to, 'subject':object.subject , 'body':body};
        Mailer.sendMail(req);
    });
}


exports.craeteTicket = async(req,object) =>{
    getTemplate('ticket',object).then((body)=>{
        req.mail    =   {'to':object.to, 'subject':object.subject , 'body':body};

        Mailer.sendMail(req);
    });
}




exports.csrAccountApproved = async(req,object) =>{ 
    getTemplate('csr-account-approved',object).then(body=>{       
        req.mail    =   {'to':object.email,'subject':'PRABANDH: CSR Account Approved','body':body};
        Mailer.sendMail(req); 
    });
}

exports.csrAccountUnapproved = async(req,object) =>{
    getTemplate('csr-account-unapproved',object).then(body=>{        
        req.mail    =   {'to':object.email,'subject':'PRABANDH: CSR Account Unapproved','body':body};
        Mailer.sendMail(req);
    });
}

exports.csrAccountParticipationDisabled = async(req,object) =>{ 
    getTemplate('csr-account-participation-disabled',object).then(body=>{ ;
        req.mail    =   {'to':object.to,'subject':'PRABANDH: CSR Account Participation Disabled','body':body};
        Mailer.sendMail(req);
    });
}

exports.csrAccountParticipationEnabled = async(req,object) =>{ 
    getTemplate('csr-account-participation-enabled',object).then(body=>{
        req.mail    =   {'to':object.to,'subject':'PRABANDH: CSR Account Participation Enabled','body':body};
        Mailer.sendMail(req);
    });
}

exports.csrAccountLoginBlocked = async(req,object) =>{
    getTemplate('csr-account-login-blocked',object).then(body=>{ 
        req.mail    =   {'to':object.email,'subject':'PRABANDH: CSR Account Login Blocked','body':body};
        Mailer.sendMail(req);
    });
}

exports.csrAccountLoginUnblocked = async(req,object) =>{  
    getTemplate('csr-account-login-unblocked',object).then(body=>{ 
        req.mail    =   {'to':object.email,'subject':'PRABANDH: CSR Account Login Unblocked','body':body};
        Mailer.sendMail(req);
    });
}
exports.csrProjectParticipation = async(req,object) =>{ 
    getTemplate('csr-project-participation',object).then(body=>{ 
        req.mail    =   {'to':object.email,'subject':'PRABANDH: Thank you for showing interest in CSR project participation ','body':body};
        Mailer.sendMail(req);
    });
}
exports.csrProjectParticipationApproved = async(req,object) =>{ 
    getTemplate('csr-project-participation-approved',object).then(body=>{ 
        req.mail    =   {'to':object.email,'subject':'PRABANDH: CSR Project Participation Approved','body':body};
        Mailer.sendMail(req);
    });
}

exports.csrProjectParticipationRejected = async(req,object) =>{ 
    getTemplate('csr-project-participation-rejected',object).then(body=>{ 
        req.mail    =   {'to':object.email,'subject':'PRABANDH: CSR Project Participation Unpproved','body':body};
        Mailer.sendMail(req);
    });
}

exports.createActivity = async(req,object) =>{
    getTemplate('create-activity',object).then((body)=>{
        req.mail    =   {'to':object.to,'subject':'Your activity request  has been published on PRABANDH platform','body':body};
        Mailer.sendMail(req);
    });
}

exports.createAssets = async(req,object) =>{
    getTemplate('create-assets',object).then((body)=>{
        req.mail    =   {'to':object.to,'subject':'Your contribution request  has been published on PRABANDH platform','body':body};
        Mailer.sendMail(req);
    });
}

exports.participateEmailToSchoolInActivity = async(req,object) =>{
    getTemplate('participate-email-to-school-in-activity',object).then((body)=>{
        req.mail    =   {'to':object.school_email,'subject':`Interest shown by ${object.volunteer_name} for Participation in ${object.activity_name}`,'body':body};
        Mailer.sendMail(req);
    });
}

exports.participateEmailToVolunteerInActivity = async(req,object) =>{
    getTemplate('participate-email-to-volunteer-in-activity',object).then((body)=>{
        req.mail    =   {'to':object.volunteer_email,'subject':`Thank you for showing interest in Participation of ${object.activity_name}`,'body':body};
        Mailer.sendMail(req);
    });
}

exports.participateEmailToSchoolInAsset = async(req,object) =>{
    getTemplate('participate-email-to-school-in-asset',object).then((body)=>{
        req.mail    =   {'to':object.to,'subject':`Interest shown by ${object.volunteer_name} for Contribution in ${object.asset_name}`,'body':body};
        Mailer.sendMail(req);
    });
}

exports.participateEmailToVolunteerInAsset = async(req,object) =>{
    getTemplate('participate-email-to-volunteer-in-asset',object).then((body)=>{
        req.mail    =   {'to':object.to,'subject':`Interest shown by ${object.volunteer_name} for Participation in ${object.activity_name}`,'body':body};
        Mailer.sendMail(req);
    });
}

exports.volunteerRegistration = async(req,object) =>{
    getTemplate('volunteer-registration',object).then((body)=>{
        req.mail    =   {'to':object.to,'subject':'Volunteer Registration Request','body':body};
        Mailer.sendMail(req);
    });
}

exports.schoolRegistration = async(req,object) =>{   
    getTemplate('school-registration',object).then((body)=>{
        req.mail    =   {'to':object.to,'subject':'School Registration Request','body':body};
        Mailer.sendMail(req);
    });
}

exports.visitorFeedback = async(req,object) =>{
    getTemplate('visitor-feedback',object).then((body)=>{
        req.mail    =   {'to':object.to,'subject':'Thank you for feedback/suggestion','body':body};
        Mailer.sendMail(req);
    });
}

exports.enquireNow = async(req,object) =>{
    getTemplate('enquire',object).then((body)=>{
        req.mail    =   {'to':object.to,'subject':'Thank you for enquire','body':body};
        Mailer.sendMail(req);
    });
}