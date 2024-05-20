const {body}  =   require('express-validator');

exports.create = () =>{
    return[
        body('asset_category_name')
            .exists().withMessage('Asset category name is required.').trim()
            .matches(/^[a-zA-Z ]*$/).withMessage('Alphabates allowed only'),
        body('status').exists().withMessage('Asset category status is required.').trim(),
    ];
}

exports.update = () =>{
    return[
        body('asset_category_name')
            .exists().withMessage('Asset category name is required.').trim()
            .matches(/^[a-zA-Z& ]*$/).withMessage('Alphabates allowed only.')
    ];
}

exports.status = () =>{
    return[
        body('id').exists().withMessage('Asset category unique-ID is required.').trim()
    ];
}

exports.delete = () =>{
    return[
        body('id').exists().withMessage('Asset category unique-ID is required.').trim()
    ];
}
