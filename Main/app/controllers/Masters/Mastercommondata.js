const express = require('express');
const routers = express.Router();
const Helper = require('../../helpers/Helper');
const Handler = require('../../handlers').Mastercommondata;
const Validate = require('../../validation').Mastercommondata;


routers.post('/', async (req, res) => {
    return await Handler.index(req, res);
});

routers.post('/create', Validate.create(), (req, res) => {
    const error = Helper.validate(req, res);
    return (error != null) ? error : Handler.create(req, res);
});

routers.post('/update', async (req, res) => {
    return await Handler.update(req, res);
});
routers.post('/updateall', async (req, res) => {
    return await Handler.updateAll(req, res);
});
routers.post('/getmastercommondatabyid', async (req, res) => {
    return await Handler.findById(req, res);
});
module.exports = routers;
