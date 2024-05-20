const Model = require("../../models").ReportModel;
const SchoolModel = require("../../models").School;
const Exception = require("../Assets/ExceptionHandler");
const Response = require("../Assets/ResponseHandler");

exports.list = async (req, res) => {
  try {
    const request = req.body;
    const object = await Model.listReports({ user_role_id: request.user_role_id })
    res.status(200).json({ status: true, data: object });
  } catch (e) {
    return Exception.handle(e, res, req, '');
  }
};

// exports.stateCostingSheetReport = async (req, res) => {
//   try {
//     const year = req?.headers?.api_year || "2024-2025";
//     const { state_id } = req.body;

//     let object = await Model.knx().raw(`select 
//     ps.title  as scheme_name, pmc.title as  major_component_name , psc.title as  sub_component_name , pam.title as activity_master_name , pd.activity_master_details_name ,
//      physical_quantity,unit_cost, financial_amount,
//       case when (aa.activity_master_id is null ) then 888888 else aa.activity_master_id end activity_master_id,
//       case when (aa.sub_component_id is null ) then 777777 else aa.sub_component_id end sub_component_id,
//       case when (aa.major_component_id is null ) then 666666 else aa.major_component_id end major_component_id,
//       case when (aa.scheme_id is null ) then '555555' else aa.scheme_id end scheme_id,
//       case when (aa.activity_master_details_id is null ) then 999999 else aa.activity_master_details_id end activity_master_details_id 
     
//        from (
//       SELECT  CAST(SUM(pawpbd.financial_amount) AS numeric(16, 5)) AS financial_amount,
//           sum(pawpbd.physical_quantity) AS physical_quantity,
//           (sum(pawpbd.financial_amount)/ nullif(sum(pawpbd.physical_quantity),0))::numeric(16,5) as unit_cost ,
//           pawpbd.scheme_id,
//           pawpbd.major_component_id,
//           pawpbd.sub_component_id,
//           pawpbd.activity_master_id,
//           pawpbd.activity_master_details_id
//          FROM prb_ann_wrk_pln_bdgt_data pawpbd
//         WHERE pawpbd.state = ${state_id}  and pawpbd.plan_year= '${year}' 
//         and (coalesce (financial_amount,0) + coalesce (physical_quantity,0)) > 0
//         GROUP BY GROUPING SETS ((pawpbd.scheme_id, pawpbd.major_component_id, pawpbd.sub_component_id, pawpbd.activity_master_id, pawpbd.activity_master_details_id), (pawpbd.scheme_id, pawpbd.major_component_id, pawpbd.sub_component_id, pawpbd.activity_master_id), (pawpbd.scheme_id, pawpbd.major_component_id, pawpbd.sub_component_id), (pawpbd.scheme_id, pawpbd.major_component_id), (pawpbd.scheme_id), ())
//       ) 
//       aa 
//        left join prb_data pd on (pd.id= aa.activity_master_details_id)
//        left join prb_activity_master pam on (pam.id= aa.activity_master_id)
//        left join prb_sub_component psc on (psc.sub_component_id= aa.sub_component_id)
//        left join prb_major_component pmc   on (pmc.prb_major_component_id = aa.major_component_id)
//        left join prb_schemes ps on (ps.id= aa.scheme_id::numeric)
//        order by aa.scheme_id , aa.major_component_id , aa.sub_component_id , aa.activity_master_id ,aa.activity_master_details_id`);

//     return Response.handle(req, res, "stateCostingSheetReport", 200, {
//       status: true,
//       message: true,
//       data: object,
//     });
//   } catch (e) {
//     return Exception.handle(e, res, req, "stateCostingSheetReport");
//   }
// };

// exports.newReportData = async (req, res) => {
//   const { state_id, district_id } = req.body;
//   const year = req?.headers?.api_year
//   const object = await SchoolModel.NewReportData({ state_id, year });
//   res.status(200).json({ status: true, data: object });
// };

// exports.stateCostingProposedSheetReport = async (req, res) => {
//   try {
//     const year = req?.headers?.api_year || "2024-2025";
//     const { state_id } = req.body;

//     let object = await Model.knx().raw(`select 
//     ps.title  as scheme_name, pmc.title as  major_component_name , psc.title as  sub_component_name , pam.title as activity_master_name , pd.activity_master_details_name ,
//     physical_quantity,unit_cost, financial_amount,
//     proposed_physical_quantity, proposed_unit_cost, proposed_financial_amount,coordinator_remarks,
//     case when (aa.activity_master_id is null ) then 888888 else aa.activity_master_id end activity_master_id,
//     case when (aa.sub_component_id is null ) then 777777 else aa.sub_component_id end sub_component_id,
//     case when (aa.major_component_id is null ) then 666666 else aa.major_component_id end major_component_id,
//     case when (aa.scheme_id is null ) then '555555' else aa.scheme_id end scheme_id,
//     case when (aa.activity_master_details_id is null ) then 999999 else aa.activity_master_details_id end activity_master_details_id 
//      from (
//     SELECT  
//         CAST(SUM(pawpbd.financial_amount) AS numeric(16, 5)) AS financial_amount,
//         sum(pawpbd.physical_quantity) AS physical_quantity,
//         (sum(pawpbd.financial_amount)/ nullif(sum(pawpbd.physical_quantity),0))::numeric(16,5) as unit_cost ,
//         CAST(SUM(pawpbd.proposed_financial_amount) AS numeric(16, 5)) AS proposed_financial_amount,
//         sum(pawpbd.proposed_physical_quantity) AS proposed_physical_quantity,
//         (sum(pawpbd.proposed_financial_amount)/ nullif(sum(pawpbd.proposed_physical_quantity),0))::numeric(16,5) as proposed_unit_cost ,
//         max(coordinator_remarks)as coordinator_remarks,
//         pawpbd.scheme_id,
//         pawpbd.major_component_id,
//         pawpbd.sub_component_id,
//         pawpbd.activity_master_id,
//         pawpbd.activity_master_details_id
//        FROM prb_state_ann_wrk_pln_bdgt_data pawpbd
//        WHERE pawpbd.state = ${state_id}  and pawpbd.plan_year= '${year}' and (physical_quantity+ financial_amount) > 0
//       GROUP BY GROUPING SETS ((pawpbd.scheme_id, pawpbd.major_component_id, pawpbd.sub_component_id, pawpbd.activity_master_id, pawpbd.activity_master_details_id), (pawpbd.scheme_id, pawpbd.major_component_id, pawpbd.sub_component_id, pawpbd.activity_master_id), (pawpbd.scheme_id, pawpbd.major_component_id, pawpbd.sub_component_id), (pawpbd.scheme_id, pawpbd.major_component_id), (pawpbd.scheme_id), ())
//     ) 
//     aa 
//      left join prb_data pd on (pd.id= aa.activity_master_details_id)
//      left join prb_activity_master pam on (pam.id= aa.activity_master_id)
//      left join prb_sub_component psc on (psc.sub_component_id= aa.sub_component_id)
//      left join prb_major_component pmc   on (pmc.prb_major_component_id = aa.major_component_id)
//      left join prb_schemes ps on (ps.id= aa.scheme_id::numeric)
//      order by aa.scheme_id , aa.major_component_id , aa.sub_component_id , aa.activity_master_id ,aa.activity_master_details_id`);

//     return Response.handle(req, res, "stateCostingProposedSheetReport", 200, {
//       status: true,
//       message: true,
//       data: object,
//     });
//   } catch (e) {
//     return Exception.handle(e, res, req, "stateCostingProposedSheetReport");
//   }
// };

// exports.getSavedDataSpillFun = async (filters) => {
//   const {
//     state_id,
//     scheme_id,
//     major_component_id,
//     sub_component_id,
//     activity_master_id,
//     activity_master_details_id,
//     inception_year,
//   } = filters;
//   var object;
//   let where = ``;
//   if (state_id) {
//     if (state_id != 0 && state_id != null) {
//       where += ` and pawpbso.state = ${state_id}`;
//     }
//     if (+scheme_id) {
//       where += ` and pawpbso.scheme_id = '${scheme_id}'`;
//     }
//     /*     if (inception_year) {
//       where += ` and pawpbso.inception_year = '${inception_year}'`;
//     } */
//     if (+major_component_id) {
//       where += ` and pawpbso.major_component_id = ${major_component_id}`;
//     }
//     if (+sub_component_id) {
//       where += ` and pawpbso.sub_component_id = ${sub_component_id}`;
//     }
//     if (+activity_master_id) {
//       where += ` and pawpbso.activity_master_id = ${activity_master_id}`;
//     }
//     if (+activity_master_details_id) {
//       where += ` and pawpbso.activity_master_details_id = ${activity_master_details_id}`;
//     }

//     object = await Model.knx().raw(`
//       select 
//       ROW_NUMBER() OVER () AS index,
//       pd.scheme_name , pd.major_component_name , pd.sub_component_name , pd.activity_master_name , pd.activity_master_details_name ,
//       pawpbso.inception_year,pawpbso.prb_ann_wrk_pln_bdgt_spill_over_id , pawpbso.status ,
//       coalesce(pawpbso.physical_quantity_cummu_inception, 0) physical_quantity_cummu_inception,
//       coalesce(pawpbso.financial_amount_cummu_inception, 0) financial_amount_cummu_inception,
//       coalesce(pawpbso.physical_quantity_progress_complete_inception, 0) physical_quantity_progress_complete_inception,
//       coalesce(pawpbso.physical_quantity_progress_progress_inception, 0) physical_quantity_progress_progress_inception,
//       coalesce(pawpbso.financial_amount_progress_inception, 0) financial_amount_progress_inception,
//       coalesce(pawpbso.physical_quantity_progress_notstart_inception, 0) physical_quantity_progress_notstart_inception,
//       coalesce(pawpbso.spillover_amount, 0) spillover_amount,
//       coalesce(pawpbso.spillover_quantity, 0) spillover_quantity,
//       coalesce(pawpbso.fresh_approval_physical_quantity, 0) fresh_approval_physical_quantity,
//       coalesce(pawpbso.fresh_approval_financial_amount, 0) fresh_approval_financial_amount,
//       coalesce(pawpbso.exp_against_fresh_app_phy_ip, 0) exp_against_fresh_app_phy_ip,
//       coalesce(pawpbso.exp_against_fresh_app_phy_ns, 0) exp_against_fresh_app_phy_ns,
//       coalesce(pawpbso.exp_against_fresh_app_phy_c, 0) exp_against_fresh_app_phy_c,
//       coalesce(pawpbso.exp_against_fresh_app_fin, 0) exp_against_fresh_app_fin,
//       coalesce((pawpbso.exp_against_fresh_app_phy_ip + pawpbso.exp_against_fresh_app_phy_ns + pawpbso.exp_against_fresh_app_phy_c), 0) as fresh_total,
//       coalesce((pawpbso.physical_quantity_progress_progress_inception + pawpbso.physical_quantity_progress_notstart_inception + pawpbso.physical_quantity_progress_complete_inception), 0) as exp_total
//       from prb_ann_wrk_pln_bdgt_spill_over pawpbso , prb_data pd 
//       where pawpbso.activity_master_details_id = pd.id ${where}
//       order by pawpbso.updated_at desc nulls last`);
//   }

//   return object && object.rows ? object.rows : [];
// };

// exports.getSavedDataSpill = async (req, res) => {
//   try {
//     const data = await this.getSavedDataSpillFun(
//       ({
//         state_id,
//         scheme_id,
//         major_component_id,
//         sub_component_id,
//         activity_master_id,
//         activity_master_details_id,
//         inception_year,
//       } = req.body)
//     );

//     // const token = ((req.headers.authorization).split(' '))[1];
//     // let responseFromApiLogger = await ApiLog.create(token, req.originalUrl, 'getSavedDataSpill', req.body, { status: true, data: data });
//     // res.status(200).json({ status: true, data: data });

//     return Response.handle(req, res, "getSavedDataSpill", 200, {
//       status: true,
//       data: data,
//     });
//   } catch (e) {
//     return Exception.handle(e, res, req, "getSavedDataSpill");
//   }
// };

// exports.getExpenditureReport = async (req, res) => {
//   try {
//     const { state_id } = req.body;

//     const object = await Model.knx().raw(`select 
//     ps.title  as scheme_name, pmc.title as  major_component_name , psc.title as  sub_component_name , pam.title as activity_master_name , pd.activity_master_details_name ,
//      budget_quantity,budget_amount, progress_quantity, progress_amount,
//       case when (aa.activity_master_id is null ) then 888888 else aa.activity_master_id end activity_master_id,
//       case when (aa.sub_component_id is null ) then 777777 else aa.sub_component_id end sub_component_id,
//       case when (aa.major_component_id is null ) then 666666 else aa.major_component_id end major_component_id,
//       case when (aa.scheme_id is null ) then '555555' else aa.scheme_id end scheme_id,
//       case when (aa.activity_master_details_id is null ) then 999999 else aa.activity_master_details_id end activity_master_details_id 
//        from (
//       SELECT sum(pawpbpp.budget_quantity) AS budget_quantity,
//           CAST(SUM(pawpbpp.budget_amount) AS numeric(16, 5)) AS budget_amount,
//           sum(pawpbpp.progress_quantity) AS progress_quantity,
//           CAST(SUM(pawpbpp.progress_amount) AS numeric(16, 5)) AS progress_amount,
//           pawpbpp.scheme_id,
//           pawpbpp.major_component_id,
//           pawpbpp.sub_component_id,
//           pawpbpp.activity_master_id,
//           pawpbpp.activity_master_details_id
//          FROM prb_ann_wrk_pln_bdgt_prev_progress pawpbpp  
//         WHERE pawpbpp.state = ${state_id}
//         and (budget_quantity+ budget_amount + progress_quantity +progress_amount > 0 )
//         GROUP BY GROUPING SETS ((pawpbpp.scheme_id, pawpbpp.major_component_id, pawpbpp.sub_component_id, pawpbpp.activity_master_id, pawpbpp.activity_master_details_id), (pawpbpp.scheme_id, pawpbpp.major_component_id, pawpbpp.sub_component_id, pawpbpp.activity_master_id), (pawpbpp.scheme_id, pawpbpp.major_component_id, pawpbpp.sub_component_id), (pawpbpp.scheme_id, pawpbpp.major_component_id), (pawpbpp.scheme_id), ())
//       ) 
//       aa 
//        left join prb_data pd on (pd.id= aa.activity_master_details_id)
//        left join prb_activity_master pam on (pam.id= aa.activity_master_id)
//        left join prb_sub_component psc on (psc.sub_component_id= aa.sub_component_id)
//        left join prb_major_component pmc   on (pmc.prb_major_component_id = aa.major_component_id)
//        left join prb_schemes ps on (ps.id= aa.scheme_id::numeric)
//        order by aa.scheme_id , aa.major_component_id , aa.sub_component_id , aa.activity_master_id ,aa.activity_master_details_id
//     `);

//     return Response.handle(req, res, "getExpenditureReport", 200, {
//       status: true,
//       data: object?.rows || [],
//     });

//   } catch (e) {
//     return Exception.handle(e, res, req, "getExpenditureReport");
//   }
// };

// exports.getPptData = async (req, res) => {
//   try {
//     const { state_id } = req.body;

//     let result = await Model.knx().raw(`select ROW_NUMBER() OVER (ORDER BY qc.group_name, state) AS serial_number, qc.group_name, 
//                                         Round(sum(p.financial_amount),5) as state_demand, sum(p.proposed_financial_amount) as proposed
//                                         from  prb_state_ann_wrk_pln_bdgt_data p, bibek.qpptreport_csv qc  
//                                         where qc.activity_master_detail_id = p.activity_master_details_id 
//                                         and p.plan_year ='2024-2025' and state in (${state_id})
//                                         group by qc.group_name ,state`);

//     return Response.handle(req, res, "getPptData", 200, {
//       status: true,
//       message: true,
//       data: result,
//     });
//   } catch (e) {
//     return Exception.handle(e, res, req, "getPptData");
//   }
// };

// exports.getSpilloversecond = async (req, res) => {
//   try {
//     const { state_id } = req.body;
//     let result = await Model.knx().raw(`select * from report.view_spillover_report_without_scheme_final where state = ${state_id}
//       order by major_component_id, sub_component_id, activity_master_id, activity_master_details_id`)

//     return Response.handle(req, res, "getPptData", 200, {
//       status: true,
//       message: true,
//       data: result.rows,
//     });
//   } catch (e) {
//     return Exception.handle(e, res, req, "getPptData");
//   }
// };

// exports.getAnnexureReport = async (req, res) => {
//   try {
//     const { state_id } = req.body;
//     const api_year = req?.headers?.api_year


//     let result = await Model.knx().raw(`
//     with cte1 as (
//     select * from public.prb_state_ann_wrk_pln_bdgt_data psawpbd   
//     where state = ${state_id} and plan_year = '${api_year}' and proposed_physical_quantity  > 0
//     ) , 
    
//      cte2 as (
//     select * from 
//     public.prb_state_ann_wrk_pln_bdgt_data_physical_asset  am 
//     inner join public.prb_school_master psm on am.asset_code = psm.udise_sch_code 
//     where am.state  = ${state_id} and plan_year ='${api_year}'
//     )
//      select  
//              concat(ad.scheme_id,'',ad.major_component_id,'',ad.sub_component_id,'',ad.activity_master_id,'',ad.id,cte1.proposed_physical_quantity) as test,
//              ad.id,
//              ad.activity_master_details_name ,
//              ad.scheme_id ,
//              ad.scheme_name ,
//              ad.major_component_id ,
//              ad.major_component_name ,
//              ad.sub_component_id ,
//              ad.sub_component_name ,
//              ad.activity_master_id ,
//              ad.activity_master_name ,
//             cte1.activity_master_details_id,
//             cte1.proposed_physical_quantity,
//             cte1.proposed_financial_amount,
//             cte1.proposed_unit_cost,
//             cte1.eligible_for_allocation,
//             cte2.school_id,
//             cte2.udise_sch_code,
//             school_name,
//             district_name
//             from cte1 left join cte2 on ( cte1.activity_master_details_id = cte2.activity_master_details_id )
//      inner join prb_data ad on (cte1.activity_master_details_id = ad.id) where ad.dd_school = '1'
//      order by ad.id`)
//     // let result = await Model.knx().raw(`
//     // select concat( aa.scheme_name,aa.major_component_name, aa.sub_component_name,aa.activity_master_name, aa.activity_master_details_name) as test, aa.*, psm.udise_sch_code , psm.school_name , psm.district_name , psm.block_name  from (            
//     //     SELECT 
//     //     ad.id,
//     //     ad.activity_master_details_name ,
//     //     ad.scheme_id ,
//     //     ad.scheme_name ,
//     //     ad.major_component_id ,
//     //     ad.major_component_name ,
//     //     ad.sub_component_id ,
//     //     ad.sub_component_name ,
//     //     ad.activity_master_id ,
//     //     ad.activity_master_name ,
//     //     am.asset_code,
//     //     am.quantity ,
//     //     am.financial_quantity ,
//     //     am.state 
//     // FROM 
//     //     public.prb_data ad
//     // LEFT JOIN 
//     //     public.prb_state_ann_wrk_pln_bdgt_data_physical_asset   am ON ad.id = am.activity_master_details_id
//     //     where  am.state  = ${state_id}  OR am.state  IS null
//     //     and ad.dd_school ='1'
//     // ) aa left join public.prb_school_master psm on aa.asset_code = psm.udise_sch_code 
//     //   order by aa.id  `)

//     return Response.handle(req, res, "getPptData", 200, {
//       status: true,
//       message: true,
//       data: result.rows,
//     });
//   } catch (e) {
//     return Exception.handle(e, res, req, "getPptData");
//   }
// };