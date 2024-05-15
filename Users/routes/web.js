const express   =   require('express');
const routes    =   express.Router();

routes.get('/captcha',require('../app/controllers/Assets/CaptchaController'));
routes.use('/activities/',require('../app/controllers/Web/ActivitiesController'));
routes.use('/assets/',require('../app/controllers/Web/AssetsController'));
routes.use('/volunteer/',require('../app/controllers/Web/VolunteerController'));
routes.use('/schools/',require('../app/controllers/Web/SchoolController'));

module.exports = routes;