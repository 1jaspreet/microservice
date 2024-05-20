const {body}  =   require('express-validator');

exports.create = () =>{
    return[
        body('school_category_name')
            .exists().withMessage('School category name is required.').trim()
            .matches(/^[a-zA-Z ]*$/).withMessage('Alphabates allowed only'),
        body('status').exists().withMessage('School category status is required.').trim(),
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
