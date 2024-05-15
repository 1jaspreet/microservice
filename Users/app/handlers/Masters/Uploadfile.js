
const Model = require('../../models').FilesData;
// const Model = require('../../models').AdminUser;
const Hash = require('../../libraries').Hash
const Message = require('../../helpers/Message'); 
const Exception = require('../Assets/ExceptionHandler');
const fs = require('fs');


exports.index = async (req, res) => {
    var result;
    const title = req.body?.where?.value
    const requests = req.body;
    if (title !== null && title !== undefined && title.length !== 0) {
        result = await filteredMasterList(requests, title);
        res.status(200).json({ status: true, 'data': result.data, 'count': result.count });
    }
    else {
        try {
            const request = req.body;
            const object = await Model.query().select().limit(request.limit).offset(request.limit * (request.page - 1));
            const count = await Model.count();
            res.status(200).json({ status: true, 'data': object, 'count': count });
        } catch (e) {
            return Exception.handle(e, res, req, '');
        }
    }
}
exports.uploadDataFetch = async (req, res) => {
    const { role_id, state_id, district_id, user_id, page, limit } = req.body
    try {
        const request = req.body;
        const object = await Model.finddata({ role_id, user_id, district_id, state_id, page, limit });
        const count = await Model.count();
        res.status(200).json({ status: true, 'data': object, 'count': count });
    } catch (e) {
        return Exception.handle(e, res, req, '');
    }
}

exports.deleteById = async (req, res) => {
    try {
        let id = req.body;
        const result = await Model.findOne({ id })
        if (result !== null || result !== undefined || Object.keys(result).length !== 0) {
            try {
                const data = await Model.delete({ id });
                res.status(200).json({ status: true, message: 'success', 'data': data });
            } catch (e) {
                return Exception.handle(e, res, req, '');
            }
            const filePath = `public/uploads/${result.file_name}`; // Replace 'your-folder' with your actual folder path
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error('Error deleting file:', err);
                    // res.status(500).send('Error deleting file');
                } else {
                    // console.log('File deleted successfully');
                    // res.status(200).send('File deleted successfully');
                }
            })
        }
    } catch (e) {
        return Exception.handle(e, res, req, '');
    }
}

// for state upload document if process is not full filled then use 
exports.deleteFileRowById = async (req, res) => {
    try {
        let id = req.body;
        const result = await Model.findOne({ id })
        if (result !== null || result !== undefined || Object.keys(result).length !== 0) {
            const filePath = `public/file/uploads/uploads/state/${result?.state_id}/${result.file_name}`; // Replace 'your-folder' with your actual folder pathbn v
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error('Error deleting file:', err);
                } else {
                    console.log('File deleted successfully');
                }
            })
            const data = await Model.delete({ id });
            // return true
            res.status(400).send('Document not uploaded');
        }
    } catch (e) {
        return Exception.handle(e, res, req, '');
    }
}
const filteredMasterList = async (request, value) => {
    var Query = Model.query();
    let object;
    let count;

    object = await Query.select(['id', 'file_type', 'docuemnt_type', 'file_name', 'description'])
        .where('file_type', 'LIKE', value + '%')
        // .orWhere('file_type', 'LIKE', value + '%')
        // .orWhere('description', 'LIKE', value + '%')
        // .orWhere("state_id", 'LIKE', value + '%')
        // .orWhere("district_id", 'LIKE', value + '%')
        // .orWhere("block_id", 'LIKE', value + '%')
        // .orWhere("udise_code", 'LIKE', value + '%')
        // .orWhere("links_to_school", 'LIKE', value + '%')
        .limit(request.limit)
        .offset(request.limit * (request.page - 1));

    count = ((await Model.query().count('id')
        .where('file_type', 'LIKE', value + '%')
        // .orWhere('title', 'LIKE', value + '%')
        // .orWhere('description', 'LIKE', value + '%')
        // .orWhere("state_id", 'LIKE', value + '%')
        // .orWhere("district_id", 'LIKE', value + '%')
        // .orWhere("block_id", 'LIKE', value + '%')
        // .orWhere("udise_code", 'LIKE', value + '%')
        // .orWhere("links_to_school", 'LIKE', value + '%')
    )
    [0]).count

    return {
        data: object,
        count: count
    }
}


exports.getPublicUploads = async (req, res) => {
    try {
        const object = await Model.findPublicFiles();
        res.status(200).json({ status: true, 'data': object });
    } catch (e) {
        return Exception.handle(e, res, req, '');
    }
}