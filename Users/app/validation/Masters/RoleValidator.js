const {body}  =   require('express-validator');

exports.create = () =>{
    return[
        body('name')
            .exists().withMessage('Role name is required').trim()
            .matches(/^[A-Za-z\_]+$/).withMessage('Alphabates allowed only'),
        body('status').exists().withMessage('Role status is required').trim(),
    ];
}

exports.update = () =>{
    return[
        body('name')
            .exists().withMessage('Role name is required').trim()
            .matches(/^[A-Za-z\_]+$/).withMessage('Alphabates allowed only'),
        body('status').exists().withMessage('Role status is required').trim(),
    ];
}

exports.status = () =>{
    return[
        body('id').exists().withMessage('Role unique-ID is required').trim()
    ];
}

exports.delete = () =>{
    return[
        body('id').exists().withMessage('Role unique-ID is required').trim()
    ];
}
