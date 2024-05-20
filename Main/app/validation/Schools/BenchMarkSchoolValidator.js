const {body}  =   require('express-validator');

exports.updateSchoolAndSendMail = ()  =>{
    return [
        body('email')
            .exists().withMessage('Email-ID is required.').trim()
            .isEmail().normalizeEmail().withMessage('Invalid Email.'),
        body('mobile')
            .exists().withMessage('Mobile is required.').trim()
            .isLength(10).withMessage('Mobile must be 10 digits long.')
            .matches(/^[0-9\_]+$/).withMessage('Mobile must be numeric only'),
        body('school_head')
            .exists().withMessage('Head Master name is required').trim()
            .matches(/^[A-Za-z\_]+$/).withMessage('Alphabates allowed only'),
        body('school_head_designation').exists().withMessage('School head designation is required').trim()
    ];
}