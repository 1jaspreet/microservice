const express       =   require('express');
const routers       =   express.Router();
const crypto        =   require('crypto');
const fs            =   require('fs');
const fetchApi      =   require('node-fetch');
const CryptoJS      =   require("crypto-js");
const {JSEncrypt}   =   require('nodejs-jsencrypt');

const ALGO          =  'aes-256-ecb';
const udise         =  '99010200104';
const authUrl       =  "https://api.udiseplus.gov.in/school/v1.2/authenticate";
const apiUrl        =  "https://api.udiseplus.gov.in/school/v1.0/school-info/by-udise-code/public";
const CRTPath       =  "E:/xampp/htdocs/nicsi/vidyanjali/V1.0/nodejs/certificate/udise.cer";
const key           =  crypto.randomBytes(32);
const ClientId      =  "test";
const ClientSecret  =  "test@123";


//______________________________________________________________Start Before Authentication:______________________________________________________________

const getAppKey = () =>  key.toString('base64');

const appKey    = getAppKey();

const getPublicKey = () =>{
    const PublicKey = crypto.createPublicKey(fs.readFileSync(CRTPath)).export({type:'spki', format:'pem'});
    return (PublicKey.replace('-----BEGIN PUBLIC KEY-----\n','')).replace('\n-----END PUBLIC KEY-----\n','');
}

const getBase64 = () =>{
   return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(JSON.stringify({clientId:ClientId,clientSecret:ClientSecret,"appKey":appKey})));       
}

const geHexValue = () =>{
    const RSAEncrypt = new JSEncrypt();
          RSAEncrypt.setPublicKey(getPublicKey());
    const RSAEncryptText        =   RSAEncrypt.encrypt(getBase64());
    const RSAEncryptTextBase64  =   CryptoJS.enc.Base64.parse(RSAEncryptText);
    return JSON.stringify({ data: RSAEncryptTextBase64.toString(CryptoJS.enc.Hex) });
}

const getSEK = (callback) =>{
    const options = {method: 'POST',body: geHexValue(),headers: { 'Content-Type': 'application/json'}};
    return fetchApi(authUrl,options).then(response => response.text()).then(result => {
        callback(JSON.parse(result));
    });
}

//______________________________________________________________End Before Authentication:______________________________________________________________

const decodeString = (string)=>{
    return Buffer.from(string, 'base64').toString('utf8');
}

const getEncryptValue = (decryptedKey) =>{
    const decodedKey    =   Buffer.from(decryptedKey,'base64');
    const cipher        =   crypto.createCipheriv(ALGO,decodedKey,null);
    return cipher.update(JSON.stringify({udiseCode:udise}), 'utf8', 'base64')+cipher.final('base64');
}

const getDecryptValue = (data,appKey) =>{

    const decodeStr         = decodeString(data.sek);
    const decodedKey        = Buffer.from(appKey, 'base64');
    const decipher          = crypto.createDecipheriv(ALGO, decodedKey, null);
    const decryptStr        = decipher.update(Buffer.from(decodeStr, 'base64'));
    const decryptedValue    = Buffer.concat([decryptStr, decipher.final()]);
    const encryptValue      = getEncryptValue(decryptedValue.toString());

    const options = {
        method: 'POST',
        body: JSON.stringify({data:encryptValue}),
        headers: { 'Content-Type': 'application/json',"Authorization" : `Bearer ${data.authToken}`}
    };

    return fetchApi(apiUrl,options).then(response => response.text()).then(result => {
        console.log(result)
        return result;
    }).catch(err=>{
        console.log(err)
        return err;
    });
}


//______________________________________________________________End Before Authentication:______________________________________________________________

routers.get('/handle',async(req,res)=>{
    return getSEK((resutl=>{
        if(resutl){
            return res.status(200).json(
                {
                    ...resutl, 'decrypt':getDecryptValue(resutl.data,appKey)
                })
        }else{
            return res.status(200).json(resutl)
        }        
    }));
});


module.exports = routers;