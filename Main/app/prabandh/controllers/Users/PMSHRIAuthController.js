const express = require('express');
const Helper = require('../../helpers/Helper');
const routers = express.Router();
const Handler = require('../../handlers').PMSHRIAuthHandler;
const Validate = require('../../validation').Auth;

routers.post('/login/email-password', Validate.emailPasswordLogin(), async (req, res) => {
    const error = Helper.validate(req, res);
    return (error != null) ? error : await Handler.loginWithEmailPassword(req, res);
});

routers.post('/login', async (req, res) => {
    return await Handler.Login(req, res);
});

routers.post('/', async (req, res) => {
    console.log("ddddssssssssssssssssssss")
    return await Handler.afterSchoolLogin(req, res);
});

routers.post('/refrenceupdate', async (req, res) => {
    return await Handler.updateRefrence(req, res);

});
routers.post('/simulate', async (req, res) => {
    return await Handler.simulate(req, res);
});

routers.post('/login/mobile', Validate.mobileLogin(), async (req, res) => {
    const error = Helper.validate(req, res);
    return (error != null) ? error : await Handler.loginWithMobile(req, res);
});

routers.post('/login/anonymous', async (req, res) => {
    return await Handler.anonymousLogin(req, res);
});

routers.post('/login/mobile-udise', Validate.mobileAndUdiseLogin(), async (req, res) => {
    const error = Helper.validate(req, res);
    return (error != null) ? error : await Handler.loginWithMobileAndUdiseCode(req, res);
});

routers.post('/logout', async (req, res) => {
    return await Handler.logout(req, res);
});

module.exports = routers;