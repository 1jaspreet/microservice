const express   =   require('express');
const routers   =   express.Router();
const crypto    =   require('crypto');
const fs        =   require('fs');
const fetchApi  =   require('node-fetch');
const {X509Certificate}    =   require('crypto');

routers.get('/handle',async (req,res)=>{

    const udise         =  '99010200104';
    const apiUrl        =  "https://api.udiseplus.gov.in/school/v1.2/authenticate";
    const CRTPath       =  "E:/xampp/htdocs/nicsi/vidyanjali/V1.0/nodejs/certificate/udise.cer";
    const key           =  crypto.randomBytes(32);
    const iv            =  Buffer.from(crypto.randomBytes(12), 'utf8');
    const ALGO          =  'aes-256-ecb';
    const ClientId      =  "test";
    const ClientSecret  =  "test@123";
    
    const getAppKey = () => {        
        // const cipher = crypto.createCipher(ALGO, key);
        // const enc    = cipher.update(key, 'utf8', 'base64');
        // return enc+cipher.final('base64');

        //const key = crypto.randomBytes(32);
        return key.toString('base64');
    }

    const getPublicKey = () =>{
        return (new X509Certificate(fs.readFileSync(CRTPath))).subject;
    }

    const getBase64 = (appkey) =>{
        return Buffer.from(JSON.stringify({clientId:ClientId,clientSecret:ClientSecret,appKey:appkey})).toString('base64');
    }

    const getEncrypt = (text,publicKey) =>{

        

        // const data = text;

        // const encryptedData = crypto.publicEncrypt(
        // {
        //     key: publicKey,
        //     padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        //     oaepHash: "sha256",
        // },
        // // We convert the data string to a buffer using `Buffer.from`
        // Buffer.from(data)
        // );

        // The encrypted data is in the form of bytes, so we print it in base64 format
        // so that it's displayed in a more readable form
       // console.log("encypted data: ", encryptedData.toString("base64"));



        const cipher = crypto.createCipher(ALGO, publicKey);  
        // let encrypted  = cipher.update(text, 'utf8', 'base64');
        //     encrypted += cipher.final('base64');
       // console.log(Buffer.from(text))
           
        
        //const encrypted = Buffer.from(text);   
          const utf8EncodeText = (new TextEncoder()).encode(text);
               // utf8EncodeText.encode(text); 
        console.log(utf8EncodeText)
        const encrypted = cipher.update(utf8EncodeText,'utf8','hex');  
        //const encrypted = cipher.update(text,'utf8','hex');  
        //console.log(byteArray)    
        return encrypted;


        // const fcKey     = publicKey.substring(0,16);

        // const cipher    = crypto.createCipher('aes-256-ecb',publicKey);
        // // const encrypted = cipher.update(Buffer.from(base64, 'utf8'),'utf8','base64');
        // // return encrypted+cipher.final('base64');
        // const encrypted = cipher.update(Buffer.from(base64,'utf8'),'ascii','base64');
        // return encrypted+cipher.final('base64');

        //return Buffer.from(JSON.stringify({clientId:"test",clientSecret:"test@123",appKey:publicKey})).toString('base64');
    }
    
    const appkey    =   getAppKey();
    const publicKey =   getPublicKey();
    const base64    =   getBase64(appkey);
    const encrypt   =   getEncrypt(base64,publicKey);

    const getHex = () =>{
        return Buffer.from(encrypt).toString('hex');
    }

    const hexValue   =   getHex();

    // const decodeString = () =>{

    // }

//     //const getSek = () =>{
//         const options = {
//             method: 'POST',
//             body: JSON.stringify({'data': hexValue}),
//             headers: { 'Content-Type': 'application/json' }
//         }
//         return fetchApi(apiUrl,options).then(response => response.text()).then(result => {
//             return res.status(200).json(JSON.parse(result));
//         });
//    //}

    return res.status(200).json({
        'appKey':appkey,
        'publicKey':publicKey,
        'base64':base64,
        'encrypt':encrypt,
        'hex':hexValue,
        //'sek':getSek(),
    });

});


module.exports = routers;