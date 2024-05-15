const {body}  =   require('express-validator');

exports.create = () =>{
    return[
        body('name')
            .exists().withMessage('Block name is required').trim()
            .matches(/^[A-Za-z\_]+$/).withMessage('Alphabates allowed only'),
        body('block').exists().withMessage('Block is required').trim(),
        body('state').exists().withMessage('State is required').trim(),
        body('district').exists().withMessage('District is required').trim(),
        body('location').exists().withMessage('Location is required').trim(),
    ];
}

exports.update = () =>{
    return[
        body('name')
            .exists().withMessage('Block name is required').trim()
            .matches(/^[A-Za-z\_]+$/).withMessage('Alphabates allowed only'),
        body('block').exists().withMessage('Block is required').trim(),
        body('state').exists().withMessage('State is required').trim(),
        body('district').exists().withMessage('District is required').trim(),
        body('location').exists().withMessage('Location is required').trim(),
    ];
}

exports.status = () =>{
    return[
        body('id').exists().withMessage('Block unique-ID is required').trim()
    ];
}

exports.delete = () =>{
    return[
        body('id').exists().withMessage('Block unique-ID is required').trim()
    ];
}
