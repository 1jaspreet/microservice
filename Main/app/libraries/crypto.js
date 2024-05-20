const crypto    =   require('crypto');
const algorithm =   'aes-256-cbc';
const key       =   crypto.randomBytes(32);
const iv        =   crypto.randomBytes(16);

exports.encrypt = (text) =>{
    let cipher      =   crypto.createCipheriv(algorithm, Buffer.from(key), iv);
    let encrypted   =   cipher.update(text);
    encrypted       =   Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex')+encrypted.toString('hex');
}

exports.decrypt = (value)=>{
    let iv              =   Buffer.from(value.substring(0,32), 'hex');
    let encryptedText   =   Buffer.from(value.substring(32), 'hex');
    let decipher        =   crypto.createDecipheriv(algorithm, Buffer.from(key), iv);
    let decrypted       =   decipher.update(encryptedText);
    return (Buffer.concat([decrypted, decipher.final()])).toString();
}