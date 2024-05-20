const Exception     =   require('./ExceptionHandler')
const Response      =   require('./ResponseHandler')
const JsonToExcel   =   require('json2xls');
const fs            =   require('fs');
// const env           =   require('./config/env')

exports.handle   =  async (req,res)  =>{
    try{
        if(req.data !=null && req.data.length > 0){
            const file  =   req.ENV.DOWNLOAD_PATH+(Date.now()+'-'+req.fname+'.xlsx');
            var buffer = fs.writeFileSync(file,JsonToExcel(req.data),'binary');
            
            //var buffer = fs.readFileSync(file);
            //console.log(buffer.toString());

            //res.setHeader('Content-disposition', 'attachment; filename=' + req.fname+'.xlsx');
            //res.setHeader('Content-type', mimetype);
            //res.download(req.fname,(err)=>{
            //     if(err){
            //         res.status(404).json({status:false,message:"Unable to download file"});
            //     }
            //     fs.unlinkSync(req.fname);
            //});
        //    res.status(200).json({status:true,message:"Task done."}); 
            return Response.handle(req, res, 'handle', 200, {status:true,message:"Task done."})
        }else{
        //    res.status(404).json({status:false,message:"No record found."}); 
            return Response.handle(req, res, 'handle', 404, {status:false,message:"No record found."})
        }
    }catch(e){
        return Exception.handle(e,res, req, 'handle');
    }
} 