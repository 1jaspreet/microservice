const CryptoJS  =   require("crypto-js");
const key       =   '8fac2bb68ff0a57ee01d379a92ebf5d0e65a4648';

exports.encrypt = (text) =>{
    return CryptoJS.AES.encrypt(text, key).toString();
}

exports.decrypt = (value)=>{    
    return (CryptoJS.AES.decrypt(value, key)).toString(CryptoJS.enc.Utf8);
}