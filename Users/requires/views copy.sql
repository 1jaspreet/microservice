	DROP VIEW IF EXISTS public.summary_exemp_school_master_level_benchmark;
	CREATE OR REPLACE VIEW public.summary_exemp_school_master_level_benchmark
 	AS
    SELECT esmlb.state_id,
        esmlb.district_id,
        esmlb.district_name,
        esmlb.block_name,
        esmlb.udise_code,
        esmlb.school_name,
        esmlb.sch_mgmt_center_id,
        esmlb.sch_mgmt_id,
        esmlb.category_id,
        esmlb.sch_broad_category_id,
        esmlb.class_frm,
        esmlb.class_to,
        concat(esmlb.class_frm, '-', esmlb.class_to) AS classes,
        esmlb.tot_enr_b,
        esmlb.tot_enr_g,
        esmlb.tot_enr,
        esmlb.tot_teacher,
        esmlb.sch_medium,
        esmlb.location_type,
        esmlb.school_type,
        esmlb.drink_water,
            CASE
                WHEN esmlb.drink_water > 0 THEN 'Yes'::text
                ELSE 'No'::text
            END AS drink_water_value,
        esmlb.func_toilet_b,
            CASE
                WHEN esmlb.func_toilet_b > 0 THEN 'Yes'::text
                ELSE 'No'::text
            END AS func_toilet_b_value,
        esmlb.func_toilet_g,
            CASE
                WHEN esmlb.func_toilet_g > 0 THEN 'Yes'::text
                ELSE 'No'::text
            END AS func_toilet_g_value,
            CASE
                WHEN esmlb.toilet_functional > 0 THEN 'Yes'::text
                ELSE 'No'::text
            END AS toilet_functional_value,
        esmlb.pucca_building,
            CASE
                WHEN esmlb.pucca_building > 0 THEN 'Yes'::text
                ELSE 'No'::text
            END AS pucca_building_value,
            CASE
                WHEN esmlb.pucca_building > 0 THEN 'Yes'::text
                ELSE 'No'::text
            END AS pucca_building_value,
        esmlb.electricity,
            CASE
                WHEN esmlb.electricity > 0 THEN 'Yes'::text
                ELSE 'No'::text
            END AS electricity_value,
        esmlb.sch_type,
            CASE
                WHEN esmlb.sch_type = 1 THEN 'Boys'::text
                WHEN esmlb.sch_type = 2 THEN 'Girls'::text
                ELSE 'Co-Ed'::text
            END AS sch_type_value,
        esmlb.avg_enr,
        esmlb.selection_status,
        esmlb.remarks,
        esmlb.final_flag,
            CASE
                WHEN esmlb.final_flag = 0 THEN 'No Action'::text
                WHEN esmlb.final_flag = 1 THEN 'Completed'::text
                WHEN esmlb.final_flag = 2 THEN 'Rejected'::text
                WHEN esmlb.final_flag = 3 THEN 'Approved'::text
                ELSE NULL::text
            END AS final_flag_value,
        esmlb.tot_govt_sch,
        esmlb.sch_excluded,
        esmlb.sch_benchmark,
        esmlb.sch_target,
        esmlb.flag,
        esmlb.back_image_flag,
        esmlb.front_image_flag,
        esmlb.letter_image_flag,
        esmlb.questions_flag,
        esmlb.name AS school_admin_name,
        esmlb.email AS school_admin_email,
        esmlb.mobile AS school_admin_mobile,
        sc.name AS category_name,
        s.name AS state_name,
        esmlb.rcmd_flag,
            CASE
                WHEN esmlb.rcmd_flag = 0 THEN 'No Action'::text
                WHEN esmlb.rcmd_flag = 1 THEN 'Recommended'::text
                WHEN esmlb.rcmd_flag = 2 THEN 'Rejected'::text
                ELSE NULL::text
            END AS rcmd_flag_value,
        esmlb.is_active,
            CASE
                WHEN esmlb.is_active = 0 THEN 'No Action'::text
                WHEN esmlb.is_active = 1 THEN 'Invited'::text
                WHEN esmlb.is_active = 2 THEN 'Rejected'::text
                ELSE NULL::text
            END AS is_active_value,
        esmlb.admin_quetions
    FROM exemp_school_master_level_benchmark esmlb
        LEFT JOIN master_categories sc ON sc.id = esmlb.category_id
        LEFT JOIN master_states s ON s.id = esmlb.state_id
    ORDER BY esmlb.tot_enr DESC;

  	/*************************************************************************************************************************************/

  	/*************************************************************************************************************************************/

    CREATE OR REPLACE VIEW public.state_report_school_benchmark_submission_views 	AS
    SELECT state_id,count(id) FROM public.school_benchmarks group by state_id order by state_id

    CREATE OR REPLACE VIEW public.district_report_school_benchmark_submission_views 	AS
    SELECT district_id,count(id) FROM public.school_benchmarks group by district_id order by district_id

    CREATE OR REPLACE VIEW public.block_report_school_benchmark_submission_views 	AS
    SELECT block_id,count(id) FROM public.school_benchmarks group by block_id order by block_id

  	/*************************************************************************************************************************************/
    DROP VIEW IF EXISTS public.block_report_school_benchmark_submission_views;
    CREATE OR REPLACE VIEW public.block_report_school_benchmark_submission_views
    AS SELECT sblo.state_id,
        sblo.state_name,
        sblo.district_id,
        sblo.district_name,
        sblo.block_id,
        sblo.block_name,
        count(sblo.id) AS benchmark_school,
        ( SELECT count(DISTINCT sqm.schools_id) AS count
            FROM school_question_markings sqm
                JOIN users u ON u.id = sqm.schools_id
                JOIN school_benchmarks sclos ON sclos.udise_code::text = u.udise_code::text AND (sclos.state_id <> ALL (ARRAY[175, 176]))
            WHERE sclos.block_id = sblo.block_id) AS school_attended,
        ( SELECT count(DISTINCT sblon.id) AS count
            FROM school_benchmarks sblon
            WHERE sblon.block_id = sblo.block_id AND sblon.final_flag = '1'::smallint AND sblon.block_id <> 0 AND (sblon.state_id <> ALL (ARRAY[175, 176]))
            GROUP BY sblon.block_id) AS school_completed,
        ( SELECT count(sblod.id) AS count
            FROM school_benchmarks sblod
            WHERE sblod.passed_status = 1 AND sblod.block_id = sblo.block_id AND (sblod.state_id <> ALL (ARRAY[175, 176]))) AS school_passed,
        ( SELECT count(sblod.id) AS count
            FROM school_benchmarks sblod
            WHERE sblod.district_verification = 0 AND sblod.block_id = sblo.block_id AND (sblod.state_id <> ALL (ARRAY[175, 176]))) AS school_verified_unapproved,
        ( SELECT count(sblod.id) AS count
            FROM school_benchmarks sblod
            WHERE sblod.district_verification >= 0 AND sblod.block_id = sblo.block_id AND (sblod.state_id <> ALL (ARRAY[175, 176]))) AS district_selection,
        ( SELECT count(sblod.id) AS count
            FROM school_benchmarks sblod
            WHERE sblod.state_status = 1 AND sblod.block_id = sblo.block_id AND (sblod.state_id <> ALL (ARRAY[175, 176]))) AS state_selection,
        ( SELECT count(sblod.id) AS count
            FROM school_benchmarks sblod
            WHERE sblod.national_status = 1 AND sblod.block_id = sblo.block_id AND (sblod.state_id <> ALL (ARRAY[175, 176]))) AS national_selection,            
        ( SELECT count(md.id) AS count
            FROM master_districts md
            WHERE md.id = sblo.district_id AND md.freeze_status = 1 AND md.is_freezed = 1) AS district_freeze,
        ( SELECT count(md.id) AS count
            FROM master_states md
            WHERE md.id = sblo.state_id AND md.is_state_freezed = 1 AND md.state_freeze_status = 1) AS state_freeze, 
        ( SELECT count(md.id) AS count         
            FROM master_districts md
            WHERE  md.id = sblo.district_id and md.freeze_status = 1 and md.is_freezed = 1 and district_acknowledgement = 1
        ) AS district_acknowledgement,
        ( SELECT count(md.id) AS count         
            FROM master_states md
            WHERE  md.id = sblo.state_id and md.is_state_freezed = 1 and md.state_freeze_status = 1 and state_acknowledgement = 1
        ) AS state_acknowledgement 

    FROM school_benchmarks sblo
    WHERE sblo.block_id <> 0 AND (sblo.state_id <> ALL (ARRAY[175, 176]))
    GROUP BY sblo.state_id, sblo.state_name, sblo.district_id, sblo.district_name, sblo.block_id, sblo.block_name
    ORDER BY sblo.state_id, sblo.district_id;

    DROP VIEW IF EXISTS public.district_report_school_benchmark_submission_views;
    CREATE OR REPLACE VIEW public.district_report_school_benchmark_submission_views
    AS SELECT sblo.state_id,
        sblo.state_name,
        sblo.district_id,
        sblo.district_name,
        count(sblo.id) AS benchmark_school,
        ( SELECT count(DISTINCT sqm.schools_id) AS count
            FROM school_question_markings sqm
                JOIN users u ON u.id = sqm.schools_id
                JOIN master_districts md ON u.district_id = md.id
            WHERE md.id = sblo.district_id) AS school_attended,
        ( SELECT count(sblon.id) AS count
            FROM school_benchmarks sblon
            WHERE sblon.final_flag = '1'::smallint AND sblon.district_id = sblo.district_id
            GROUP BY sblon.district_id, sblon.district_name) AS school_completed,
        ( SELECT count(sblod.id) AS count
            FROM school_benchmarks sblod
            WHERE sblod.passed_status = 1 AND sblod.district_id = sblo.district_id) AS school_passed,
        ( SELECT count(sblod.id) AS count
            FROM school_benchmarks sblod
            WHERE sblod.district_verification = 0 AND sblod.district_id = sblo.district_id) AS school_verified_unapproved,
        ( SELECT count(sblod.id) AS count
            FROM school_benchmarks sblod
            WHERE sblod.district_verification >= 0 AND sblod.district_id = sblo.district_id) AS district_selection,
        ( SELECT count(sblod.id) AS count
            FROM school_benchmarks sblod
            WHERE sblod.state_status = 1 AND sblod.district_id = sblo.district_id) AS state_selection,
        ( SELECT count(sblod.id) AS count
            FROM school_benchmarks sblod
            WHERE sblod.national_status = 1 AND sblod.district_id = sblo.district_id) AS national_selection,
        ( SELECT count(md.id) AS count         
            FROM master_districts md
            WHERE  md.id = sblo.district_id and md.freeze_status = 1 and md.is_freezed = 1
            ) AS district_freeze,
        ( SELECT count(md.id) AS count         
            FROM master_states md
            WHERE  md.id = sblo.state_id and md.is_state_freezed = 1 and md.state_freeze_status = 1
            ) AS state_freeze,      
        ( SELECT count(md.id) AS count         
            FROM master_districts md
            WHERE  md.id = sblo.district_id and md.freeze_status = 1 and md.is_freezed = 1 and district_acknowledgement = 1
            ) AS district_acknowledgement,
        ( SELECT count(md.id) AS count         
            FROM master_states md
            WHERE  md.id = sblo.state_id and md.is_state_freezed = 1 and md.state_freeze_status = 1 and state_acknowledgement = 1
            ) AS state_acknowledgement
    FROM school_benchmarks sblo
    GROUP BY sblo.state_id, sblo.state_name, sblo.district_id, sblo.district_name
    ORDER BY sblo.state_id;


    
    DROP VIEW IF EXISTS public.state_report_school_benchmark_submission_views;
    CREATE OR REPLACE VIEW public.state_report_school_benchmark_submission_views
    AS SELECT sblo.state_id,
        sblo.state_name,
        count(sblo.id) AS benchmark_school,
        ( SELECT count(DISTINCT sqm.schools_id) AS count
            FROM school_question_markings sqm
                JOIN users u ON u.id = sqm.schools_id
                JOIN master_states ms ON u.state_id = ms.id
            WHERE ms.id = sblo.state_id) AS school_attended,
        ( SELECT count(sblon.id) AS count
            FROM school_benchmarks sblon
            WHERE sblon.final_flag = '1'::smallint AND sblon.state_id = sblo.state_id
            GROUP BY sblon.state_id, sblon.state_name) AS school_completed,
        ( SELECT count(sblod.id) AS count
            FROM school_benchmarks sblod
            WHERE sblod.passed_status = 1 AND sblod.state_id = sblo.state_id) AS school_passed,
        ( SELECT count(sblod.id) AS count
            FROM school_benchmarks sblod
            WHERE sblod.district_verification = 0 AND sblod.state_id = sblo.state_id) AS school_verified_unapproved,
        ( SELECT count(sblod.id) AS count
            FROM school_benchmarks sblod
            WHERE sblod.district_verification >= 0 AND sblod.state_id = sblo.state_id) AS district_selection,
        ( SELECT count(sblod.id) AS count
            FROM school_benchmarks sblod
            WHERE sblod.state_status = 1 AND sblod.state_id = sblo.state_id) AS state_selection,
        ( SELECT count(sblod.id) AS count
            FROM school_benchmarks sblod
            WHERE sblod.national_status = 1 AND sblod.state_id = sblo.state_id) AS national_selection,
        ( SELECT count(md.id) AS count         
            FROM master_districts md
            WHERE  md.state_id = sblo.state_id and md.freeze_status = 1 and md.is_freezed = 1
            ) AS district_freeze,
        ( SELECT count(md.id) AS count         
            FROM master_states md
            WHERE  md.id = sblo.state_id and md.is_state_freezed = 1 and md.state_freeze_status = 1
            ) AS state_freeze,            
        ( SELECT count(md.id) AS count         
            FROM master_districts md
            WHERE  md.state_id = sblo.state_id and md.freeze_status = 1 and md.is_freezed = 1 and district_acknowledgement = 1
            ) AS district_acknowledgement,
        ( SELECT count(md.id) AS count         
            FROM master_states md
            WHERE  md.id = sblo.state_id and md.is_state_freezed = 1 and md.state_freeze_status = 1 and state_acknowledgement = 1
            ) AS state_acknowledgement    
    FROM school_benchmarks sblo
    GROUP BY sblo.state_id, sblo.state_name
    ORDER BY sblo.state_id;

  	/*************************************************************************************************************************************/


    ----------------------------------------------------------- State Level ----------------------------------------------------------- 
    select 
            ms.state_id 	as 	state_id,
        ms.state_name as state_name ,
            COALESCE(sblo.benchmark_school,0) benchmark_school,
            COALESCE(sqm.school_attended,0) school_attended,
            COALESCE(sblo.school_completed,0) school_completed,
            COALESCE(sssuc.distrcit_selection,0) distrcit_selection,
            COALESCE(sblo.state_selection,0) state_selection
            
        from ( select state_id,state_name from school_benchmarks where state_id<> 200 
        group by state_id,state_name) ms
        join ( 
                    select 
                        state_id, 
                        COALESCE(count(id)  ,0) benchmark_school,
                        COALESCE(count(id)  filter (where  sblot.final_flag = 1 ) ,0) school_completed,
                        COALESCE(count(id)  filter (where  sblot.state_status = 1 ) ,0) state_selection
                    from 
                        school_benchmarks sblot
                    where state_id <> 200 
                    group by state_id 
                ) sblo 
        on ms.state_id =sblo.state_id
        
        left JOIN
        (
            SELECT u.state_id , count( sqm1.schools_id) AS school_attended
            FROM (select distinct schools_id from  school_question_markings) sqm1
            JOIN users u ON u.id = sqm1.schools_id
        group by u.state_id
        ) sqm
        on sblo.state_id=sqm.state_id	
        
        left outer join 
        (
            SELECT 
                sblod.state_id,count(ssuc.id) AS distrcit_selection
        FROM 
                school_selection_user_comments ssuc
        LEFT JOIN 
                school_benchmarks sblod 
                ON sblod.udise_code::text = ssuc.school_udise_code::text
        GROUP BY sblod.state_id
        ) sssuc
        on sblo.state_id=sssuc.state_id
        
     ----------------------------------------------------------- District Level -----------------------------------------------------------
    select 
            ms.state_id 	as 	state_id,
        ms.state_name as state_name ,
            ms.district_id 	as 	district_id,
        ms.district_name as district_name ,
            
            COALESCE(sblo.benchmark_school,0) benchmark_school,
            COALESCE(sqm.school_attended,0) school_attended,
            COALESCE(sblo.school_completed,0) school_completed,
            COALESCE(sssuc.distrcit_selection,0) distrcit_selection,
            COALESCE(sblo.state_selection,0) state_selection
            
        from ( 
                        select 
                            state_id, state_name,district_id,district_name 
                        from 
                            school_benchmarks 
                        where state_id <>200
                        group by state_id, state_name,district_id,district_name
                        
                ) ms
        join ( 
                    select 
                        state_id, district_id,
                        COALESCE(count(id)  ,0) benchmark_school,
                        COALESCE(count(id)  filter (where  sblot.final_flag = 1 ) ,0) school_completed,
                        COALESCE(count(id)  filter (where  sblot.state_status = 1 ) ,0) state_selection
                    from 
                        school_benchmarks sblot
                    where state_id <>200
                    group by state_id, district_id 
                ) sblo 
        on ms.state_id =sblo.state_id
        and ms.district_id =sblo.district_id
        
        left JOIN
        (
            SELECT u.state_id ,district_id, count( sqm1.schools_id) AS school_attended
            FROM (select distinct schools_id from  school_question_markings) sqm1
            JOIN users u ON u.id = sqm1.schools_id
        group by u.state_id,district_id
        ) sqm
        on sblo.state_id=sqm.state_id	
        and sblo.district_id =sqm.district_id
        
        left outer join 
        (
            SELECT 
                sblod.state_id,district_id,count(ssuc.id) AS distrcit_selection
        FROM 
                school_selection_user_comments ssuc
        LEFT JOIN 
                school_benchmarks sblod 
                ON sblod.udise_code::text = ssuc.school_udise_code::text
        GROUP BY sblod.state_id,district_id
        ) sssuc
        on sblo.state_id=sssuc.state_id
        and sblo.district_id =sssuc.district_id
        order by 1,3 ;
        
     ----------------------------------------------------------- Block Wise -----------------------------------------------------------
    select 
            ms.state_id 	as 	state_id,
        ms.state_name as state_name ,
            ms.district_id 	as 	district_id,
        ms.district_name as district_name ,
            ms.block_id 	as 	block_id,
        ms.block_name as block_name ,
            
            COALESCE(sblo.benchmark_school,0) benchmark_school,
            COALESCE(sqm.school_attended,0) school_attended,
            COALESCE(sblo.school_completed,0) school_completed,
            COALESCE(sssuc.distrcit_selection,0) distrcit_selection,
            COALESCE(sblo.state_selection,0) state_selection
            
        from ( 
                        
                        select 
                            state_id, state_name,district_id,district_name,block_id,block_name
                        from 
                            school_benchmarks 
                        where 
                            block_id <> 0 AND (state_id <> ALL (ARRAY[200,175, 176]))
                        group by state_id, state_name,district_id,district_name,block_id,block_name
                        
                ) ms
        join ( 
                    select 
                        state_id, district_id,block_id,
                        COALESCE(count(id)  ,0) benchmark_school,
                        COALESCE(count(id)  filter (where  sblot.final_flag = 1 ) ,0) school_completed,
                        COALESCE(count(id)  filter (where  sblot.state_status = 1 ) ,0) state_selection
                    from 
                        school_benchmarks sblot
                    where 
                            block_id <> 0 AND (state_id <> ALL (ARRAY[200,175, 176]))
                    group by state_id, district_id ,block_id
                ) sblo 
        on ms.state_id =sblo.state_id
        and ms.district_id =sblo.district_id
        and ms.block_id =sblo.block_id
        
        left JOIN
        (
            SELECT u.state_id ,district_id,block_id, count( sqm1.schools_id) AS school_attended
            FROM (select distinct schools_id from  school_question_markings) sqm1
            JOIN users u ON u.id = sqm1.schools_id
                        JOIN ( select block_id, udise_code from school_benchmarks 
                                    where block_id <> 0 AND (state_id <> ALL (ARRAY[200,175, 176]))
                                    group by block_id, udise_code)
                                    sclos ON sclos.udise_code::text = u.udise_code::text
        group by u.state_id,district_id,block_id
        ) sqm
        on sblo.state_id=sqm.state_id	
        and sblo.district_id =sqm.district_id
        and sblo.block_id =sqm.block_id
        
        left outer join 
        (
            SELECT 
                sblod.state_id,district_id,block_id,count(ssuc.id) AS distrcit_selection
        FROM 
                school_selection_user_comments ssuc
        LEFT JOIN 
                school_benchmarks sblod 
                ON sblod.udise_code::text = ssuc.school_udise_code::text
                and block_id <> 0 AND (state_id <> ALL (ARRAY[200,175, 176]))
        GROUP BY sblod.state_id,district_id,block_id
        ) sssuc
        on sblo.state_id=sssuc.state_id
        and sblo.district_id =sssuc.district_id
        and sblo.block_id =sssuc.block_id
        order by 1,3,5


        /*************************************************************************************************/
        select  
            udise_code as "Udise Code",
            school_name as "School Name",
            state_name as "State Name",
            district_name as "District Name",
            block_name as "Block Name",
            class_frm as "Class From",
            class_to as "Class To" ,
            CASE WHEN sch_type = 1 THEN 'Boys' WHEN sch_type = 2 THEN 'Girls' ELSE 'Co-Ed' END AS "School Type",
            total_enrolment as "Total Enrolment",
            tot_tch_all as "Total Teachers" ,
            CASE WHEN drink_water >= 1 THEN 'Yes' ELSE 'No' END AS "Drinking Water",
            CASE WHEN electricity >= 1 THEN 'Yes' ELSE 'No' END AS "Electricity",
            CASE WHEN pucca_building >= 1 THEN 'Yes' ELSE 'No' END AS "Pucca Building",
            CASE WHEN toilet_functional >= 1 THEN 'Yes' ELSE 'No' END AS "Toilet",
            CASE WHEN handwash_yn >= 1 THEN 'Yes' ELSE 'No' END AS "Handwash",
            CASE WHEN location_type = 1 THEN 'Rural' ELSE 'Urban' END AS "Location Type",
            email as "Head Master Email",
            mobile as "Head Master Mobile" ,
            final_flag as "School Submission Status",    
            master_categories.name as "School Category",
            CASE WHEN district_verification = 1 THEN 'Yes' ELSE 'No' END AS "District Verification",
            CASE WHEN passed_status = 1 THEN 'Yes' ELSE 'No' END AS "School Passed Status",
            ROUND(school_mark::decimal,2) as "School Marks",
            ROUND(district_mark::decimal,2) as "District Marks",
            CASE WHEN pass_by_district = 1 THEN 'Yes' ELSE 'No' END AS "District Passed Status"
            from public.school_benchmarks    
            inner join public.master_categories on master_categories.id = pmshri_category_id    
            where pass_by_district = 1 and district_id  =152 and passed_status  = 1 and district_verification is not  null



/**********************************************************************************************************************************/


-- public.state_report_school_benchmark_submission_views source

CREATE OR REPLACE VIEW public.state_report_school_benchmark_submission_views
AS SELECT sblo.state_id,
    sblo.state_name,
    count(sblo.id) AS benchmark_school,
    ( SELECT count(DISTINCT sqm.schools_id) AS count
           FROM school_question_markings sqm
             JOIN users u ON u.id = sqm.schools_id
             JOIN master_states ms ON u.state_id = ms.id
          WHERE ms.id = sblo.state_id) AS school_attended,
    ( SELECT count(sblon.id) AS count
           FROM school_benchmarks sblon
          WHERE sblon.final_flag = '1'::smallint AND sblon.state_id = sblo.state_id
          GROUP BY sblon.state_id, sblon.state_name) AS school_completed,
    ( SELECT count(sblod.id) AS count
           FROM school_benchmarks sblod
          WHERE sblod.passed_status = 1 AND sblod.state_id = sblo.state_id) AS school_passed,
    ( SELECT count(sblod.id) AS count
           FROM school_benchmarks sblod
          WHERE sblod.district_verification = 0 AND sblod.state_id = sblo.state_id) AS school_verified_unapproved,
    ( SELECT count(sblod.id) AS count
           FROM school_benchmarks sblod
          WHERE sblod.district_verification >= 0 AND sblod.state_id = sblo.state_id) AS district_selection,
    ( SELECT count(sblod.id) AS count
           FROM school_benchmarks sblod
          WHERE sblod.state_status = 1 AND sblod.state_id = sblo.state_id) AS state_selection,
    ( SELECT count(sblod.id) AS count
           FROM school_benchmarks sblod
          WHERE sblod.national_status = 1 AND sblod.state_id = sblo.state_id) AS national_selection,
    ( SELECT count(md.id) AS count
           FROM master_districts md
          WHERE md.state_id = sblo.state_id AND md.freeze_status = 1 AND md.is_freezed = 1) AS district_freeze,
    ( SELECT count(md.id) AS count
           FROM master_states md
          WHERE md.id = sblo.state_id AND md.is_state_freezed = 1 AND md.state_freeze_status = 1) AS state_freeze,
    ( SELECT count(md.id) AS count
           FROM master_districts md
          WHERE md.state_id = sblo.state_id AND md.freeze_status = 1 AND md.is_freezed = 1 AND md.district_acknowledgement = 1) AS district_acknowledgement,
    ( SELECT count(md.id) AS count
           FROM master_states md
          WHERE md.id = sblo.state_id AND md.is_state_freezed = 1 AND md.state_freeze_status = 1 AND md.state_acknowledgement = 1) AS state_acknowledgement
   FROM school_benchmarks sblo
  GROUP BY sblo.state_id, sblo.state_name
  ORDER BY sblo.state_id;
  
  -- public.district_report_school_benchmark_submission_views source

CREATE OR REPLACE VIEW public.district_report_school_benchmark_submission_views
AS SELECT sblo.state_id,
    sblo.state_name,
    sblo.district_id,
    sblo.district_name,
    count(sblo.id) AS benchmark_school,
    ( SELECT count(DISTINCT sqm.schools_id) AS count
           FROM school_question_markings sqm
             JOIN users u ON u.id = sqm.schools_id
             JOIN master_districts md ON u.district_id = md.id
          WHERE md.id = sblo.district_id) AS school_attended,
    ( SELECT count(sblon.id) AS count
           FROM school_benchmarks sblon
          WHERE sblon.final_flag = '1'::smallint AND sblon.district_id = sblo.district_id
          GROUP BY sblon.district_id) AS school_completed,
    ( SELECT count(sblod.id) AS count
           FROM school_benchmarks sblod
          WHERE sblod.passed_status = 1 AND sblod.district_id = sblo.district_id) AS school_passed,
    ( SELECT count(sblod.id) AS count
           FROM school_benchmarks sblod
          WHERE sblod.district_verification = 0 AND sblod.district_id = sblo.district_id) AS school_verified_unapproved,
    ( SELECT count(sblod.id) AS count
           FROM school_benchmarks sblod
          WHERE sblod.district_verification >= 0 AND sblod.district_id = sblo.district_id) AS district_selection,
    ( SELECT count(sblod.id) AS count
           FROM school_benchmarks sblod
          WHERE sblod.state_status = 1 AND sblod.district_id = sblo.district_id) AS state_selection,
    ( SELECT count(sblod.id) AS count
           FROM school_benchmarks sblod
          WHERE sblod.national_status = 1 AND sblod.district_id = sblo.district_id) AS national_selection,
    ( SELECT count(md.id) AS count
           FROM master_districts md
          WHERE md.id = sblo.district_id AND md.freeze_status = 1 AND md.is_freezed = 1) AS district_freeze,
    ( SELECT count(md.id) AS count
           FROM master_states md
          WHERE md.id = sblo.state_id AND md.is_state_freezed = 1 AND md.state_freeze_status = 1) AS state_freeze,
    ( SELECT count(md.id) AS count
           FROM master_districts md
          WHERE md.id = sblo.district_id AND md.freeze_status = 1 AND md.is_freezed = 1 AND md.district_acknowledgement = 1) AS district_acknowledgement,
    ( SELECT count(md.id) AS count
           FROM master_states md
          WHERE md.id = sblo.state_id AND md.is_state_freezed = 1 AND md.state_freeze_status = 1 AND md.state_acknowledgement = 1) AS state_acknowledgement
   FROM school_benchmarks sblo
  GROUP BY sblo.state_id, sblo.state_name, sblo.district_id, sblo.district_name
  ORDER BY sblo.state_id;
  
  -- public.block_report_school_benchmark_submission_views source

CREATE OR REPLACE VIEW public.block_report_school_benchmark_submission_views
AS SELECT sblo.state_id,
    sblo.state_name,
    sblo.district_id,
    sblo.district_name,
    sblo.block_id,
    sblo.block_name,
    count(sblo.id) AS benchmark_school,
    ( SELECT count(DISTINCT sqm.schools_id) AS count
           FROM school_question_markings sqm
             JOIN users u ON u.id = sqm.schools_id
             JOIN master_blocks mb ON mb.block_id = sblo.block_id AND mb.state_id = sblo.state_id AND mb.district_id = sblo.district_id
             JOIN school_benchmarks sclos ON sclos.udise_code::text = u.udise_code::text AND (sclos.state_id <> ALL (ARRAY[175, 176]))
          WHERE sclos.block_id = sblo.block_id AND mb.state_id = sclos.state_id AND mb.district_id = sclos.district_id) AS school_attended,
    ( SELECT count(DISTINCT sblon.id) AS count
           FROM school_benchmarks sblon
             JOIN master_blocks mb ON mb.block_id = sblo.block_id AND mb.state_id = sblo.state_id AND mb.district_id = sblo.district_id
          WHERE sblon.block_id = sblo.block_id AND sblon.final_flag = '1'::smallint AND mb.state_id = sblon.state_id AND mb.district_id = sblon.district_id AND sblon.block_id <> 0 AND (sblon.state_id <> ALL (ARRAY[175, 176]))
          GROUP BY sblon.block_id) AS school_completed,
    ( SELECT count(sblod.id) AS count
           FROM school_benchmarks sblod
             JOIN master_blocks mb ON mb.block_id = sblo.block_id AND mb.state_id = sblo.state_id AND mb.district_id = sblo.district_id
          WHERE sblod.passed_status = 1 AND sblod.block_id = sblo.block_id AND mb.state_id = sblod.state_id AND mb.district_id = sblod.district_id AND (sblod.state_id <> ALL (ARRAY[175, 176]))) AS school_passed,
    ( SELECT count(sblod.id) AS count
           FROM school_benchmarks sblod
          WHERE sblod.district_verification = 0 AND sblod.block_id = sblo.block_id AND (sblod.state_id <> ALL (ARRAY[175, 176]))) AS school_verified_unapproved,
    ( SELECT count(sblod.id) AS count
           FROM school_benchmarks sblod
             JOIN master_blocks mb ON mb.block_id = sblo.block_id AND mb.state_id = sblo.state_id AND mb.district_id = sblo.district_id
          WHERE sblod.district_verification >= 0 AND mb.state_id = sblod.state_id AND mb.district_id = sblod.district_id AND sblod.block_id = sblo.block_id AND (sblod.state_id <> ALL (ARRAY[175, 176]))) AS district_selection,
    ( SELECT count(sblod.id) AS count
           FROM school_benchmarks sblod
             JOIN master_blocks mb ON mb.block_id = sblo.block_id AND mb.state_id = sblo.state_id AND mb.district_id = sblo.district_id
          WHERE sblod.state_status = 1 AND sblod.block_id = sblo.block_id AND mb.state_id = sblod.state_id AND mb.district_id = sblod.district_id AND (sblod.state_id <> ALL (ARRAY[175, 176]))) AS state_selection,
    ( SELECT count(sblod.id) AS count
           FROM school_benchmarks sblod
          WHERE sblod.national_status = 1 AND sblod.block_id = sblo.block_id AND (sblod.state_id <> ALL (ARRAY[175, 176]))) AS national_selection,
    ( SELECT count(md.id) AS count
           FROM master_districts md
          WHERE md.id = sblo.district_id AND md.freeze_status = 1 AND md.is_freezed = 1) AS district_freeze,
    ( SELECT count(md.id) AS count
           FROM master_states md
          WHERE md.id = sblo.state_id AND md.is_state_freezed = 1 AND md.state_freeze_status = 1) AS state_freeze,
    ( SELECT count(md.id) AS count
           FROM master_districts md
          WHERE md.id = sblo.district_id AND md.freeze_status = 1 AND md.is_freezed = 1 AND md.district_acknowledgement = 1) AS district_acknowledgement,
    ( SELECT count(md.id) AS count
           FROM master_states md
          WHERE md.id = sblo.state_id AND md.is_state_freezed = 1 AND md.state_freeze_status = 1 AND md.state_acknowledgement = 1) AS state_acknowledgement
   FROM school_benchmarks sblo
  WHERE sblo.block_id <> 0 AND (sblo.state_id <> ALL (ARRAY[175, 176]))
  GROUP BY sblo.state_id, sblo.state_name, sblo.district_id, sblo.district_name, sblo.block_id, sblo.block_name
  ORDER BY sblo.state_id, sblo.district_id;


  -----------------------------------------------------------
  CREATE OR REPLACE VIEW public.view_activities
  AS select
    ac.id,
    ac.activity_state_id,
    ac.activity_district_id,
    ac.gender_id,
    ac.activity_category_id,
    ac.activity_sub_category_id,
    s.school_postal_address,
    mg.gender_name,
    s.udise_code,
    s.school_name,
    sm.state_name,
    md.district_name,
    mac.activity_category_name,
    masc.activity_sub_category_name,
    ( select count(av.id) as cnt from activity_volunteers as av where av.activity_id = ac.id and av.status != 'WithdrawAppliaction') as volunteer_count
    from activities ac
    join master_schools s on s.id = ac.school_id
    join master_states sm on sm.id = ac.activity_state_id
    join master_districts md on md.id = ac.activity_district_id
    join master_activity_categories mac on mac.id = ac.activity_category_id
    join master_activity_sub_categories masc on masc.id= ac.activity_sub_category_id
    join master_specializations ms on ms.id= ac.specialization_id
    join master_genders mg on mg.id= ac.gender_id