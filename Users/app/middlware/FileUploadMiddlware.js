const Exception = require('../handlers/Assets/ExcelHandler');
const multer = require("multer");
const fs = require("fs");
const { UPLOAD_FILE_PATH } = require('../../config/env');

const uploadFile = (req, res, callback) => {
    try {
        // const storage =   multer.diskStorage({
        //     destination: (req, file, cb) =>{
        //         var upload_path = "public/uploads";
        //         if(req.flag === 'school'){
        //             if(req.body.activity_id !== undefined){
        //                 var upload_path = upload_path+"/"+req.pathname+req.body.activity_id;
        //             }
        //             if(req.body.contribution_id !== undefined){
        //                 var upload_path = upload_path+"/"+req.pathname+req.body.contribution_id;
        //             }
        //         } 
        //         if(req.flag === 'profile'){
        //             var upload_path = upload_path+"/"+req.pathname;
        //         }
        //         if(!fs.existsSync(upload_path)){                    
        //             fs.mkdir(upload_path, { recursive: true }, (err) => {
        //                 if (err){
        //                     console.error(err)
        //                 }else {
        //                     cb(null, upload_path);
        //                 }
        //             });
        //         }else{
        //             cb(null, upload_path);
        //         }
        //     },
        //     filename: (req, file, cb)=> {
        //         cb(null, 'file'+'-'+Date.now()+ '.' +(file.mimetype.split('/'))[1] );
        //     }

        // });        

        // const upload = multer({storage: storage}).single(req.singleFile);


        const storage = multer.diskStorage({
            destination: function (req, file, cb) {
                cb(null, UPLOAD_FILE_PATH);
            },
            filename: function (req, file, cb) {
                cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
            },
        });
        const upload = multer({ storage: storage });

        upload(req, res, (err) => {
            if (err) {
                callback({ 'status': false });
            }
            if (req.flag === 'school') {
                callback({ 'status': true, filename: req.file.filename, 'body': req.body });
            } else {
                callback({ 'status': true, filename: req.file.filename });
            }
        });
    } catch (e) {
        return Exception.handle(e,res,req,'');
    }
}

module.exports = uploadFile;