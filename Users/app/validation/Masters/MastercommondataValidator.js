const { body } = require('express-validator');



exports.create = () => {
    return [
        body('title')
            .exists().withMessage('Title is required').trim(),
        // .matches(/^[A-Za-z\_]+$/).withMessage('Title allowed only'),
        body('description').exists().withMessage('Description is required').trim(),
        body('status').exists().withMessage('Status is required').trim(),
        body('type_code').exists().withMessage('Type code is required').trim(),
        // body('type_id').exists().withMessage('Type code is required').trim(),
        // body('udise_code').exists().withMessage('Type code is required').trim(),
        // body('links_to_school').exists().withMessage('Type code is required').trim(),
        body('block_id').exists().withMessage('Type code is required').trim(),
        body('state_id').exists().withMessage('Type code is required').trim(),
        body('district_id').exists().withMessage('Type code is required').trim(),
        body('master_type_detail_id').exists().withMessage('Master Type Detail is required').trim(),
        // body('master_code').exists().withMessage('Type code is required').trim(),
    ];
}