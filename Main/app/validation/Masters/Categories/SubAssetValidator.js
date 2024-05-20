const {body}  =   require('express-validator');

exports.create = () =>{
    return[
        body('asset_sub_category_name')
            .exists().withMessage('Asset sub category name is required.').trim()
            .matches(/^[a-zA-Z ]*$/).withMessage('Alphabates allowed only'),
        body('status').exists().withMessage('Asset sub category status is required.').trim(),
    ];
}

exports.update = () =>{
    return[
        body('asset_sub_category_name')
            .exists().withMessage('Asset sub category name is required.').trim()
            .matches(/^[a-zA-Z& ]*$/).withMessage('Alphabates allowed only.')
    ];
}

exports.status = () =>{
    return[
        body('id').exists().withMessage('Asset sub category unique-ID is required.').trim()
    ];
}

exports.delete = () =>{
    return[
        body('id').exists().withMessage('Asset sub category unique-ID is required.').trim()
    ];
}
