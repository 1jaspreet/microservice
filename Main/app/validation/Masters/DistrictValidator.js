const {body}  =   require('express-validator');

exports.create = () =>{
    return[
        body('name')
            .exists().withMessage('District name is required').trim()
            .matches(/^[A-Za-z\_]+$/).withMessage('Alphabates allowed only'),
        body('status').exists().withMessage('District status is required').trim(),
        body('state').exists().withMessage('State is required').trim()
    ];
}

exports.update = () =>{
    return[
        body('name')
            .exists().withMessage('District name is required').trim()
            .matches(/^[A-Za-z\_]+$/).withMessage('Alphabates allowed only'),
        body('status').exists().withMessage('District status is required').trim(),
        body('state').exists().withMessage('State is required').trim()
    ];
}

exports.status = () =>{
    return[
        body('id').exists().withMessage('District unique-ID is required').trim()
    ];
}

exports.delete = () =>{
    return[
        body('id').exists().withMessage('District unique-ID is required').trim()
    ];
}
