const {body}  =   require('express-validator');

exports.create = () =>{
    return[
        body('name').exists().withMessage('Category name is required').trim(),
        body('status').exists().withMessage('Category status is required').trim(),
        body('broad_category').exists().withMessage('Broad category is required').trim(),
        body('schemes').exists().withMessage('Schemes are required').trim(),
        body('total_mark').exists().withMessage('Total marks are required').trim(),
        body('urban_mark').exists().withMessage('Urban marks are required').trim(),
        body('rural_mark').exists().withMessage('Rural marks are required').trim(),
    ];
}

exports.update = () =>{
    return[
        body('name').exists().withMessage('Category name is required').trim(),
        body('status').exists().withMessage('Category status is required').trim(),
        body('broad_category').exists().withMessage('Broad category is required').trim(),
        body('schemes').exists().withMessage('Schemes are required').trim(),
        body('total_mark').exists().withMessage('Total marks are required').trim(),
        body('urban_mark').exists().withMessage('Urban marks are required').trim(),
        body('rural_mark').exists().withMessage('Rural marks are required').trim(),
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
