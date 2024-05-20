const Model = require("../../models").BudgetAllotmentModel;
const path = require("path");
const { UPLOAD_FILE_PATH } = require("../../../config/env");
const Exception = require("../Assets/ExceptionHandler");
const Response = require("../Assets/ResponseHandler");

exports.allotBudget = async (req, res) => {
  try {
    const request = req.body;
    request.installment_doc = "/fundreleased/" + req?.file?.filename;
    request.plan_year = req.headers?.api_year;
    delete request.file;
    // const sanction_duplicate = await Model.find({ sension_number: request.sension_number, state_id: request.state_id })
    // if (sanction_duplicate.length !== 0) {
    //   return res.status(400).json({ status: 400, message: 'Sanction Number Already Exist' })
    // }
    // const installment_duplicate = await Model.find({ installment_number: request.installment_number, state_id: request.state_id })
    // console.log(installment_duplicate, sanction_duplicate)
    // if (installment_duplicate.length !== 0) {
    //   return res.status(400).json({ status: 400, message: 'Installment Already send' })
    // }
    const object = await Model.create(request);
    return Response.handle(req, res, "allotBudget", 200, {
      status: true,
      data: object,
    });
  } catch (e) {
    return Exception.handle(e, res, req, "allotBudget");
  }
};

exports.stateApprovedList = async (req, res) => {
  try {
    const plan_year = req.headers?.api_year;
    const { state_id } = req.body;
    let where = '';
    if (state_id) {
      where = `where cteprop.state_id = ${state_id}`;
    }
    const object = await Model.knx().raw(`
    with cteprop as (
    with cte as ( 
    select sum(proposed_financial_amount) as total_approved, 
              sum(proposed_financial_amount) filter (where pd.recuring_nonrecuring= 1) as recurring_financial,
              sum(proposed_financial_amount) filter (where pd.recuring_nonrecuring= 2) as Nonrecurring_financial,
              
                 state 
          from prb_state_ann_wrk_pln_bdgt_data psawpbd , prb_data pd 
          where plan_year = '${plan_year}'
          and psawpbd.activity_master_details_id = pd.id 
          group by state 
          )
          select total_approved, 
          recurring_financial  ,
          nonrecurring_financial, 
          state_id,
          state_name,
          cte.total_approved * (mstp.center_share_percent/100) as central_share,
                cte.total_approved * ((100- mstp.center_share_percent)/100) as state_share
                        from cte , public.master_states_tentative_proposed mstp 
          where mstp.state_id = cte.state and mstp.year_id = 9
          
           ) ,
        
           ctef as (
          select sum(released_amount) filter (where transaction_type= 1 and alloted_from = 'State' and recurring_non_recurring = 1) as recurring_receipt_from_own_state,
           sum(released_amount) filter (where transaction_type= 1 and alloted_from = 'State' and recurring_non_recurring = 2) as non_recurring_receipt_from_own_state,
           sum(released_amount) filter (where transaction_type= 1 and alloted_from = 'Center' and recurring_non_recurring = 1) as recurring_receipt_from_Center,
           sum(released_amount) filter (where transaction_type= 1 and alloted_from = 'Center' and recurring_non_recurring = 2) as non_recurring_receipt_from_Center,
           sum(released_amount) filter (where transaction_type= 2 and alloted_from = 'State' and recurring_non_recurring = 1) as recurring_release_from_own_state,
           sum(released_amount) filter (where transaction_type= 2 and alloted_from = 'State' and recurring_non_recurring = 2) as non_recurring_release_from_own_state,
          state_id 
          from public.budget_allotment  
          where plan_year = '${plan_year}'
          group by state_id 
          )
           select * from cteprop left join ctef on (  ctef.state_id = cteprop.state_id ) ${where} order by state_name`);
    //   order by state_name

    if (object) {
      return Response.handle(req, res, "downloadFile", 200, {
        status: true,
        data: object.rows,
      });
    } else {
      return Exception.handle(e, res, req, "downloadfile");
    }
  } catch (e) {
    return Exception.handle(e, res, req, "downloadfile");
  }
};

exports.districtApprovedList = async (req, res) => {
  try {
    const plan_year = req.headers?.api_year;
    const { state_id } = req.body;

    const object = await Model.knx().raw(`with cte as (
      select sum(released_amount) filter (where transaction_type= 2 and alloted_from = 'State' and recurring_non_recurring = 1) as recurring_release_from_own_state,
      sum(released_amount) filter (where transaction_type= 2 and alloted_from = 'State' and recurring_non_recurring = 2) as non_recurring_release_from_own_state,
      district_id ,
      state_id      
      from budget_allotment ba 
       where plan_year = '2024-2025' 
       group by district_id ,
      state_id 
       ) 
          select * from  allocation.view_state_district_combined vsdc left join cte on (cte.state_id = district_state_id and cte.district_id = vsdc.district_id)
          where vsdc.district_state_id = ${state_id} order by vsdc.district_name`);

    if (object) {
      return Response.handle(req, res, "downloadFile", 200, {
        status: true,
        data: object.rows,
      });
    } else {
      return Exception.handle(e, res, req, "downloadfile");
    }
  } catch (e) {
    return Exception.handle(e, res, req, "downloadfile");
  }
};

exports.downloadFile = async (req, res) => {
  try {
    const id = req.params.id;
    const object = (await Model.find({ id }))[0];
    if (object) {
      const paths = "/../../../" + UPLOAD_FILE_PATH;
      const excelFilePath = path.join(__dirname, `${paths}/${object?.installment_doc}`);
      res.sendFile(excelFilePath, (err) => {
        if (err) {
          console.error('Error sending file:', err);
          res.status(err.status).end();
        } else {
        }
      });
    } else {
      return Exception.handle(e, res, req, "downloadfile");
    }
  } catch (e) {
    return Exception.handle(e, res, req, "downloadfile");
  }
};

exports.approveBudget = async (req, res) => {
  try {
    const request = req.body;
    const object = await Model.update(request.data, request.id);

    return Response.handle(req, res, "approveBudget", 200, {
      status: true,
      data: object,
    });
  } catch (e) {
    return Exception.handle(e, res, req, "approveBudget");
  }
};

exports.getAllocatedBudget = async (req, res) => {
  try {
    const request = req.body;
    request.plan_year = req.headers?.api_year;
    const object = await Model.find(request);

    return Response.handle(req, res, "getAllocatedBudget", 200, {
      status: true,
      data: object,
    });
  } catch (e) {
    return Exception.handle(e, res, req, "getAllocatedBudget");
  }
};

exports.getApprovedBudget = async (req, res) => {
  try {
    const object = await Model.findTotalApprovedBudget();
    console.log(object, "Obj")

    return Response.handle(req, res, "getApprovedBudget", 200, {
      status: true,
      data: object,
    });
  } catch (e) {
    return Exception.handle(e, res, req, "getApprovedBudget");
  }
};

exports.getApprovedBudgetForState = async (req, res) => {
  try {
    const request = req.body;
    const apiYear = req.headers?.api_year;
    console.log(request)
    // const object = await Model.findTotalApprovedBudgetForState(request);
    const object = await Model.knx().raw(`select proposed_financial_amount as total_approved ,
        proposed_financial_amount * center_share_percent/100 as central_share , 
        proposed_financial_amount * (100-center_share_percent )/100 as state_share
    from (	
      select sum(proposed_financial_amount) as  proposed_financial_amount , state 
      from prb_state_ann_wrk_pln_bdgt_data psawpbd 
      where state = ${request.state_id} and plan_year = '${apiYear}' group by state
      ) aa, (select state_id, 
      SUM(mstp.tentative_total_estimates) as total_approved,
      SUM(mstp.tentative_central_share) as central_share,
      SUM(mstp.tentative_state_share) as state_share,
      max(center_share_percent) as center_share_percent
    from
      "master_states_tentative_proposed" as "mstp"
    where
      "state_id" = ${request.state_id}
      and "year_id" = ${request.year_id}
      group by state_id ) bb
      where  aa.state = bb.state_id`);

    return Response.handle(req, res, "getApprovedBudgetForState", 200, {
      status: true,
      data: object.rows,
    });
  } catch (e) {
    return Exception.handle(e, res, req, "getApprovedBudgetForState");
  }
};

exports.getAllotedBudgetForState = async (req, res) => {
  try {
    const request = req.body;
    request.plan_year = req.headers?.api_year;
    const object = await Model.findTotalAllotedBudgetForState(request);

    return Response.handle(req, res, "getAllotedBudgetForState", 200, {
      status: true,
      data: object,
    });
  } catch (e) {
    return Exception.handle(e, res, req, "getAllotedBudgetForState");
  }
};

exports.saveSnaDetail = async (req, res) => {
  try {
    const {state_id,month_id,fortnight,elementary_non_recuring,elementary_recuring,
      elementary_total= parseFloat(elementary_non_recuring)+parseFloat(elementary_recuring),
      secondary_non_recuring,secondary_recuring,
      secondary_total= parseFloat(secondary_non_recuring)+parseFloat(secondary_recuring),
      teacher_non_recuring,teacher_recuring,
      teacher_total= parseFloat(teacher_non_recuring)+parseFloat(teacher_recuring)} = req.body;
    const plan_year = req.headers?.api_year;
    const created_by = req.auth.user.id;

    const object = await Model.knx().raw(`insert into sna_details 
      (state_id,plan_year,month_id,fortnight,elementary_non_recuring,elementary_recuring,elementary_total,secondary_non_recuring,secondary_recuring,
      secondary_total,teacher_non_recuring,teacher_recuring,teacher_total,created_by) values (${state_id},'${plan_year}',${month_id},${fortnight},${elementary_non_recuring},${elementary_recuring},${elementary_total},${secondary_non_recuring},${secondary_recuring},${
        secondary_total},${teacher_non_recuring},${teacher_recuring},${teacher_total},${created_by})`);

    return Response.handle(req, res, "saveSnaDetail", 200, {
      status: true,
      data: object,
    });
  } catch (e) {
    return Exception.handle(e, res, req, "saveSnaDetail");
  }
};


exports.snaDetail = async (req, res) => {
  try {
    const {state_id} = req.body;
    const plan_year = req.headers?.api_year;

    const object = await Model.knx().raw(`select * from sna_details where state_id=${state_id} and plan_year='${plan_year}'`);

    return Response.handle(req, res, "snaDetail", 200, {
      status: true,
      data: object.rows,
    });
  } catch (e) {
    return Exception.handle(e, res, req, "snaDetail");
  }
};

exports.saveDietBudgetAllot = async (req, res) => {
  try {
    const request = req.body;
    request.document = "/fundreleased/" + req?.file?.filename;
    request.plan_year = req.headers?.api_year;

    delete request.file;
    // const sanction_duplicate = await Model.find({ sension_number: request.sension_number, state_id: request.state_id })
    // if (sanction_duplicate.length !== 0) {
    //   return res.status(400).json({ status: 400, message: 'Sanction Number Already Exist' })
    // }
    // const installment_duplicate = await Model.find({ installment_number: request.installment_number, state_id: request.state_id })
    // console.log(installment_duplicate, sanction_duplicate)
    // if (installment_duplicate.length !== 0) {
    //   return res.status(400).json({ status: 400, message: 'Installment Already send' })
    // }
    const object = await Model.createDietFund(request);
    return Response.handle(req, res, "saveDietBudgetAllot", 200, {
      status: true,
      data: object,
    });
  } catch (e) {
    return Exception.handle(e, res, req, "saveDietBudgetAllot");
  }
}

exports.downloadDietFile = async (req, res) => {
  try {
    const id = req.params.id;
    let object = await Model.knx().raw(`select * from diet_budget_received where id=${id}`);
    if (object && object.rows && object.rows.length>0) {
      object = object.rows[0];
      const paths = "/../../../" + UPLOAD_FILE_PATH;
      const excelFilePath = path.join(__dirname, `${paths}/${object?.document}`);
      res.sendFile(excelFilePath, (err) => {
        if (err) {
          console.error('Error sending file:', err);
          res.status(err.status).end();
        } else {
        }
      });
    } else {
      return Exception.handle(e, res, req, "downloadDietFile");
    }
  } catch (e) {
    return Exception.handle(e, res, req, "downloadDietFile");
  }
};