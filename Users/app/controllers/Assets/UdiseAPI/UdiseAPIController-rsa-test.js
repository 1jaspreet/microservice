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

    ///https://gist.github.com/sohamkamani/b14a9053551dbe59c39f83e25c829ea7

    const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {modulusLength: 2048})
    
    console.log(
        publicKey.export({
            type: "pkcs1",
            format: "pem",
        }),
    
        privateKey.export({
            type: "pkcs1",
            format: "pem",
        })
    )
    
    // This is the data we want to encrypt
    const data = "my secret data"
    
    const encryptedData = crypto.publicEncrypt({
            key: publicKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: "sha256",
        },
        Buffer.from(data)
    )

    console.log("encypted data: ", encryptedData.toString("base64"))
    
    const decryptedData = crypto.privateDecrypt({
            key: privateKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: "sha256",
        },
        encryptedData
    )
    

    console.log("decrypted data: ", decryptedData.toString())
   
    const verifiableData = "this need to be verified"
    
    const signature = crypto.sign("sha256", Buffer.from(verifiableData), {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
    })
    
    console.log(signature.toString("base64"))
    
    const isVerified = crypto.verify("sha256",Buffer.from(verifiableData),{
            key: publicKey,
            padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
        },
        signature
    )
    
    // isVerified should be `true` if the signature is valid
    console.log("signature verified: ", isVerified)

});


module.exports = routers;