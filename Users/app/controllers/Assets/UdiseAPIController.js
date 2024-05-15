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
//const CRTPath       =  "E:/xampp/htdocs/nicsi/vidyanjali/V1.0/nodejs/certificate/udise.cer";
const CRTPath       =  "/var/www/html/vidyanjali/V1.0/nodejs/certificate/udise.cer";
const key           =  crypto.randomBytes(32);
const ClientId      =  "test";
const ClientSecret  =  "test@123";


//______________________________________________________________Start Before Authentication:______________________________________________________________

const getAppKey = () =>  key.toString('base64');

const appKey    = getAppKey();
//const appKey    = 'kbxwtK4+gWsttIaalN7a0G+XDF3zj0uAlfViS/bGM6c=';

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

const base64ToByteArray =(base64) => {
    var binaryString = atob(base64);
    var bytes = new Uint8Array(binaryString.length);
    for (var i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

const byteToUTF8String = (bytes) => {
    const decoder = new TextDecoder('UTF-8');
    const array   = new Uint8Array(bytes);
  	return decoder.decode(array);
};

function byteArrayToString(byteArray){

    // Otherwise, fall back to 7-bit ASCII only
    var result = "";
    for (var i=0; i<byteArray.byteLength; i++){
        result += String.fromCharCode(byteArray[i])
    }/*from   w  ww . ja v a 2 s .  co  m*/
    return result;
}

const decodeString = (string)=>{
    return Buffer.from(string, 'base64').toString('utf8');
}

const geEncryptValue = (token) =>{
    const string    =   CryptoJS.AES.encrypt(JSON.stringify({udiseCode:udise}),token,{mode:CryptoJS.mode.ECB,padding:CryptoJS.pad.Pkcs7});
    var Hash        =   CryptoJS.SHA256(string);
    return Hash.toString(CryptoJS.enc.Base64);
}

const geDecryptValue = (data,appKey) =>{

    // const appKeyDecoded =   decodeString(appKey);
    // const sekDecoded    =   decodeString(decodeString(sek));

    // const a = Buffer.from(sek, 'base64').toString('utf8') //decodeString(sek);
    // console.log('A:'+ a)
    // var b = Buffer.from(a, 'base64').toString('utf8');
    // console.log('B:'+ b)

    const decryptedSEK = CryptoJS.AES.decrypt(data.sek,appKey,{mode:CryptoJS.mode.ECB,padding:CryptoJS.pad.Pkcs7});
    const Hash         = CryptoJS.SHA256(decryptedSEK);
    const decryptValue = Hash.toString(CryptoJS.enc.Base64);
    const encryptValue = geEncryptValue(decryptValue);

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



    //console.log(decryptValue)

    // console.log(decryptedSEK)
    // console.log('text:'+byteArrayToString(decryptedSEK))
    // const sekKeyToBytes             =    base64ToByteArray(sek);
    // const sekKeyToUTF8String        =    byteToUTF8String(sekKeyToBytes);
    // const sekKeyToUTF8StringToByte  =    base64ToByteArray(sekKeyToUTF8String);

    // const iv = new Uint8Array(16);

   // CryptoJS.DES

    

    //const sekBytes  =    utf8Encode.encode((data.sek).toString(CryptoJS.enc.Utf8));
    // const keys  =   CryptoJS.enc.Utf8.parse(appKey);
    // const sek   =   CryptoJS.enc.Utf8.parse(data.sek).toString(CryptoJS.enc.Base64);
    
   // const decryptValue  =   CryptoJS.enc.Utf8.stringify(Decrypt);

    //return {'decryptValue':Buffer.from(decryptValue).toString('utf8')};
    // return {
    //     // 'sekDecoded':sekDecoded,
    //     // 'appKeyDecoded':appKeyDecoded,
    //     'decryptValue':decryptValue,
    //     // 'decryptedSEK64':Buffer.from(decryptedSEK,'base64').toString('base64'),
    //     // 'decryptedSEKUTF8':Buffer.from(decryptedSEK,'utf-8').toString('utf-8'),
    //     // 'appKeyToBytes':appKeyToBytes,
    //     // 'sekKeyToBytes':sekKeyToBytes,
    //     // 'sekKeyToUTF8String':sekKeyToUTF8String,
    //     // 'sekKeyToUTF8StringToByte':sekKeyToUTF8StringToByte,
    //     //'Decrypt':Decrypt.toString(CryptoJS.enc.Utf8)
    // };



    /* 
        const decodeKey = Buffer.from(data.sek,'utf8').toString();
        //const decodeKey = CryptoJS.enc.Base64.stringify(data.sek);

        const RSAEncrypt = new JSEncrypt();
            RSAEncrypt.setPrivateKey(getPrivateKey());
        const RSAEncryptText = RSAEncrypt.decrypt(decodeKey);

        const decrypted = CryptoJS.enc.decrypt(decodeKey, appKey);
        const stringVal = Buffer.from(decrypted,'utf8').toString();
        console.log(stringVal)
        return {key:appKey,decodeKey:decodeKey,RSAEncryptText:RSAEncryptText};
    */
}


//______________________________________________________________End Before Authentication:______________________________________________________________


// const decrypt = (text,secretKey) =>{
//     return (
//         CryptoJS.AES.decrypt(text,CryptoJS.enc.Base64.parse(secretKey),{mode:CryptoJS.mode.ECB,padding:CryptoJS.pad.Pkcs7})
//     )
// }

routers.get('/handle',async(req,res)=>{
    return getSEK((resutl=>{
        if(resutl){

            //console.log(atob(resutl.data.sek));
            const second = atob(atob(resutl.data.sek));
            //console.log(second)

            var bytes = new Uint8Array(second.length);
            for (var i = 0; i < second.length; i++) {
                bytes[i] = second.charCodeAt(i);
            }
            //console.log(bytes.buffer);

            var Kbytes = new Uint8Array(appKey.length);
            for (var i = 0; i < appKey.length; i++) {
                Kbytes[i] = appKey.charCodeAt(i);
            }
            //console.log(Kbytes.buffer);

            const deco =  CryptoJS.AES.decrypt(bytes.buffer.toString('utf8'),Kbytes.buffer.toString('utf8'),{mode:CryptoJS.mode.ECB,padding:CryptoJS.pad.Pkcs7})

            console.log(deco)

            var u8 = new Uint8Array(deco);
            var b64 = Buffer.from(u8);
            console.log(b64)

            return res.status(200).json(
                {
                    ...resutl,
                   // 'decrypt':geDecryptValue(resutl.data,appKey),
                   // 'encrypt':geEncryptValue(resutl.data)
                })
        }else{
            return res.status(200).json(resutl)
        }        
    }));

});


module.exports = routers;