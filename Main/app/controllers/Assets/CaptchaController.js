const express = require('express');
const routers = express.Router();
const Captcha = require('../../libraries').CaptchaMaker;

routers.get('/', async (req, res) => {
    const data = await Captcha.handle(req, res);
    return res.status(200).json(data)
});

module.exports = routers;