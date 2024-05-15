/*************************************** Daily Query ******************************************/
    select  ms."name" ,count(distinct(sqm.schools_id)) 
    from school_question_markings sqm 
    inner join users u on u.id = sqm.schools_id 
    inner  join master_states ms on u.state_id =ms.id
    group by ms."name";

/*************************************** Daily Query ******************************************/
    CREATE OR REPLACE VIEW public.state_report_school_benchmark_submission_views 	AS
    select
	sblo.state_id,
	sblo.state_name,
	count(sblo.id) as benchmark_school,
	(
	select
		count(distinct(sqm.schools_id))
	from
		school_question_markings sqm
	inner join users u on
		u.id = sqm.schools_id
	inner join master_states ms on
		u.state_id = ms.id
	where
		ms.id = sblo.state_id 
        ) as school_attended,
        
        (
        select  count(sblon.id)  from school_benchmarks sblon
		where sblon.final_flag ='1' and sblon.state_id =sblo.state_id
		group by sblon.state_id,
       sblon.state_name) as school_completed,       
       
       (select count(ssuc.id) from school_selection_user_comments ssuc
        left join school_benchmarks as sblod on sblod.udise_code =ssuc.school_udise_code
        where sblod.state_id = sblo.state_id
        group by sblod.state_id) as distrcit_selection        
    from
        school_benchmarks sblo
    
    group by
        sblo.state_id,
        sblo.state_name	
    order by
        sblo.state_id



---------------------------------------------------------------------------------------------------------------


CREATE OR REPLACE VIEW public.district_report_school_benchmark_submission_views AS
    select
	sblo.state_id,
	sblo.state_name,
	sblo.district_id,
	sblo.district_name, 
	count(sblo.id) as benchmark_school,
	(
	select
		count(distinct(sqm.schools_id))
	from
		school_question_markings sqm
	inner join users u on
		u.id = sqm.schools_id
	inner join master_districts md on
		u.district_id = md.id
	where
		md.id = sblo.district_id 
        ) as school_attended,       
        (
        select  count(sblon.id)  from school_benchmarks sblon
		where sblon.final_flag ='1' and sblon.district_id =sblo.district_id
		group by sblon.district_id,
       sblon.district_name) as school_completed,
       (select count(ssuc.id) from school_selection_user_comments ssuc
        left join school_benchmarks as sblod on sblod.udise_code =ssuc.school_udise_code
        where sblod.district_id = sblo.district_id
        group by sblod.district_id) as distrcit_selection        
    from
        school_benchmarks sblo 
    group by
        sblo.state_id,
        sblo.state_name,
        sblo.district_id,
	    sblo.district_name 
    order by
        sblo.state_id;



---------------------------------------------------------------------------------------------------------------


CREATE OR REPLACE VIEW public.block_report_school_benchmark_submission_views AS
    select
	sblo.state_id,
	sblo.state_name,
	sblo.district_id,
	sblo.district_name,
	sblo.block_id,
	sblo.block_name,
	count(sblo.id) as benchmark_school,	
	(
		select
		count(distinct(sqm.schools_id))
	from
		school_question_markings sqm
		inner join users u on
		u.id = sqm.schools_id
		inner join school_benchmarks sclos on sclos.udise_code =u.udise_code 	
	where
		sclos.block_id = sblo.block_id 
        ) as school_attended,  
	
     (
        select  count(distinct (sblon.id))  from school_benchmarks sblon
       where  sblon.block_id = sblo.block_id and  sblon.final_flag ='1' and sblon.block_id != 0
		group by sblon.block_id) as school_completed,
       (select count(ssuc.id) from school_selection_user_comments ssuc
        left join school_benchmarks as sblod on sblod.udise_code =ssuc.school_udise_code
        where sblod.block_id  = sblo.block_id
        group by sblod.block_id) as distrcit_selection    
    from
        school_benchmarks sblo  
	    where sblo.block_id != 0
    group by
        sblo.state_id,
        sblo.state_name,
        sblo.district_id,
	    sblo.district_name,
	    sblo.block_id,
	    sblo.block_name
    order by
        sblo.state_id,sblo.district_id ;

/*************************************** Daily Query ******************************************/

    SELECT state_id,count(id) FROM public.school_benchmarks group by state_id order by state_id
    SELECT district_id,count(id) FROM public.school_benchmarks group by district_id order by district_id
    SELECT block_id,count(id) FROM public.school_benchmarks group by block_id order by block_id

    CREATE TABLE public.report_school_submissions(
        id bigserial NOT NULL,
        flag character varying(1) COLLATE pg_catalog."default",
        region_id integer NOT NULL,
        region_parent_id integer NOT NULL,
        region_name character varying(100) COLLATE pg_catalog."default" NOT NULL,
        benchmark_school integer  DEFAULT 0,
        school_attended integer DEFAULT 0,
        school_completed integer DEFAULT 0,
        school_passed integer DEFAULT 0,
        district_selection integer DEFAULT 0
    )
    
    Insert into report_school_submissions(flag,region_name,region_id,region_parent_id) select 'S',name,id,0 from master_states;
    Insert into report_school_submissions(flag,region_name,region_id,region_parent_id) select 'D',name,id,state_id from master_districts;
    Insert into report_school_submissions(flag,region_name,region_id,region_parent_id) select 'B',name,block_id,district_id from master_blocks;



