
const Model = require('../../models').Statefileupload;
const Message = require('../../helpers/Message');
const Exception = require('../Assets/ExceptionHandler');


exports.index = async (req, res) => {
    try {
        const request = req.body;
        const { state_id, activity_master_detail_id, year } = request
        const number_of_record = await Model.findCount(request);
        let uploaded_by_state = false
        const created_by = req.auth.user.id;
        
        if (number_of_record && number_of_record[0].no_of_record == 0) {
            await Model.knx().raw(`INSERT INTO public.prb_state_documents
            (id, user_id, state_id, scheme_id, major_component_id, sub_component_id, activity_id, activity_master_details_id,  udise_code, physical_quantity, financial_amount, valid_assset, plan_year, asset_type, status, created_by)
            select nextval('prb_state_documents_id_seq'::regclass), '', state , scheme_id, major_component_id, sub_component_id, activity_master_id , activity_master_details_id,
              asset_code , quantity ,financial_quantity ,1,plan_year ,asset_type , 0, ${created_by}
            from prb_ann_wrk_pln_bdgt_data_physical_asset pawpbdpa 
            where pawpbdpa.state = '${state_id}'
                and pawpbdpa.plan_year = '${year}'
                and pawpbdpa.activity_master_details_id = '${activity_master_detail_id}'`)
            uploaded_by_state = true
        }
        const data = await Model.findData(request)
        res.status(200).json({ status: true, data: data || [], uploaded_by_state: uploaded_by_state });
    } catch (e) {
        return Exception.handle(e, res, req, '');
    }
    // }
}
exports.getProposeDetail = async (req, res) => {
    try {
        const request = req.body;
        const object = await Model.findProposeDetail(request);
        res.status(200).json({ status: true, data: object });
    } catch (e) {
        return Exception.handle(e, res, req, '');
    }
    // }
}
exports.deleteFileRowById = async (req, res) => {
    try {
        let id = req.body;
        const result = await Model.findOne({ id })
        // const fileRow = await Model.findFileRow(result?.file_id)
        if (result !== null || result !== undefined || Object.keys(result).length !== 0) {
            // const filePath = `public/file/uploads/uploads/state/${result?.state_id}/${fileRow[0]?.file_name}`; // Replace 'your-folder' with your actual folder pathbn v
            // fs.unlink(filePath, (err) => {
            //     if (err) {
            //         console.error('Error deleting file:', err);
            //     } else {
            //         console.log('File deleted successfully');
            //     }
            // })
            const data = await Model.delete({ id });
            if (data) {
                res.status(200).send({ status: 200, message: 'Document Deleted Successfully' });
            }
        }
        else {
            res.status(400).send({ status: 400, message: 'Id not valid' });
        }
    } catch (e) {
        return Exception.handle(e, res, req, '');
    }
}
exports.BulkDelete = async (req, res) => {
    try {
        let { deletes } = req.body
        const deleted = await Model.bulkDelete(deletes);
        console.log("deleted::::::", deleted)
        // if (deleted.rowCount > 0) {
        res.status(200).send({ status: 200, message: 'Selected School Deleted Successfully' });
        // }
    } catch (er) {
        console.log(er)
        return Exception.handle(e, res, req, '');
    }
}