const Exception  =   require('../Assets/ExceptionHandler');
const Model      =   require('../../models').ApiLogs;
const jwt        =   require('jsonwebtoken');
const dotenv     =   require('dotenv');
const { API_CREATE_LOG } = require('../../../config/env');
dotenv.config();

exports.create   =  async (token, url, handlerName, req, res, status_code=200)  =>{
    try{
        if(!API_CREATE_LOG){
            return true;
        }else{
            const auth = token ? jwt.verify(token, process.env.JWT_TOKEN) : undefined;
            const object    =   {
                                    user_id: (auth != undefined && auth?.user?.id!=null) ? auth?.user?.id : 0,
                                    api_endpoint: url,
                                    handler_name: handlerName,
                                    api_request: JSON.stringify(req),
                                    api_response: JSON.stringify(res),
                                    api_status_code: status_code
                                }
                                
            return await Model.create(object);
        }
        
    }catch(e){
        return {err: "Error", message: "Error in inserting data"};
    }
}   