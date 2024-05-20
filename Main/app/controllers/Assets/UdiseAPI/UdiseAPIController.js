const express       =   require('express');
const routers       =   express.Router();
const crypto        =   require('crypto');
const fs            =   require('fs');
const fetchApi      =   require('node-fetch');
const CryptoJS      =   require("crypto-js");
const {JSEncrypt}   =   require('nodejs-jsencrypt');

const ALGO          =  'aes-256-ecb';
const udise         =  '19070304401';
const authUrl       =  "https://api.udiseplus.gov.in/school/v1.2/authenticate";
const apiUrl        =  "https://api.udiseplus.gov.in/school/v1.1/school-info/by-udise-code/public";
const CRTPath       =  "E:/xampp/htdocs/nicsi/vidyanjali/V1.0/nodejs/certificate/udise.cer";
const ClientId      =  "vidyanjali";
const ClientSecret  =  "vidya@756~";

routers.get('/handle',async(req,res)=>{
    return getAuthenticatedSek((result=>{
        if(result.status){
            return getSchoolInfoByUdiseCode(result.data,(schoolInfo)=>{
                return res.status(200).json({ ...result, 'schoolInfo':schoolInfo });
            });
        }else{
            return res.status(200).json(result)
        }        
    }));
});

//______________________________________________________________Start Before Authentication:______________________________________________________________

const appKey    = crypto.randomBytes(32).toString('base64');

const getPublicKey = () =>{
    const PublicKey = crypto.createPublicKey(fs.readFileSync(CRTPath)).export({type:'spki', format:'pem'});
    return (PublicKey.replace('-----BEGIN PUBLIC KEY-----\n','')).replace('\n-----END PUBLIC KEY-----\n','');
}

const getBase64 = () =>{
    return CryptoJS.enc.Base64.stringify(
        CryptoJS.enc.Utf8.parse(JSON.stringify({clientId:ClientId,clientSecret:ClientSecret,"appKey":appKey}))
    );       
}

const geHexString = () =>{
    const RSAEncrypt = new JSEncrypt();
          RSAEncrypt.setPublicKey(getPublicKey());
    const RSAEncryptText        =   RSAEncrypt.encrypt(getBase64());
    const RSAEncryptTextBase64  =   CryptoJS.enc.Base64.parse(RSAEncryptText);
    return JSON.stringify({ data: RSAEncryptTextBase64.toString(CryptoJS.enc.Hex) });
}

const getAuthenticatedSek = (callback) =>{
    const options = {method: 'POST',body: geHexString(),headers: { 'Content-Type': 'application/json'}};
    return fetchApi(authUrl,options).then(response => response.text()).then(result => {
        callback(JSON.parse(result));
    }).catch(err=>{
        callback(err);
    });
}

//______________________________________________________________End Before Authentication:______________________________________________________________


//______________________________________________________________Start After Authentication:______________________________________________________________

const decodeString = (string)=>{
    return Buffer.from(string, 'base64').toString('utf8');
}

const getEncryptedString = (decryptedKey) =>{
    const decodedKey    =   Buffer.from(decryptedKey,'base64');
    const cipher        =   crypto.createCipheriv(ALGO,decodedKey,null);
    return cipher.update(JSON.stringify({udiseCode:udise}), 'utf8', 'base64')+cipher.final('base64');
}

const getDecryptedString = (data) =>{
    const decodeStr         =   decodeString(data.sek);
    const decodedKey        =   Buffer.from(appKey, 'base64');
    const decipher          =   crypto.createDecipheriv(ALGO, decodedKey, null);
    const decryptStr        =   decipher.update(Buffer.from(decodeStr, 'base64'));
    const decryptedValue    =   Buffer.concat([decryptStr, decipher.final()]);
    return getEncryptedString(decryptedValue.toString());
}

const getSchoolInfoByUdiseCode = (data,callback) =>{
    const encryptedString   =   getDecryptedString(data);
    const headers   =   { 'Content-Type': 'application/json',"Authorization" : `Bearer ${data.authToken}`};
    const options   =   { method: 'POST', body: JSON.stringify({data:encryptedString}), headers: headers};

    return fetchApi(apiUrl,options).then(response => response.text()).then(result => {
        callback(JSON.parse(result));
    }).catch(err=>{
        callback(err);
    });
}

//______________________________________________________________End After Authentication:______________________________________________________________

module.exports = routers;