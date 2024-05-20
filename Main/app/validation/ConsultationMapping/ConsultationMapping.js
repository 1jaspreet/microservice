const {body}  =   require('express-validator');

exports.create = () =>{
    return[
        body('role_code').exists().withMessage('Role Code is required').trim(),
        body('state_ids').exists().withMessage('State IDs are required').trim(),
        body('consultant_task_ids').exists().withMessage('Consultant Task ID is required').trim(),
        body('user_id').exists().withMessage('User ID is required').trim(),
    ];
}

exports.findUserData = () =>{
    return[
        body('user_id').exists().withMessage('User ID is required').trim()
    ];
}

exports.status = () =>{
    return[
        body('id').exists().withMessage('Category unique-ID is required').trim()
    ];
}

exports.delete = () =>{
    return[
        body('id').exists().withMessage('Category unique-ID is required').trim()
    ];
}

exports.findUserRoleData = () =>{
    return[
        body('role_code').exists().withMessage('User Role is required').trim()
    ];
}