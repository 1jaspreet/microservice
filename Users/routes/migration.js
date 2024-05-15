const express = require('express');
const routers = express.Router();

routers.use('/', require('../app/migration/migration'));

module.exports = routers;