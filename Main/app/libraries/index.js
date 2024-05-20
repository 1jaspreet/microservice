const OTPMaker          =   require('./otp');
const CsrfMaker         =   require('./csrf');
const CaptchaMaker      =   require('./captcha');
const Hash              =   require('./hash');
const Crypto            =   require('./crypto');

module.exports  =   {
    OTPMaker,CsrfMaker,CaptchaMaker,Hash,Crypto
};