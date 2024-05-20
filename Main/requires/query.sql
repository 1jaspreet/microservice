
/*For creating sequnces on existing table */

Drop SEQUENCE if exists master_categories_id_seq CASCADE;
CREATE SEQUENCE master_categories_id_seq owned by master_categories.id;
Alter table master_categories alter column id set default nextval('master_categories_id_seq');
Select setval('master_categories_id_seq',(SELECT (MAX(ID)+1) FROM master_categories));

Drop SEQUENCE if exists master_roles_id_seq;
CREATE SEQUENCE master_roles_id_seq owned by master_roles.id;
Alter table master_roles alter column id set default nextval('master_roles_id_seq');
Select setval('master_roles_id_seq',(SELECT (MAX(ID)+1) FROM master_roles));

Drop SEQUENCE if exists master_states_id_seq;
CREATE SEQUENCE master_states_id_seq owned by master_states.id;
Alter table master_states alter column id set default nextval('master_states_id_seq');
Select setval('master_states_id_seq',(SELECT (MAX(ID)+1) FROM master_states));

Drop SEQUENCE if exists master_districts_id_seq;
CREATE SEQUENCE master_districts_id_seq owned by master_districts.id;
Alter table master_districts alter column id set default nextval('master_districts_id_seq');
Select setval('master_districts_id_seq',(SELECT (MAX(ID)+1) FROM master_districts));

Drop SEQUENCE if exists master_designations_id_seq;
CREATE SEQUENCE master_designations_id_seq owned by master_designations.id;
Alter table master_designations alter column id set default nextval('master_designations_id_seq');
Select setval('master_designations_id_seq',(SELECT (MAX(ID)+1) FROM master_designations));

Drop SEQUENCE if exists master_schemes_id_seq;
CREATE SEQUENCE master_schemes_id_seq owned by master_schemes.id;
Alter table master_schemes alter column id set default nextval('master_schemes_id_seq');
Select setval('master_schemes_id_seq',(SELECT (MAX(ID)+1) FROM master_schemes));

Drop SEQUENCE if exists master_scheme_questions_id_seq;
CREATE SEQUENCE master_scheme_questions_id_seq owned by master_scheme_questions.id;
Alter table master_scheme_questions alter column id set default nextval('master_scheme_questions_id_seq');
Select setval('master_scheme_questions_id_seq',(SELECT (MAX(ID)+1) FROM master_scheme_questions));

Drop SEQUENCE if exists users_id_seq CASCADE;
CREATE SEQUENCE users_id_seq owned by users.id;
Alter table users alter column id set default nextval('users_id_seq');
Select setval('users_id_seq',(select (max(id)+1) from users));

Drop SEQUENCE if exists scheme_question_markings_id_seq;
CREATE SEQUENCE scheme_question_markings_id_seq owned by scheme_question_markings.id;
Alter table scheme_question_markings alter column id set default nextval('scheme_question_markings_id_seq');
Select setval('scheme_question_markings_id_seq',(select (max(id)+1) from scheme_question_markings));


Drop SEQUENCE if exists school_school_section_wises_id_seq;
CREATE SEQUENCE school_school_section_wises_id_seq owned by school_school_section_wises.id;
Alter table school_school_section_wises alter column id set default nextval('school_school_section_wises_id_seq');
Select

Drop SEQUENCE if exists school_question_markings_id_seq;
CREATE SEQUENCE school_question_markings_id_seq owned by school_question_markings.id;
Alter table school_question_markings alter column id set default nextval('school_question_markings_id_seq');
Select setval('school_question_markings_id_seq',(select (max(id)+1) from school_question_markings));

Drop SEQUENCE if exists master_regions_id_seq;
CREATE SEQUENCE master_regions_id_seq owned by master_regions.id;
Alter table master_regions alter column id set default nextval('master_regions_id_seq');
Select setval('master_regions_id_seq',(SELECT (MAX(ID)+1) FROM master_regions));



/*
Drop SEQUENCE if exists demo_table_id_seq;
CREATE SEQUENCE demo_table_id_seq owned by demo_table.id;
Alter table demo_table alter column id set default nextval('demo_table_id_seq');
Select setval('demo_table_id_seq',(SELECT (MAX(ID)+1) FROM demo_table));
*/


CREATE TABLE IF NOT EXISTS public.scheme_question_markings(
    id bigint NOT NULL,
    schemes_id integer NOT NULL DEFAULT 0,
    scheme_questions_id integer NOT NULL DEFAULT 0,
    es_1_5_id integer DEFAULT 0,
    es_1_8_id integer DEFAULT 0,
    ss_6_12_id integer DEFAULT 0,
    ss_1_10_id integer DEFAULT 0,
    ss_1_12_id integer DEFAULT 0,
    kvs_id integer DEFAULT 0,
    nvs_id integer DEFAULT 0,
    es_1_5_mark integer DEFAULT 0,
    es_1_8_mark integer DEFAULT 0,
    ss_6_12_mark integer DEFAULT 0,
    ss_1_10_mark integer DEFAULT 0,
    ss_1_12_mark integer NOT NULL DEFAULT 0,
    kvs_mark integer DEFAULT 0,
    nvs_mark integer DEFAULT 0,
    created_by integer NOT NULL DEFAULT 1,
    updated_by integer NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT scheme_question_markings_pkey PRIMARY KEY (id)
);


CREATE TABLE IF NOT EXISTS public.school_question_markings(
    id bigint NOT NULL,
    schools_id integer NOT NULL DEFAULT 0,
    schemes_id integer NOT NULL DEFAULT 0,
    questions_id integer NOT NULL DEFAULT 0,
    answer integer DEFAULT 0,
    marks integer DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT school_question_markings PRIMARY KEY (id)
);


CREATE TABLE IF NOT EXISTS public.school_school_section_wises(
    id bigint NOT NULL,
    schools_id integer NOT NULL DEFAULT 0,
    schemes_id integer NOT NULL DEFAULT 0,
    marks integer DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT school_school_section_wises PRIMARY KEY (id)
);


CREATE TABLE public.master_scheme_category_marks
(
    id bigint NOT NULL,
    schemes_id integer NOT NULL,
    es_1_5_id integer,
    es_1_8_id integer,
    ss_6_12_id integer,
    ss_1_10_id integer,
    ss_1_12_id integer,
    kvs_id integer,
    nvs_id integer,
    es_1_5_question integer,
    es_1_8_question integer,
    ss_6_12_question integer,
    ss_1_10_question integer,
    ss_1_12_question integer,
    kvs_question integer,
    nvs_question integer,
    es_1_5_mark integer,
    es_1_8_mark integer,
    ss_6_12_mark integer,
    ss_1_10_mark integer,
    ss_1_12_mark integer,
    kvs_mark integer,
    nvs_mark integer,
    created_by integer NOT NULL DEFAULT 1,
    updated_by integer NOT NULL DEFAULT 1,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT scheme_category_marks_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE public.master_scheme_category_marks OWNER to postgres;

/**************************************************************************************************************************************************/
CREATE TABLE public.master_scheme_category_question_marks(
    id bigint NOT NULL,
    schemes_id integer NOT NULL,
	categories_id integer NOT NULL,
    questions integer,
    marks integer,
    created_by integer NOT NULL DEFAULT 1,
    updated_by integer NOT NULL DEFAULT 1,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT scheme_category_marks_pkey PRIMARY KEY (id)
);

 INSERT INTO public.master_scheme_category_question_marks(
	id, schemes_id, categories_id, questions, marks, created_by, updated_by, created_at, updated_at) VALUES 
	(1, 1, 1, 15, 27, 1, 1, '2022-06-07 12:06:57', '2022-06-07 12:06:57')
	,(2, 2, 1, 10, 36, 1, 1, '2022-06-07 12:06:57', '2022-06-07 12:06:57')
	,(3, 3, 1, 10, 30, 1, 1, '2022-06-07 12:06:57', '2022-06-07 12:06:57')
	,(4, 5, 1, 7, 18, 1, 1, '2022-06-07 12:06:57', '2022-06-07 12:06:57')
	,(5, 6, 1, 7, 17, 1, 1, '2022-06-07 12:06:57', '2022-06-07 12:06:57')    
	,(6, 7, 1, 7, 16, 1, 1, '2022-06-07 12:06:57', '2022-06-07 12:06:57')

    ,(7, 1, 2, 16, 31, 1, 1, '2022-06-07 12:06:57', '2022-06-07 12:06:57')
	,(8, 2, 2, 10, 36, 1, 1, '2022-06-07 12:06:57', '2022-06-07 12:06:57')
	,(9, 3, 2, 10, 30, 1, 1, '2022-06-07 12:06:57', '2022-06-07 12:06:57')
	,(10, 4, 2, 3, 17, 1, 1, '2022-06-07 12:06:57', '2022-06-07 12:06:57')
	,(11, 5, 2, 7, 18, 1, 1, '2022-06-07 12:06:57', '2022-06-07 12:06:57')
	,(12, 6, 2, 7, 17, 1, 1, '2022-06-07 12:06:57', '2022-06-07 12:06:57')    
	,(13, 7, 2, 7, 16, 1, 1, '2022-06-07 12:06:57', '2022-06-07 12:06:57')

    ,(14, 1, 5, 16, 31, 1, 1, '2022-06-07 12:06:57', '2022-06-07 12:06:57')
	,(15, 2, 5, 10, 36, 1, 1, '2022-06-07 12:06:57', '2022-06-07 12:06:57')
	,(16, 3, 5, 10, 30, 1, 1, '2022-06-07 12:06:57', '2022-06-07 12:06:57')
	,(17, 4, 5, 4, 20, 1, 1, '2022-06-07 12:06:57', '2022-06-07 12:06:57')
	,(18, 5, 5, 7, 18, 1, 1, '2022-06-07 12:06:57', '2022-06-07 12:06:57')
	,(19, 6, 5, 7, 17, 1, 1, '2022-06-07 12:06:57', '2022-06-07 12:06:57')    
	,(20, 7, 5, 7, 16, 1, 1, '2022-06-07 12:06:57', '2022-06-07 12:06:57')

    ,(21, 1, 6, 16, 31, 1, 1, '2022-06-07 12:06:57', '2022-06-07 12:06:57')
	,(22, 2, 6, 10, 36, 1, 1, '2022-06-07 12:06:57', '2022-06-07 12:06:57')
	,(23, 3, 6, 10, 30, 1, 1, '2022-06-07 12:06:57', '2022-06-07 12:06:57')
	,(24, 4, 6, 4, 20, 1, 1, '2022-06-07 12:06:57', '2022-06-07 12:06:57')
	,(25, 5, 6, 7, 18, 1, 1, '2022-06-07 12:06:57', '2022-06-07 12:06:57')
	,(26, 6, 6, 7, 17, 1, 1, '2022-06-07 12:06:57', '2022-06-07 12:06:57')    
	,(27, 7, 6, 7, 16, 1, 1, '2022-06-07 12:06:57', '2022-06-07 12:06:57')

    ,(28, 1, 3, 16, 31, 1, 1, '2022-06-07 12:06:57', '2022-06-07 12:06:57')
	,(29, 2, 3, 10, 36, 1, 1, '2022-06-07 12:06:57', '2022-06-07 12:06:57')
	,(30, 3, 3, 10, 30, 1, 1, '2022-06-07 12:06:57', '2022-06-07 12:06:57')
	,(31, 4, 3, 4, 20, 1, 1, '2022-06-07 12:06:57', '2022-06-07 12:06:57')
	,(32, 5, 3, 7, 18, 1, 1, '2022-06-07 12:06:57', '2022-06-07 12:06:57')
	,(33, 6, 3, 7, 17, 1, 1, '2022-06-07 12:06:57', '2022-06-07 12:06:57')    
	,(34, 7, 3, 7, 16, 1, 1, '2022-06-07 12:06:57', '2022-06-07 12:06:57')

    ,(35, 1, 12, 16, 31, 1, 1, '2022-06-07 12:06:57', '2022-06-07 12:06:57')
	,(36, 2, 12, 10, 36, 1, 1, '2022-06-07 12:06:57', '2022-06-07 12:06:57')
	,(37, 3, 12, 10, 30, 1, 1, '2022-06-07 12:06:57', '2022-06-07 12:06:57')
	,(38, 4, 12, 4, 20, 1, 1, '2022-06-07 12:06:57', '2022-06-07 12:06:57')
	,(39, 5, 12, 7, 18, 1, 1, '2022-06-07 12:06:57', '2022-06-07 12:06:57')
	,(40, 6, 12, 7, 17, 1, 1, '2022-06-07 12:06:57', '2022-06-07 12:06:57')

    ,(41, 1, 13, 15, 28, 1, 1, '2022-06-07 12:06:57', '2022-06-07 12:06:57')
	,(42, 2, 13, 10, 36, 1, 1, '2022-06-07 12:06:57', '2022-06-07 12:06:57')
	,(43, 3, 13, 10, 30, 1, 1, '2022-06-07 12:06:57', '2022-06-07 12:06:57')
	,(44, 4, 13, 4, 20, 1, 1, '2022-06-07 12:06:57', '2022-06-07 12:06:57')
	,(45, 5, 13, 7, 18, 1, 1, '2022-06-07 12:06:57', '2022-06-07 12:06:57')
	,(46, 6, 13, 7, 17, 1, 1, '2022-06-07 12:06:57', '2022-06-07 12:06:57') ;

/**************************************************************************************************************************************************/

/**************************************************************************************************************************************************/
    ALTER TABLE public.master_school ADD COLUMN block_id bigint;
    ALTER TABLE public.master_school ADD COLUMN location_type character(6) COLLATE pg_catalog."default";
    ALTER TABLE public.master_school ADD COLUMN school_management_description character varying COLLATE pg_catalog."default";

    update master_school 
        set block_id=sbm.block_id,
        block_name=sbm.block_name,
        location_type=sbm.location_type,
        sch_mgmt_center_id=sbm.sch_mgmt_center_id,
        school_management_description=sbm.school_management_description
    from school_block_summary sbm
        where master_school.udise_code = sbm.udise_code

/**************************************************************************************************************************************************/

/**************************************************************************************************************************************************/

    CREATE TABLE public.master_school_designations (
        id int4 NOT NULL ,
        "name" varchar(255) NULL,
        slug varchar(255) NULL,
        status bpchar(1) NULL DEFAULT 0,
        created_by int4 NULL,
        updated_by int4 NULL,
        created_at timestamp NULL,
        updated_at timestamp NULL
    );

    INSERT INTO public.master_school_designations ("id","name",slug,status,created_by,updated_by,created_at,updated_at) VALUES
    (1,'Head Master/Principal','head-master-principal','1',1,1,'2022-06-07 12:06:57', '2022-06-07 12:06:57'),
    (2,'Asst. Head Master/Vice Principal','asst-head-master-vice-principal','1',1,1,'2022-06-07 12:06:57', '2022-06-07 12:06:57'),
    (3,'Acting Head Teacher','acting-head-teacher','1',1,1,'2022-06-07 12:06:57', '2022-06-07 12:06:57'),
    (4,'In-Charge from Other School','in-charge-from-other-school','1',1,1,'2022-06-07 12:06:57', '2022-06-07 12:06:57'),
    (5,'In-Charge from Block/District','in-charge-from-block-district','1',1,1,'2022-06-07 12:06:57', '2022-06-07 12:06:57'),
    (6,'Others','others','1',1,1,'2022-06-07 12:06:57', '2022-06-07 12:06:57');

/**************************************************************************************************************************************************/

ALTER TABLE public.users ADD head_of_school varchar NULL;
ALTER TABLE public.users ADD school_designation int2 NULL;

insert into master_school(state_id, district_id, district_name, block_name, udise_code, school_name, sch_mgmt_center_id, sch_mgmt_id, category_id, class_frm, class_to, sch_type) 
select state_id, district_id, district_name, block_name, udise_code, school_name, sch_mgmt_center_id, sch_mgmt_id, category_id, class_frm, class_to,sch_type from sblo

/**************************************************************************************************************************************************/

/*For new DB*/

update public.school_benchmarks set state_id = lgd_state_id, district_id = lgd_district_id
where sch_mgmt_center_id NOT IN ('92','93')

update public.school_benchmarks set state_name =  ms.name from master_states as ms
where ms.id = school_benchmarks.state_id
and sch_mgmt_center_id NOT IN ('92','93')

update public.school_benchmarks set state_name =  ms.name from master_states as ms
where ms.id = school_benchmarks.state_id
and sch_mgmt_center_id NOT IN ('92','93')

ALTER TABLE public.school_benchmarks
    ADD COLUMN final_flag smallint DEFAULT 0;


update master_school set state_id = lgd_state_id, district_id = lgd_district_id where state_id = 0;

Drop view if exists summary_benchmark_level_one_schools;
CREATE OR REPLACE VIEW public.summary_benchmark_level_one_schools
 AS
 SELECT esmlb.state_id,
    esmlb.district_id,
    esmlb.district_name,
    esmlb.block_name,
    esmlb.udise_code,
    esmlb.school_name,
    esmlb.category_id,
    esmlb.sch_broad_category_id,
    esmlb.class_frm,
    esmlb.class_to,
    concat(esmlb.class_frm, '-', esmlb.class_to) AS classes,
	-- esmlb.toilet_functional,
    -- esmlb.tot_enr_b,
    -- esmlb.tot_enr_g,
    esmlb.total_enrolment as tot_enr,
    esmlb.tot_tch_all as tot_teacher,
    -- esmlb.sch_medium,
    esmlb.location_type,
    esmlb.school_type,
    esmlb.drink_water,
        CASE
            WHEN esmlb.drink_water > 0 THEN 'Yes'::text
            ELSE 'No'::text
        END AS drink_water_value,
        CASE
            WHEN esmlb.toilet_functional > 0 THEN 'Yes'::text
            ELSE 'No'::text
        END AS toilet_functional,
    esmlb.pucca_building,
        CASE
            WHEN esmlb.pucca_building > 0 THEN 'Yes'::text
            ELSE 'No'::text
        END AS pucca_building_value,
    
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
	esmlb.total_enrolment as avg_enr,
    --esmlb.selection_status,
    -- esmlb.remarks,
    esmlb.final_flag,
        CASE
            WHEN esmlb.final_flag = 0 THEN 'No Action'::text
            WHEN esmlb.final_flag = 1 THEN 'Completed'::text
            WHEN esmlb.final_flag = 2 THEN 'Rejected'::text
            WHEN esmlb.final_flag = 3 THEN 'Approved'::text
            ELSE NULL::text
        END AS final_flag_value,
    -- esmlb.tot_govt_sch,
    -- esmlb.sch_excluded,
    -- esmlb.sch_benchmark,
    -- esmlb.sch_target,
    -- esmlb.flag,
    esmlb.back_image_flag,
    esmlb.front_image_flag,
    esmlb.letter_image_flag,
    esmlb.questions_flag,
    esmlb.name AS school_admin_name,
    esmlb.email AS school_admin_email,
    esmlb.mobile AS school_admin_mobile,
    sc.name AS category_name,
    s.name AS state_name,
    u.mobile AS user_mobile,
    u.email AS user_email,
    esmlb.selection_status,
        CASE
            WHEN esmlb.selection_status = 0 THEN 'No Action'::text
            WHEN esmlb.selection_status = 1 THEN 'Invited'::text
            WHEN esmlb.selection_status = 2 THEN 'Rejected'::text
            ELSE NULL::text
        END AS is_active_value,
    esmlb.sch_mgmt_center_id,
        CASE
            WHEN esmlb.sch_mgmt_center_id = 92 THEN 'KVS'::text
            WHEN esmlb.sch_mgmt_center_id = 93 THEN 'NVS'::text
            ELSE 'Others'::text
        END AS sch_mgmt_center_value
   -- esmlb.admin_quetions
   FROM school_benchmarks esmlb
     LEFT JOIN master_categories sc ON sc.id = esmlb.category_id
     LEFT JOIN master_states s ON s.id = esmlb.state_id
     LEFT JOIN users u ON u.udise_code::bpchar = esmlb.udise_code
  ORDER BY esmlb.total_enrolment DESC;



  /******************************************************************************************************************/

    ALTER TABLE master_school ALTER COLUMN category_id TYPE smallint USING (category_id::smallint);
    ALTER TABLE master_school ALTER COLUMN sch_mgmt_center_id TYPE smallint USING (sch_mgmt_center_id::smallint);
    ALTER TABLE master_school ALTER COLUMN class_frm TYPE smallint USING (class_frm::smallint);
    ALTER TABLE master_school ALTER COLUMN class_to TYPE smallint USING (class_to::smallint);
    ALTER TABLE master_school ALTER COLUMN total_enrolment TYPE smallint USING (total_enrolment::smallint);
    ALTER TABLE master_school ALTER COLUMN tot_tch_all TYPE smallint USING (tot_tch_all::smallint);
    ALTER TABLE master_school ALTER COLUMN lgd_state_id TYPE integer USING (lgd_state_id::integer);
    ALTER TABLE master_school ALTER COLUMN lgd_district_id TYPE integer USING (lgd_district_id::integer);
    ALTER TABLE master_school ALTER COLUMN drink_water TYPE smallint USING (drink_water::smallint);
    ALTER TABLE master_school ALTER COLUMN toilet_functional TYPE smallint USING (toilet_functional::smallint);
    ALTER TABLE master_school ALTER COLUMN pucca_building TYPE smallint USING (pucca_building::smallint);
    ALTER TABLE master_school ALTER COLUMN electricity TYPE smallint USING (electricity::smallint);
    ALTER TABLE master_school ALTER COLUMN sch_type TYPE smallint USING (sch_type::smallint);


    ALTER TABLE school_benchmarks ALTER COLUMN benchmark TYPE smallint USING (benchmark::smallint);
    ALTER TABLE school_benchmarks ALTER COLUMN sch_broad_category_id TYPE smallint USING (sch_broad_category_id::smallint);
    ALTER TABLE school_benchmarks ALTER COLUMN sch_medium TYPE smallint USING (sch_medium::smallint);
    ALTER TABLE school_benchmarks ALTER COLUMN location_type TYPE smallint USING (location_type::smallint);
    ALTER TABLE school_benchmarks ALTER COLUMN declaration_flag TYPE smallint USING (declaration_flag::smallint);
    ALTER TABLE school_benchmarks ALTER COLUMN back_image_flag TYPE smallint USING (back_image_flag::smallint);
    ALTER TABLE school_benchmarks ALTER COLUMN front_image_flag TYPE smallint USING (front_image_flag::smallint);
    ALTER TABLE school_benchmarks ALTER COLUMN panchayat_letter_flag TYPE smallint USING (panchayat_letter_flag::smallint);
    ALTER TABLE school_benchmarks ALTER COLUMN questions_flag TYPE smallint USING (questions_flag::smallint);
    ALTER TABLE school_benchmarks ALTER COLUMN commitment_letter_flag TYPE smallint USING (commitment_letter_flag::smallint);
    ALTER TABLE school_benchmarks ALTER COLUMN district_status TYPE smallint USING (district_status::smallint);
    ALTER TABLE school_benchmarks ALTER COLUMN state_status TYPE smallint USING (state_status::smallint);
    ALTER TABLE school_benchmarks ALTER COLUMN national_status TYPE smallint USING (national_status::smallint);
    ALTER TABLE school_benchmarks ALTER COLUMN category_id TYPE smallint USING (category_id::smallint);
    ALTER TABLE school_benchmarks ALTER COLUMN sch_mgmt_center_id TYPE smallint USING (sch_mgmt_center_id::smallint);
    ALTER TABLE school_benchmarks ALTER COLUMN class_frm TYPE smallint USING (class_frm::smallint);
    ALTER TABLE school_benchmarks ALTER COLUMN class_to TYPE smallint USING (class_to::smallint);
    ALTER TABLE school_benchmarks ALTER COLUMN total_enrolment TYPE smallint USING (total_enrolment::smallint);
    ALTER TABLE school_benchmarks ALTER COLUMN tot_tch_all TYPE smallint USING (tot_tch_all::smallint);
    ALTER TABLE school_benchmarks ALTER COLUMN lgd_state_id TYPE integer USING (lgd_state_id::integer);
    ALTER TABLE school_benchmarks ALTER COLUMN lgd_district_id TYPE integer USING (lgd_district_id::integer);
    ALTER TABLE school_benchmarks ALTER COLUMN drink_water TYPE smallint USING (drink_water::smallint);
    ALTER TABLE school_benchmarks ALTER COLUMN toilet_functional TYPE smallint USING (toilet_functional::smallint);
    ALTER TABLE school_benchmarks ALTER COLUMN pucca_building TYPE smallint USING (pucca_building::smallint);
    ALTER TABLE school_benchmarks ALTER COLUMN electricity TYPE smallint USING (electricity::smallint);
    ALTER TABLE school_benchmarks ALTER COLUMN sch_type TYPE smallint USING (sch_type::smallint);
    ALTER TABLE school_benchmarks ALTER COLUMN final_flag TYPE smallint USING (final_flag::smallint);

    ALTER TABLE master_school ALTER COLUMN lgd_state_id TYPE integer USING (lgd_state_id::integer);
    ALTER TABLE master_school ALTER COLUMN lgd_district_id TYPE integer USING (lgd_district_id::integer);


    update school_benchmarks set cat_order=cat.order_by 
    from master_categories as cat where cat.id = school_benchmarks.category_id;

    update master_school set cat_order=cat.order_by 
    from master_categories as cat where cat.id = master_school.category_id::integer;


    /*******************************************************16/09/2022**********************************************************/

    delete from public.users where role_id =7
    INSERT INTO users(role_id, name,designation_id,mobile,email,password,is_approved,is_active,created_by,updated_by,state_id,district_id,udise_code)
    SELECT '7', school_name, '',mobile,email,'w8HgNr0JCDAyml0CeWkVdGcqBOvH18kInty02yukSW3OQ083siP17Zn8Wvvm','1','1','1','1',state_id,district_id,udise_code FROM school_benchmarks;

    update public.master_states set user_id=null,comment=null,flag=0,file=null,is_active=0;
    
    truncate table public.school_selection_user_comments;
    truncate table public.mou_documents;
    truncate table public.school_question_marking_final_sections;
    truncate table public.school_school_section_wises;
    truncate table public.school_question_markings;
    update public.school_benchmarks set declaration_flag  = '',
            back_image  = '',
            back_image_flag  = '',
            front_image  = '',
            front_image_flag  = 0,
            panchayat_letter  = '',
            panchayat_letter_flag  = 0,
            questions_flag  = 0,
            commitment_letter  = '',
            commitment_letter_flag  = 0,
            district_status  = 0,
            state_status  = 0,
            national_status  = 0,
            district_status_date  = null,
            state_status_date  = null,
            national_status_date  = null,
            created_date  = null,
            updated_date  = null,
            school_declaration  = '',
            school_head  = '',
            school_head_designation  = 0,
            email  = '',
            mobile  = null,
            application_status ='' ,
            final_flag  = '',
            school_selection  = '',
            final_flag =0,
            school_selection_flag =0,
            application_status_flag =0,
            reopen=0;


    /*******************************************************16/09/2022**********************************************************/


    UPDATE public.users SET is_approved=0, is_active=0 WHERE role_id = 7 and id > 86;

    UPDATE public.users SET mobile = '9999999990' WHERE id = '1';
    UPDATE public.users SET mobile = '9999999991' WHERE id = '2';
    UPDATE public.users SET mobile = '8888888880' WHERE id = '11';


    UPDATE public.master_roles SET status = '0'::smallint WHERE id = '1';
    UPDATE public.master_roles SET status = '0'::smallint WHERE id = '7';
    
    UPDATE public.master_states SET name = 'DADRA & NAGAR HAVELI  & DAMAN & DIU'::character varying WHERE id = '38';

    ALTER TABLE public.master_states ADD user_id bigint NULL;
    ALTER TABLE public.master_states ADD "comment" text NULL;
    ALTER TABLE public.master_states ADD file varchar NULL;
    ALTER TABLE public.master_states ADD flag smallint NULL;

    CREATE TABLE public.mou_documents(
        id bigserial NOT NULL,
        user_id bigint,
        state_id smallint,
        file character varying,
        comment text COLLATE pg_catalog."default",
        created_at date,
        national_status smallint,
        national_comment text COLLATE pg_catalog."default",
        national_updated_at date,
        CONSTRAINT mou_documents_pkey PRIMARY KEY (id)
    )



    /*****************************************************21/09/2022************************************************************/

    CREATE TABLE public.settings(
        id bigint NOT NULL,
        status smallint,
        created_at timestamp without time zone,
        updated_at timestamp without time zone,
        CONSTRAINT settings_pkey PRIMARY KEY (id)
    )
    INSERT INTO public.settings (id,status,created_at,updated_at) VALUES(1,0,'2022-09-20 12:06:57', '2022-09-20 12:06:57');

    ALTER TABLE public.school_benchmarks ADD reopen smallint DEFAULT 0;


    update master_school set sch_benchmark=sblo.benchmark::integer from school_benchmarks sblo where sblo.udise_code = master_school.udise_code
    ALTER TABLE public.users ADD permision smallint DEFAULT 0;


    
    CREATE TABLE public.school_selection_user_comments(
        id bigserial NOT NULL,
        school_udise_code character varying COLLATE pg_catalog."default" NOT NULL,
        national_user_id bigint NOT NULL,
        national_comment text COLLATE pg_catalog."default",
        national_status smallint,
        state_user_id bigint NOT NULL,
        state_comment text COLLATE pg_catalog."default",
        state_status smallint,
        district_user_id bigint NOT NULL,
        district_comment text COLLATE pg_catalog."default",
        district_status smallint,
        created_at timestamp(0) without time zone,
        updated_at timestamp(0) without time zone,
        CONSTRAINT school_selection_user_comments_pkey PRIMARY KEY (id)
    );


    /*****************************************************28/09/2022************************************************************/

    update users set mobile=sblo.mobile,email=sblo.email from school_benchmarks sblo where sblo.udise_code = users.udise_code

    CREATE TABLE public.master_protocols(
        id bigserial NOT NULL,
        name character varying(255) COLLATE pg_catalog."default" NOT NULL,
        status smallint NOT NULL DEFAULT (0)::smallint,
        created_by integer NOT NULL DEFAULT 1,
        updated_by integer NOT NULL DEFAULT 1,
        created_at timestamp(0) without time zone,
        updated_at timestamp(0) without time zone,
        CONSTRAINT master_protocols_pkey PRIMARY KEY (id)
    )

    INSERT INTO public.master_protocols (id,name,status,created_by,updated_by,created_at,updated_at) 
    VALUES(1,'Physical inspection',1,1,1,'2022-09-20 12:06:57','2022-09-20 12:06:57'),
    (2,'Virtual Inspection',1,1,1,'2022-09-20 12:06:57','2022-09-20 12:06:57'),
    (3,'BRC/CRC Report',1,1,1,'2022-09-20 12:06:57','2022-09-20 12:06:57'),
    (4,'Photographs',1,1,1,'2022-09-20 12:06:57','2022-09-20 12:06:57'),
    (5,'Name of the students',1,1,1,'2022-09-20 12:06:57','2022-09-20 12:06:57'),
    (6,'Report received from the principal',1,1,1,'2022-09-20 12:06:57','2022-09-20 12:06:57'),
    (7,'School register',1,1,1,'2022-09-20 12:06:57','2022-09-20 12:06:57'),
    (8,'Incorrect',1,1,1,'2022-09-20 12:06:57','2022-09-20 12:06:57'),
    (9,'Others',1,1,1,'2022-09-20 12:06:57','2022-09-20 12:06:57');


    ALTER TABLE public.school_question_markings ADD district_id bigint DEFAULT NULL;
    ALTER TABLE public.school_question_markings ADD district_marks smallint DEFAULT 0;
    ALTER TABLE public.school_question_markings ADD district_remark text DEFAULT NULL;
    ALTER TABLE public.school_question_markings ADD district_protocol_id text DEFAULT 0;
    ALTER TABLE public.school_question_markings ADD district_varification_at timestamp(0) without time zone DEFAULT NULL;
    ALTER TABLE public.school_question_markings ADD state_id bigint DEFAULT NULL;
    ALTER TABLE public.school_question_markings ADD state_marks smallint DEFAULT 0;
    ALTER TABLE public.school_question_markings ADD state_remark text DEFAULT NULL;
    ALTER TABLE public.school_question_markings ADD state_protocol_id smallint DEFAULT 0;
    ALTER TABLE public.school_question_markings ADD state_varification_at timestamp(0) without time zone DEFAULT NULL;
    ALTER TABLE public.school_question_markings ADD national_id bigint DEFAULT NULL;
    ALTER TABLE public.school_question_markings ADD national_marks smallint DEFAULT 0;
    ALTER TABLE public.school_question_markings ADD national_remark text DEFAULT NULL;
    ALTER TABLE public.school_question_markings ADD national_protocol_id smallint DEFAULT 0;
    ALTER TABLE public.school_question_markings ADD national_varification_at timestamp(0) without time zone DEFAULT NULL;
    ALTER TABLE public.school_question_markings ADD created_at timestamp(0) without time zone DEFAULT NULL;
    ALTER TABLE public.school_question_markings ADD updated_at timestamp(0) without time zone DEFAULT NULL;

    ALTER TABLE public.school_school_section_wises ADD district_id bigint DEFAULT NULL;
    ALTER TABLE public.school_school_section_wises ADD district_marks smallint DEFAULT 0;
    ALTER TABLE public.school_school_section_wises ADD district_varification_at timestamp(0) without time zone DEFAULT NULL;
    ALTER TABLE public.school_school_section_wises ADD state_id bigint DEFAULT NULL;
    ALTER TABLE public.school_school_section_wises ADD state_marks smallint DEFAULT 0;
    ALTER TABLE public.school_school_section_wises ADD state_varification_at timestamp(0) without time zone DEFAULT NULL;
    ALTER TABLE public.school_school_section_wises ADD national_id bigint DEFAULT NULL;
    ALTER TABLE public.school_school_section_wises ADD national_marks smallint DEFAULT 0;
    ALTER TABLE public.school_school_section_wises ADD national_varification_at timestamp(0) without time zone DEFAULT NULL;
    ALTER TABLE public.school_school_section_wises ADD created_at timestamp(0) without time zone DEFAULT NULL;
    ALTER TABLE public.school_school_section_wises ADD updated_at timestamp(0) without time zone DEFAULT NULL;

    ALTER TABLE public.school_question_marking_final_sections ADD district_id bigint DEFAULT NULL;
    ALTER TABLE public.school_question_marking_final_sections ADD district_marks smallint DEFAULT 0;
    ALTER TABLE public.school_question_marking_final_sections ADD district_varification_at timestamp(0) without time zone DEFAULT NULL;
    ALTER TABLE public.school_question_marking_final_sections ADD state_id bigint DEFAULT NULL;
    ALTER TABLE public.school_question_marking_final_sections ADD state_marks smallint DEFAULT 0;
    ALTER TABLE public.school_question_marking_final_sections ADD state_varification_at timestamp(0) without time zone DEFAULT NULL;
    ALTER TABLE public.school_question_marking_final_sections ADD national_id bigint DEFAULT NULL;
    ALTER TABLE public.school_question_marking_final_sections ADD national_marks smallint DEFAULT 0;
    ALTER TABLE public.school_question_marking_final_sections ADD national_varification_at timestamp(0) without time zone DEFAULT NULL;
    ALTER TABLE public.school_question_marking_final_sections ADD created_at timestamp(0) without time zone DEFAULT NULL;
    ALTER TABLE public.school_question_marking_final_sections ADD updated_at timestamp(0) without time zone DEFAULT NULL;


    /*ALTER TABLE public.school_question_markings ALTER COLUMN district_protocol_id TYPE smallint USING (district_protocol_id::smallint);

    update public.school_question_markings set district_protocol_id = 0;*/

    CREATE TABLE public.master_blocks(
        id bigserial NOT NULL,        
        name character varying(255) COLLATE pg_catalog."default" NOT NULL,
        block_id integer NOT NULL,
        state_id smallint NOT NULL,
        district_id smallint NOT NULL,
        location_id smallint NOT NULL,
        school_select smallint NOT NULL,
        created_by integer NOT NULL DEFAULT 1,
        updated_by integer NOT NULL DEFAULT 1,
        created_at timestamp(0) without time zone,
        updated_at timestamp(0) without time zone,
        CONSTRAINT master_blocks_pkey PRIMARY KEY (id)
    )

    ALTER TABLE public.master_districts ADD freeze_status smallint NULL DEFAULT 0;
    ALTER TABLE public.master_districts ADD is_freezed smallint NULL DEFAULT 0;
    ALTER TABLE public.master_districts ADD freezed_at timestamp(0) without time zone NULL;

 /*****************************************************14/10/2022************************************************************/

    insert into public.master_scheme_category_question_marks (id,schemes_id, categories_id, questions, marks, created_by, updated_by, created_at, updated_at) 
    values(47,1,	7,	16,	31,	1,	1,	'2022-06-07 12:06:57',	'2022-06-07 12:06:57'),
    (48,2,	7,	10,	36,	1,	1,	'2022-06-07 12:06:57',	'2022-06-07 12:06:57'),
    (49,3,	7,	10,	30,	1,	1,	'2022-06-07 12:06:57',	'2022-06-07 12:06:57'),
    (50,4,	7,	4,	20,	1,	1,	'2022-06-07 12:06:57',	'2022-06-07 12:06:57'),
    (51,5,	7,	7,	18,	1,	1,	'2022-06-07 12:06:57',	'2022-06-07 12:06:57'),
    (52,6,	7,	7,	17,	1,	1,	'2022-06-07 12:06:57',	'2022-06-07 12:06:57'),
    (53,7,	7,	7,	16,	1,	1,	'2022-06-07 12:06:57',	'2022-06-07 12:06:57');

     CREATE TABLE public.freeze_documents(
        id bigserial NOT NULL,
        district_user_id bigint,
        district_id smallint,
        district_file character varying,
        district_comment text COLLATE pg_catalog."default",
        district_created_at date,
        
        state_user_id bigint,
        state_id smallint,
        state_file character varying,
        state_comment text COLLATE pg_catalog."default",
        state_created_at date,
        
        national_user_id bigint,
        national_id smallint,
        national_file character varying,
        national_comment text COLLATE pg_catalog."default",
        national_created_at date,
        
        CONSTRAINT freeze_documents_pkey PRIMARY KEY (id)
    )
    
    /*************************************************************************************************/

    ALTER TABLE public.master_states ADD is_freezed smallint NULL DEFAULT 0;
    ALTER TABLE public.master_states ADD mou_status smallint NULL DEFAULT 0;
    ALTER TABLE public.master_districts ADD freezed_at timestamp(0) without time zone NULL;

    CREATE TABLE public.mou_freeze_histories(
        id bigserial NOT NULL, 
        state_id smallint DEFAULT NULL,       
        state_name character varying(255) COLLATE pg_catalog."default" DEFAULT NULL,
        district_id smallint DEFAULT NULL,       
        district_name character varying(255) COLLATE pg_catalog."default" DEFAULT NULL,
        status character varying(15) COLLATE pg_catalog."default" DEFAULT NULL, 
        flag character varying(15) COLLATE pg_catalog."default" DEFAULT NULL, 
        created_by integer NOT NULL DEFAULT 1,
        created_on timestamp(0) without time zone,
        CONSTRAINT mou_freeze_histories_pkey PRIMARY KEY (id)
    )

    update public.master_schemes set hindi_name = a.hindi_name from public.master_schemes_back as a where master_schemes.id = a.id;
    /*update public.master_scheme_questions set hindi_question = a.hindi_question from public.master_scheme_questions_back as a where master_scheme_questions.id = a.id;*/
    update public.master_scheme_questions set hindi_question = a.hindi_question 
    from public.master_scheme_questions_back as a 
    where master_scheme_questions.schemes_id = a.schemes_id and master_scheme_questions.order = a.order;


    /*************************************************************************************************/

    ALTER TABLE public.master_states ADD is_state_freezed int NULL DEFAULT 0;
    ALTER TABLE public.master_states ADD state_freeze_status int NULL DEFAULT 0;
    ALTER TABLE public.master_states ADD state_freezed_at timestamp NULL;
    ALTER TABLE public.report_school_submissions ADD state_selection int NULL DEFAULT 0;


    
    /*************************************************************************************************/

    ALTER TABLE public.school_benchmarks ADD district_verification int2 NULL DEFAULT NULL;
    COMMENT ON COLUMN public.school_benchmarks.district_verification IS 'null:default,1:verified & approved,0:verified & not-approved';

    ALTER TABLE public.school_benchmarks ADD passed_status int2 NULL;

    ALTER TABLE public.school_benchmarks ADD school_mark float4 NULL;

    COMMENT ON COLUMN public.school_benchmarks.school_mark IS 'mark in %';
    ALTER TABLE public.school_benchmarks ADD district_mark float4 NULL;

    ALTER TABLE public.users ADD school_flag int2 NULL DEFAULT 0;

    ALTER TABLE public.report_school_submissions ADD national_selection int2 NULL DEFAULT 0;
    ALTER TABLE public.report_school_submissions ADD school_verified_unapproved int2 NULL DEFAULT 0;
    ALTER TABLE public.report_school_submissions ADD state_selection int4 NULL DEFAULT 0;

    
    /*************************************************************************************************/

    update public.master_school 
	set block_id=pd.lgd_block_ulb,
		block_name = pd.lgd_block_ulb_desc,
		location_type = pd.sch_r_u,
		district_name = pd.lgd_district_name,
		district_id = pd.lgd_district_id
    from public.pmsiri_data pd where pd.udise_code = master_school.udise_code


    select * from master_school where lgd_district_id != district_id and state_id not in (175,176) and sch_benchmark = 1 --8628

    select * from master_school where block_id=0  --18610
    select * from master_school where block_id=0 and sch_benchmark = 1 --5616


    update public.school_benchmarks 
 	set block_id=pd.lgd_block_ulb, 		
	block_name = pd.lgd_block_ulb_desc, 		
	location_type = pd.sch_r_u,
 		district_name = pd.lgd_district_name,
 		district_id = pd.lgd_district_id
    from public.pmsiri_data pd where pd.udise_code = school_benchmarks.udise_code


    select state_id,state_name,count(state_id) from school_benchmarks where final_flag = 1 and lgd_district_id != district_id and state_id not in (175,176) 
            group by state_id,state_name --5213
            
            
    select state_id,state_name,count(state_id) from master_school where lgd_district_id != district_id and state_id not in (175,176) and sch_benchmark = 1 
            group by state_id,state_name --8628

    select state_id,state_name,count(state_id) from school_benchmarks where block_id=0 group by state_id,state_name  --18610
    select * from master_school where block_id=0 and sch_benchmark = 1 --5616


    /********************************************************************************************************************************/

    select * from school_school_section_wises where district_id is not null and district_marks = marks*2 and district_marks > 0
    select * from school_school_section_wises where district_id is not null and district_marks > marks and district_marks > 0

    update school_school_section_wises set district_marks = marks where district_id is not null and district_marks = marks*2 and district_marks > 0
    update school_school_section_wises set district_marks = marks where district_id is not null and district_marks > marks and district_marks > 0


    update school_benchmarks 
	    set block_id =  mb.block_id,block_name =mb."name"
    from master_blocks mb 
        where 
            mb.state_id = school_benchmarks.lgd_state_id and 
            mb.district_id = school_benchmarks.lgd_district_id and 
            school_benchmarks.sch_mgmt_center_id IN ('92','93') 
            
    update master_school 
        set block_id =  mb.block_id,block_name =mb."name"
    from master_blocks mb 
        where 
            mb.state_id = master_school.lgd_state_id and 
            mb.district_id = master_school.lgd_district_id and 
            master_school.sch_mgmt_center_id IN ('92','93') 	

    update school_benchmarks 
        set block_id =  mb.block_id,block_name =mb."name"
    from master_blocks mb 
        where 
            mb.state_id = school_benchmarks.state_id and 
            mb.district_id = school_benchmarks.district_id and 
            school_benchmarks.sch_mgmt_center_id NOT IN ('92','93') 	
            
            
    update master_school 
        set block_id =  mb.block_id,block_name =mb."name"
    from master_blocks mb 
        where 
            mb.state_id = master_school.state_id and 
            mb.district_id = master_school.district_id and 
            master_school.sch_mgmt_center_id NOT IN ('92','93') 		

    /********************************************************************************************************************************/
    
    select schools_id,schemes_id,questions_id, count(*) from school_question_markings
    group by schools_id,schemes_id,questions_id having count(*) > 1

    select * into tempaa from (
    select dense_rank() over (partition by schools_id,schemes_id,questions_id order by id desc) as rnk,
    *
    from school_question_markings
    --where schools_id=1644 and schemes_id=7 and questions_id=27
    ) aa where rnk!=1

    delete from school_question_markings
    where id in (
    select id from tempaa) 

    /********************************************************************************************************************************/
    
    SELECT id,udise_code,state_id,district_id ,passed_status ,final_flag,district_verification
    FROM public.school_benchmarks
    where state_id = 24 and district_id =445 and passed_status = 1 and final_flag  = 1 and district_verification = 0

    update school_benchmarks set district_verification = 1
    where state_id = 24 and district_id =445 and passed_status = 1 and final_flag  = 1 and district_verification = 0

    update public.school_selection_user_comments as ssu set district_status= 1
    from school_benchmarks as sb where  ssu.school_udise_code = sb.udise_code
    and state_id = 24 and district_id = 445 and passed_status = 1 and final_flag  = 1 and district_verification = 1

    /********************************************************************************************************************************/
    -- update school_benchmarks sblo  set block_id=mstb.block_id, block_name=mstb.block_name
    --     FROM
    --     ( select distinct block_id, name as block_name from  master_blocks ) mstb
    --     where
    --     sblo.sch_mgmt_center_id IN ('92','93')

    --     and sblo.block_id = mstb.block_id
    --     and sblo.block_name!=COALESCE(mstb.block_name,'')
    --         school_benchmarks.sch_mgmt_center_id IN ('92','93')
			
	-- 		(
	-- 		 select sb.id,mb.state_id , sb.lgd_state_id , 
	-- 		 mb.district_id , sb.lgd_district_id,
	-- 		 sb.block_id ,  mb.block_id , sb.block_name ,mb."name"
    -- from master_blocks mb , school_benchmarks  sb
    --     where 
    --         mb.state_id = sb.lgd_state_id and 
    --         mb.district_id = sb.lgd_district_id and 
    --         sb.sch_mgmt_center_id IN ('92','93')
	-- 		) tempaa
			
	-- 		select * from school_benchmarks
			
	-- 		  select sb.id, sb.block_id , sb.block_name 
	-- 		  --,mb.block_id , mb.block_name
	-- 		  into upd_block_92
	-- 		  from school_benchmarks  sb
	-- 		  inner join school_benchmarks_10jan mb
	-- 		  on mb.state_id = sb.state_id and 
    --        	  mb.district_id = sb.district_id and
	-- 		  mb.udise_code=sb.udise_code
	-- 		  and  sb.sch_mgmt_center_id not IN ('92','93')
			  
			  
	-- 		  select sb.id, sb.block_id , sb.block_name ,mb.block_id , mb.block_name
	-- 		  --into upd_block
	-- 		  from school_benchmarks  sb
	-- 		  inner join school_benchmarks_10jan mb
	-- 		  on mb.state_id = sb.state_id and 
    --        	  mb.district_id = sb.district_id and
	-- 		  mb.udise_code=sb.udise_code
	-- 		  and  sb.sch_mgmt_center_id not IN ('92','93')
			  
	-- 		  update school_benchmarks sbo
	-- 		  set block_id= tt.block_id, block_name =tt.block_name
	-- 		  from upd_block tt
	-- 		  where sbo.id=tt.id
			  
	-- 		  update school_benchmarks sbo
	-- 		  set block_id= tt.block_id, block_name =tt.block_name
	-- 		  from upd_block_92 tt
	-- 		  where sbo.id=tt.id
			  
	-- 		  --271930
	-- 		  drop table updatett
			  
	-- 		  select distinct udise_code, sbo.block_id, mst."name" block_name
	-- 		  into updatett 
	-- 		  from school_benchmarks_10jan sbo
	-- 		  left join master_blocks mst
	-- 		  on sbo.block_id=mst.block_id
			 
	-- 		 select * from updatett
			  
			  
			  
	-- 		  update school_benchmarks sbo
	-- 		  set block_id= tt.block_id, block_name =tt.block_name
	-- 		  from updatett tt
	-- 		  where sbo.udise_code=tt.udise_code
    /********************************************************************************************************************************/


    update master_districts set district_acknowledgement = 1 
    from freeze_documents fd
    where fd.district_id = master_districts.id 
    and master_districts.freeze_status = 1 and master_districts.is_freezed = 1;

    update master_states set state_acknowledgement = 1 
    from freeze_documents fd
    where fd.state_id = master_states.id 
    and master_states.state_freeze_status  = 1 and master_states.is_state_freezed  = 1;


 /********************************************************************************************************************************/
 
    ALTER TABLE public.master_schools ADD "school_password" varchar NULL;

    CREATE TABLE IF NOT EXISTS public.log_users(
        id bigserial NOT NULL,
        users_id bigint,
        session_id character varying,
        user_flag character varying(12),
        log_in character varying(12),
        log_out character varying(12),
        ip_address inet,
        browser character varying(255),
        platform character varying(255),
        os character varying(255),
        device character varying(255),
        login_status smallint NOT NULL DEFAULT (0)::smallint,
        macaddress character varying(50) NOT NULL,
        created_at timestamp(0) without time zone,
        updated_at timestamp(0) without time zone,
        CONSTRAINT log_users_pkey PRIMARY KEY (id)
    )

    TABLESPACE pg_default;

    ALTER TABLE IF EXISTS public.log_errors OWNER to postgres;

    CREATE TABLE IF NOT EXISTS public.log_errors(
        id bigint NOT NULL,
        code character varying(10) COLLATE pg_catalog."default",
        file character varying(255) COLLATE pg_catalog."default",
        line character varying(10) COLLATE pg_catalog."default",
        observe character varying(100) COLLATE pg_catalog."default",
        message text COLLATE pg_catalog."default",
        trace text COLLATE pg_catalog."default",
        created_at timestamp(0) without time zone,
        updated_at timestamp(0) without time zone,
        CONSTRAINT elog_errors_pkey PRIMARY KEY (id)
    )

    TABLESPACE pg_default;

    ALTER TABLE IF EXISTS public.log_errors OWNER to postgres;

    ALTER TABLE IF EXISTS public.old_passwords OWNER to postgres;

    CREATE TABLE public.old_passwords (
        id bigserial NOT NULL,
        user_id bigint NOT NULL,
        flag varchar(10) NOT NULL,
        "password" varchar NOT NULL
    );

    TABLESPACE pg_default;

    ALTER TABLE IF EXISTS public.old_passwords OWNER to postgres;



    /*count for total participation volunteer wise******************************************************************/

    insert into temp(participation_count, volunteer_id,type) 
    select count(av.id) as participation_count,av.volunteer_id as volunteer_id,'activity'  from activity_volunteers av
    where application_status =1 group by av.volunteer_id order by av.volunteer_id asc

    insert into temp(participation_count, volunteer_id,type) 
    select count(cv.id) as participation_count,cv.volunteer_id as volunteer_id,'assets'  from contribution_volunteers cv
    where application_status =1 group by cv.volunteer_id order by cv.volunteer_id asc

    CREATE OR REPLACE VIEW public.total_participation_count_views
    AS
    SELECT 
            v.id,
            (select sum(participation_count) from temp tp
            where v.id =tp.volunteer_id group by tp.volunteer_id) as total_count   	
            
    from volunteers v

    update public.volunteers set total_participation = tv.total_count from total_participation_count_views as tv
    where tv.id = volunteers.id

    /********************************************************************** count for total rating volunteer wise*/

    select sum(av.rate) as rating_count,av.volunteer_id  from activity_volunteers av
    where application_status =1 group by av.volunteer_id order by av.volunteer_id asc

    insert into temp(rating_count, volunteer_id,type) 
    select sum(av.rate) as rating_count,av.volunteer_id,'activity' from activity_volunteers av
    where application_status =1 group by av.volunteer_id order by av.volunteer_id asc


    insert into temp(rating_count, volunteer_id,type) 
    select sum(cv.rate) as rating_count,cv.volunteer_id as volunteer_id,'assets'  from contribution_volunteers cv
    where application_status =1 group by cv.volunteer_id order by cv.volunteer_id asc

    CREATE OR REPLACE VIEW public.total_rating_count_views
    AS
    SELECT 
            v.id,
            (select sum(rating_count) from temp tp
            where v.id =tp.volunteer_id group by tp.volunteer_id) as total_count   	
            
        from volunteers v
        
        
    update public.volunteers set total_rating = trv.total_count from total_rating_count_views as trv
    where trv.id = volunteers.id

    /*number of rating count volunteer wise*****************************************************************************************************/


      insert into temp(number_of_rating_count, volunteer_id,type) 
    select count(av.id) as number_of_rating_count,av.volunteer_id as volunteer_id,'activity'  from activity_volunteers av
    where application_status =1 and av.rate!=0 group by av.volunteer_id order by av.volunteer_id asc

    insert into temp(number_of_rating_count, volunteer_id,type) 
    select count(cv.id) as number_of_rating_count,cv.volunteer_id as volunteer_id,'assets'  from contribution_volunteers cv
    where cv.application_status =1 and cv.rate!=0 group by cv.volunteer_id order by cv.volunteer_id asc

    CREATE OR REPLACE VIEW public.total_number_of_rating_count_views
    AS
    SELECT 
            v.id,
            (select sum(number_of_rating_count) from temp tp
            where v.id =tp.volunteer_id group by tp.volunteer_id) as total_no_rating_count   	
            
    from volunteers v

    update public.volunteers set total_number_of_rating = tv.total_no_rating_count from total_number_of_rating_count_views as tv
    where tv.id = volunteers.id


    update school_assets_posts set maintenance_required = 1 where maintenance_required = '1 year';
    update school_assets_posts set maintenance_required = 2 where maintenance_required = '2 year';
    update school_assets_posts set maintenance_required = 3 where maintenance_required = '3 year';
    update school_assets_posts set maintenance_required = 4 where maintenance_required = '4 year';
    update school_assets_posts set maintenance_required = 5 where maintenance_required = '5 year';


    update school_assets_posts set maintenance_required = 0 where maintenance_required = 'Not applicable';


    /**************************************************************************************************/

    update volunteers set volunteer_name = INITCAP(volunteer_name);
    update admin_users set user_name = INITCAP(user_name);
    update master_schools set school_name = INITCAP(school_name), school_state_name = INITCAP(school_state_name),
           school_district_name = INITCAP(school_district_name),school_block_name = INITCAP(school_block_name),
           school_address = INITCAP(school_address);

    