const { body } = require('express-validator');



exports.get = () => {
    return [
        body('state_id').exists().withMessage('State id is Required*').trim(),
        body('diet_id').exists().withMessage('Diet id is required*').trim(),
    ];
}