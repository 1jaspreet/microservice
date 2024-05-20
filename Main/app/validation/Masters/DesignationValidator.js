const {body}  =   require('express-validator');

exports.create = () =>{
    return[
        body('name')
            .exists().withMessage('Designation name is required').trim()
            .matches(/^[A-Za-z\_]+$/).withMessage('Alphabates allowed only'),
        body('status').exists().withMessage('Designation status is required').trim(),
    ];
}

exports.update = () =>{
    return[
        body('name')
            .exists().withMessage('Designation name is required').trim()
            .matches(/^[A-Za-z\_]+$/).withMessage('Alphabates allowed only'),
        body('status').exists().withMessage('Designation status is required').trim(),
    ];
}

exports.status = () =>{
    return[
        body('id').exists().withMessage('Designation unique-ID is required').trim()
    ];
}

exports.delete = () =>{
    return[
        body('id').exists().withMessage('Designation unique-ID is required').trim()
    ];
}
