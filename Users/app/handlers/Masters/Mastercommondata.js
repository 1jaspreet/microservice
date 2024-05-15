
const Model = require('../../models').Mastercommondata;
const Message = require('../../helpers/Message');
const Exception = require('../Assets/ExceptionHandler');



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
            const object = await Model.findData({}, request.limit, request.page);

            const count = await Model.count();
            res.status(200).json({ status: true, 'data': object, 'count': count });
        } catch (e) {
            return Exception.handle(e,res,req,'');
        }
    }
}
exports.create = async (req, res) => {
    try {
        const { title, type_code, description, status, state_id, master_type_id, district_id, block_id, udise_code, master_type_detail_id } = req.body;
        const result = await Model.findOnes({ title, description, status, state_id, district_id, block_id, master_type_detail_id });
        if (result == null || result == undefined || Object.keys(result).length == 0) {
            const object = await Model.create({ title, type_code, description, master_type_id, status, state_id, district_id, block_id, udise_code, master_type_detail_id });
            const message = (object) ? Message.created(`Your Data is Saved, Your code is ${type_code}`) : Message.default();
            res.status(200).json({ status: true, message: message });
        } else {
            res.status(200).json({ status: false, message: Message.duplicate(title) });
        }
    } catch (e) {
        return Exception.handle(e,res,req,'');
    }
}

exports.update = async (req, res) => {
    try {
        const { status, id } = req.body.data;
        const result = await Model.findOne({ id });
        if (result != null) {
            const object = await Model.update({ status }, id);
            // const message = (object) ? Message.updated(status) : Message.status(status);
            res.status(200).json({ status: true, message: Message.status("Master Common data", status) });
        } else {
            res.status(200).json({ status: false, message: Message.notFound('Record') });
        }
    } catch (e) {
        return Exception.handle(e,res,req,'');
    }
}

exports.updateAll = async (req, res) => {
    try {
        const { title, description, type_code, status, id, links_to_school, district_id, state_id, block_id, udise_code } = req.body;
        const result = await Model.findOnes({ id });
        if (result != null) {
            const object = await Model.updateAll({ title, description, type_code, status, links_to_school, district_id, state_id, block_id, udise_code }, id);
            // const message = (object) ? Message.updated(status) : Message.status(status);
            res.status(200).json({ status: true, message: Message.updated("Master Common Data") });
        } else {
            res.status(200).json({ status: false, message: Message.notFound('No Record Found') });
        }
    } catch (e) {
        return Exception.handle(e,res,req,'');
    }
}

exports.findById = async (req, res) => {
    try {
        const { id } = req.body;
        const data = await Model.findOne({ id });
        res.status(200).json({ status: true, message: 'success', 'data': data });
    } catch (e) {
        return Exception.handle(e,res,req,'');
    }
}



const filteredMasterList = async (request, value) => {
    var Query = Model.query();
    let object;
    let count;

    object = await Query.select(['id', 'title', 'description', 'block_id', 'state_id', 'district_id', 'type_code', 'udise_code', 'links_to_school'])
        // .where('type_code', 'ILIKE', value + '%')
        .orWhere('title', 'ILIKE', value + '%')
        .orWhere('description', 'ILIKE', value + '%')
        .orWhere("type_code", 'ILIKE', value + '%')
        // .orWhere("state_id", 'LIKE', value + '%')
        // .orWhere("district_id", 'LIKE', value + '%')
        // .orWhere("block_id", 'LIKE', value + '%')
        // .orWhere("udise_code", 'LIKE', value + '%')
        // .orWhere("links_to_school", 'LIKE', value + '%')
        .limit(request.limit)
        .offset(request.limit * (request.page - 1));

    // object = await Model.knx().raw(`SELECT "mb".*, "mtd"."atribute_name","mt"."title" as master_type_id, "md"."district_name", "ms"."state_name", "bk"."block_name"
    // FROM "master_common_data" AS "mb"
    // INNER JOIN "master_districts" AS "md" ON "md"."id" = "mb"."district_id" 
    // INNER JOIN "master_states" AS "ms" ON "ms"."id" = "mb"."state_id"
    // INNER JOIN "master_type_detail" AS "mtd" ON CAST("mtd"."master_type_detail_id" AS INTEGER) = CAST("mb"."master_type_detail_id" AS INTEGER)
    // INNER JOIN "master_blocks" AS "bk" ON "bk"."id" = "mb"."block_id"
    // INNER JOIN "master_type" AS "mt" ON "mb"."master_type_id" = "mt"."id" 
    // where "ms"."state_name" ILIKE ${value}% 
    // ORDER BY "mb"."created_at" DESC  limit ${request.limit} offset ${request.limit * (request.page - 1)}`)


    count = ((await Model.query().count('id')
        .where('type_code', 'ILIKE', value + '%')
        .orWhere('title', 'ILIKE', value + '%')
        .orWhere('description', 'ILIKE', value + '%')
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
