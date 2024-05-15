//const Captcha   =   require("nodejs-captcha");
const Crypto = require('./crypto')
const Helper = require("../helpers/Helper");
exports.handle = (req, res) => {

    // const createCaptcha = ()=> {
    //     let captcha = new Array();
    //     for (q = 0; q < 6; q++) {
    //         if (q % 2 == 0) {
    //             captcha += String.fromCharCode(Math.floor(Math.random() * 26 + 65));
    //         } else {
    //             captcha += Math.floor(Math.random() * 10 + 0);
    //         }
    //     }
    //     return captcha;
    // }

    //const captcha = createCaptcha();
    const captcha = Helper.codeMaker(6);
    return { 'captcha': captcha, 'OTC': Crypto.encrypt(captcha) }
    // const result        = Captcha();
    // return {'captcha':result.image,'OTC': Crypto.encrypt(result.value)}
}