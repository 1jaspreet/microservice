const { body } = require('express-validator');



exports.create = () => {
    return [
        body('title').exists().withMessage('Title is required').trim(),
        // .matches(/^[A-Za-z\_]+$/).withMessage('Title allowed only'),
        body('description').exists().withMessage('Description is required').trim(),
        body('status').exists().withMessage('Master Status is required').trim(),
        body('type_code').exists().withMessage('Type code is required').trim(),
    ];
}