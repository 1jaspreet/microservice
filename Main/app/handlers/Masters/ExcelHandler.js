
const Model = require('../../models').ExcelModel;
const Message = require('../../helpers/Message');
const Exception = require('../Assets/ExceptionHandler');

exports.create = async (req, res) => {
    try {
        var result
        // const { title, type_code, description, status, state_id, district_id, block_id, udise_code, links_to_school } = req.body;
        // const result = await Model.findOne({ title, type_code, description, status, state_id, district_id, block_id, udise_code, links_to_school });
        // if (result == null || result == undefined || Object.keys(result).length == 0) {
        //     const object = await Model.create({});
        //     const message = (object) ? Message.created("Excel Upload") : Message.default();
        //     res.status(200).json({ status: true, message: message });
        // } else {
        //     res.status(200).json({ status: false, message: Message.duplicate(title) });
        // }
    } catch (e) {
        return Exception.handle(e,res,req,'');
    }
}
