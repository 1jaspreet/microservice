// const Mailer = require('nodemailer');

// exports.sendMail = (req,object) => {
//     const transporter = Mailer.createTransport({
//         host: req.ENV.MAIL_HOST,
//         port: req.ENV.MAIL_PORT,
//         secure: true,
//         auth: { user: req.ENV.MAIL_USERNAME, pass: req.ENV.MAIL_PASSWORD }
//     });

//     const options = {
//         from: req.ENV.MAIL_USERNAME,to: object.to,subject: object.subject,text: object.body
//     };

//     transporter.sendMail(options, (error, info)=>{
//         if (error) {
//             return error;
//         } else {
//             return info.response;
//         }
//     });
// }

const Mailer = require('nodemailer');
const env = require("../../config/env");

exports.sendMail = (req) => {
    const transporter = Mailer.createTransport({
        host: env.MAIL_HOST,
        port: env.MAIL_PORT,
        auth: { user: env.MAIL_USERNAME, pass: env.MAIL_PASSWORD }
    });

    const options = {
        from: env.MAIL_FROM_ADDRESS,
        to:req.mail.to,
        subject:req.mail.subject,
        html:req.mail.body
    };

    if(req.mail.attachment){
        options.attachment = [
            // {
            //     filename: 'attachment.txt',
            //     path: req.mail.attachment, 
            // },
            req.mail.attachment
        ]
    }

    if(env.APP_ENV ==='production'){
        transporter.sendMail(options,(err, info)=>{
            console.log("------------------------", err, info);
            if (err) {
                //return res.status(404).json({status:false,'message':err});
            }
            //return res.status(404).json({status:false,'message':info.response});
        });
    }
}

