

const fetchApi  =   require('node-fetch');
const env = require("../../config/env");
const querystring = require('querystring');
exports.send = async (req,res) => {
    const data = {
        url: env.SMS_URL,
        username: env.SMS_USERNAME,
        password: env.SMS_PIN,
        signature: env.SMS_SIGNATURE,
        entity_id: env.SMS_DLT_ENTITY_ID,
        mobile: req.sms.mobile,
        template_id: req.sms.TMPLT_ID,
        message: req.sms.message,
        
        
    };

    const options = {method: 'POST',body:JSON.stringify(data)};
    if(env.APP_ENV === 'production'){
        return fetchApi(env.PHP_SMS_API,options).then((response) => response.text()).then((data) => {
            console.log(data)
            //return res.status(200).json({'data':data})
        }).catch((error) => {
            console.log(error)
            //return res.status(200).json({'error':error})
        });
    }

}


//  exports.send = async(req,res)=>{
//         const data = {
//         url: env.SMS_URL,
//         username: env.SMS_USERNAME,
//         password: env.SMS_PIN,
//         signature: env.SMS_SIGNATURE,
//         entity_id: "1101607010000029348",
//         mobile: req.sms.mobile,
//         template_id: "1107170185365742165",
//         message: req.sms.message,
//     };

//     const APIUrl = `${data.url}username=${data.username}&pin=${data.password}&message=${querystring.escape(data.message)}&mnumber=91${data.mobile}&signature=${data.signature}&dlt_template_id=${data.template_id}&dlt_entity_id=${data.entity_id}`;
//     fetchApi(APIUrl, {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json', // Adjust content type if needed
//         },
//         // If SSL certificate verification is not required, you can skip these options
//         agent: new (require('https').Agent)({ rejectUnauthorized: false }),
//     })
//     .then(response => response.text())
//     .then(data => {
//         console.log(data,"otp server jjjjjjjjjjjjjjjjjjjjjjj--------");
//     })
//     .catch(error => {
//         console.error('Error:', error);
//     });
//}