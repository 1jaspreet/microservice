const {body}  =   require('express-validator');

exports.create = () =>{
    return[
        body('state_name')
            .exists().withMessage('State name is required.').trim()
            .matches(/^[a-zA-Z ]*$/).withMessage('Alphabates allowed only'),
        body('status').exists().withMessage('State status is required.').trim(),
    ];
}

exports.update = () =>{
    return[
        body('state_name')
            .exists().withMessage('State name is required.').trim()
            .matches(/^[a-zA-Z& ]*$/).withMessage('Alphabates allowed only.')
    ];
}

exports.status = () =>{
    return[
        body('id').exists().withMessage('State unique-ID is required.').trim()
    ];
}

exports.delete = () =>{
    return[
        body('id').exists().withMessage('State unique-ID is required.').trim()
    ];
}
