CREATE TABLE public.master_roles (
    id serial NOT NULL,
    role_name character varying(100) NOT NULL UNIQUE,
    role_status smallint NOT NULL DEFAULT 1,
    role_order smallint NOT NULL DEFAULT 0,
    CONSTRAINT master_roles_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE public.master_roles OWNER to postgres;

/***************************************************************************************************************/

CREATE TABLE public.master_states (
    id serial NOT NULL,
    state_name character varying(100) NOT NULL UNIQUE,
    state_status smallint NOT NULL DEFAULT 1,
    state_order smallint NOT NULL DEFAULT 0,
    CONSTRAINT master_states_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE public.master_states OWNER to postgres;

/***************************************************************************************************************/

CREATE TABLE public.master_countries (
    id serial NOT NULL,
    country_name character varying(100),
    country_status smallint  DEFAULT 1,
    country_order smallint DEFAULT 0,
    country_code character varying(20) NOT NULL,
    CONSTRAINT master_countries_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE public.master_countries OWNER to postgres;

/***************************************************************************************************************/

CREATE TABLE public.master_districts (
    id serial NOT NULL,
    district_state_id smallint NOT NULL,
    district_name character varying(100) NOT NULL,
    district_status smallint NOT NULL DEFAULT 1,
    district_order smallint NOT NULL DEFAULT 0,
    CONSTRAINT master_districts_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE public.master_districts OWNER to postgres;

/***************************************************************************************************************/

CREATE TABLE public.master_blocks (
    id serial NOT NULL,
    block_state_id smallint NOT NULL,
    block_district_id smallint NOT NULL,
    block_name character varying(100) NOT NULL,
    block_status smallint NOT NULL DEFAULT 1,
    block_order smallint NOT NULL DEFAULT 0,
    CONSTRAINT master_blocks_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE public.master_blocks OWNER to postgres;

/***************************************************************************************************************/

CREATE TABLE public.master_volunteer_types (
    id serial NOT NULL,
    volunteer_type_name character varying(100) NOT NULL UNIQUE,
    volunteer_type_status smallint NOT NULL DEFAULT 1,
    volunteer_type_order smallint NOT NULL DEFAULT 0,
    CONSTRAINT master_volunteer_types_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE public.master_volunteer_types OWNER to postgres;

/***************************************************************************************************************/

CREATE TABLE public.master_genders (
    id serial NOT NULL,
    gender_name character varying(100) NOT NULL UNIQUE,
    gender_status smallint NOT NULL DEFAULT 1,
    gender_order smallint NOT NULL DEFAULT 0,
    CONSTRAINT master_genders_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE public.master_genders OWNER to postgres;

/***************************************************************************************************************/

CREATE TABLE public.master_school_categories (
    id serial NOT NULL,
    school_category_name character varying(100) NOT NULL UNIQUE,
    school_category_status smallint NOT NULL DEFAULT 1,
    school_category_order smallint NOT NULL DEFAULT 0,
    CONSTRAINT master_school_categories_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE public.master_school_categories OWNER to postgres;

/***************************************************************************************************************/

CREATE TABLE public.master_school_managements (
    id serial NOT NULL,
    school_management_name character varying(100) NOT NULL UNIQUE,
    school_management_status smallint NOT NULL DEFAULT 1,
    school_management_order smallint NOT NULL DEFAULT 0,
    CONSTRAINT master_school_managements_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE public.master_school_managements OWNER to postgres;

/***************************************************************************************************************/

CREATE TABLE public.master_school_types (
    id serial NOT NULL,
    school_type_name character varying(100) NOT NULL UNIQUE,
    school_type_status smallint NOT NULL DEFAULT 1,
    school_type_order smallint NOT NULL DEFAULT 0,
    CONSTRAINT master_school_types_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE public.master_school_types OWNER to postgres;

/***************************************************************************************************************/

CREATE TABLE public.master_qualifications (
    id serial NOT NULL,
    qualification_name character varying(100) NOT NULL UNIQUE,
    qualification_status smallint NOT NULL DEFAULT 1,
    qualification_order smallint NOT NULL DEFAULT 0,
    CONSTRAINT master_qualifications_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE public.master_qualifications OWNER to postgres;

/***************************************************************************************************************/

CREATE TABLE public.master_specializations (
    id serial NOT NULL,
    specialization_name character varying(100) NOT NULL UNIQUE,
    specialization_status smallint NOT NULL DEFAULT 1,
    specialization_order smallint NOT NULL DEFAULT 0,
    CONSTRAINT master_specializations_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE public.master_specializations OWNER to postgres;

/***************************************************************************************************************/

CREATE TABLE public.master_activity_categories (
    id serial NOT NULL,
    activity_category_name character varying(100) NOT NULL UNIQUE,
    activity_category_status smallint NOT NULL DEFAULT 1,
    activity_category_order smallint NOT NULL DEFAULT 0,
    CONSTRAINT master_activity_categories_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE public.master_activity_categories OWNER to postgres;

/***************************************************************************************************************/

CREATE TABLE public.master_activity_sub_categories (
    id serial NOT NULL,
    activity_category_id smallint NOT NULL,
    activity_sub_category_name character varying(100) NOT NULL UNIQUE,
    activity_sub_category_status smallint NOT NULL DEFAULT 1,
    activity_sub_category_order smallint NOT NULL DEFAULT 0,
    CONSTRAINT master_activity_sub_categories_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE public.master_activity_sub_categories OWNER to postgres;

/***************************************************************************************************************/

CREATE TABLE public.master_asset_sub_categories (
    id serial NOT NULL,
    asset_category_id smallint NOT NULL,
    asset_sub_category_name character varying(100) NOT NULL UNIQUE,
    asset_sub_category_status smallint NOT NULL DEFAULT 1,
    asset_sub_category_order smallint NOT NULL DEFAULT 0,
    CONSTRAINT master_asset_sub_categories_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE public.master_asset_sub_categories OWNER to postgres;

/***************************************************************************************************************/

CREATE TABLE public.master_asset_categories (
    id serial NOT NULL,
    asset_category_name character varying(100) NOT NULL UNIQUE,
    asset_category_status smallint NOT NULL DEFAULT 1,
    asset_category_order smallint NOT NULL DEFAULT 0,
    CONSTRAINT master_asset_categories_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE public.master_asset_categories OWNER to postgres;

/***************************************************************************************************************/

CREATE TABLE public.master_class_categories (
    id serial NOT NULL,
    class_category_name character varying(100) NOT NULL UNIQUE,
    class_category_status smallint NOT NULL DEFAULT 1,
    class_category_order smallint NOT NULL DEFAULT 0,
    CONSTRAINT master_class_categories_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE public.master_class_categories OWNER to postgres;

/***************************************************************************************************************/

CREATE TABLE public.master_status (
    id serial NOT NULL,
    status_name character varying(100) NOT NULL UNIQUE,
    status_order smallint NOT NULL DEFAULT 0,
    activity_flag smallint NOT NULL DEFAULT 0,
    asset_flag smallint NOT NULL DEFAULT 0,
    CONSTRAINT master_status_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE public.master_status OWNER to postgres;

/***************************************************************************************************************/

CREATE TABLE public.master_close_reasons (
    id serial NOT NULL,
    reasons_name character varying(100) NOT NULL UNIQUE,
    reasons_order smallint NOT NULL DEFAULT 0,
    reasons_status smallint NOT NULL DEFAULT 0,
    type_flag smallint NOT NULL DEFAULT 0,
    CONSTRAINT master_close_reasons_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE public.master_close_reasons OWNER to postgres;

/***********************************************************************************************************/

CREATE TABLE public.master_asset_maintenance (
    id serial NOT NULL,
    maintenance_year character varying(100) DEFAULT NULL,
    status smallint DEFAULT 1,
    CONSTRAINT master_asset_maintenance_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE public.master_asset_maintenance OWNER to postgres;

/***************************************************************************************************************/

CREATE TABLE public.master_schools (
    id bigserial NOT NULL,
    udise_code character varying(11) NOT NULL,
    school_name character varying(255) DEFAULT NULL,
    school_profile_image character varying(80) DEFAULT NULL,
    school_email character varying(80) DEFAULT NULL,
    school_mobile character varying(10) DEFAULT NULL, 
    school_type character varying(60) DEFAULT NULL,
    school_address text DEFAULT NULL,    
    school_postal_code character varying(6) DEFAULT NULL,    
    school_postal_address text DEFAULT NULL,   
    school_category smallint DEFAULT NULL,
    school_management_center smallint DEFAULT NULL,
    school_state_id smallint NOT NULL,
    school_state_name character varying(100) DEFAULT NULL,
    school_district_id smallint NOT NULL,
    school_district_name character varying(100) DEFAULT NULL,    
    school_block_id int NOT NULL,
    school_block_name character varying(100) DEFAULT NULL,
    school_class_from smallint DEFAULT NULL,
    school_class_to smallint DEFAULT NULL, 
    school_location_type smallint DEFAULT NULL,
    school_ori_state_id smallint DEFAULT NULL,
    school_ori_district_id smallint DEFAULT NULL,   
    reg_allowed smallint DEFAULT 0,
    special_flag smallint DEFAULT 0,
    school_onboard smallint DEFAULT 0,
    CONSTRAINT master_schools_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE public.master_schools OWNER to postgres;

/***************************************************************************************************************/

CREATE TABLE public.volunteers (
    id bigserial NOT NULL,
    volunteer_name character varying(255) DEFAULT NULL,
    volunteer_mobile character varying(25) DEFAULT NULL,
    volunteer_email character varying(80) DEFAULT NULL,
    volunteer_role_id int DEFAULT 0,
    volunteer_type_id int DEFAULT 0,
    volunteer_state_id character varying(50) DEFAULT NULL,
    volunteer_district_id character varying(50) DEFAULT NULL,
    volunteer_country_id int DEFAULT NULL,
    volunteer_address text DEFAULT NULL,
    volunteer_postal_code char(6) DEFAULT NULL,
    volunteer_qualification_id int DEFAULT 0,
    volunteer_profile_image character varying(255) DEFAULT NULL,
    volunteer_dob date DEFAULT NULL,
    volunteer_gender_id int DEFAULT 0,
    volunteer_status int DEFAULT 0,    
    volunteer_experience int DEFAULT 0,    
    volunteer_rating int DEFAULT 0,
    volunteer_password character varying(255) DEFAULT NULL,
    darapan_id character varying(20) DEFAULT NULL,
    pancard_number character varying(10) DEFAULT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp default current_timestamp,    
    CONSTRAINT volunteers_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;
ALTER TABLE public.volunteers OWNER to postgres;


/***************************************************************************************************************/

CREATE TABLE public.user_details (
    id bigserial NOT NULL,
    user_id bigint NOT NULL,
    darapan_id character varying(20) DEFAULT NULL,
    pancard_number character varying(10) DEFAULT NULL,
    pancard_image character varying(135) DEFAULT NULL,
    passport_number character varying(9) DEFAULT NULL,
    passport_image character varying(100) DEFAULT NULL,
    aadhaar_number character varying(12) DEFAULT NULL,
    aadhaar_image character varying(135) DEFAULT NULL,
    cin_number character varying(21) DEFAULT NULL,
    cin_image character varying(135) DEFAULT NULL,
    gst_number character varying(15) DEFAULT NULL,
    gst_image character varying(135) DEFAULT NULL,
    voter_card_number character varying(10) DEFAULT NULL,
    voter_card_image character varying(100) DEFAULT NULL,
    driving_license_number character varying(17) DEFAULT NULL,
    driving_license_image character varying(135) DEFAULT NULL,
    contact_person_name character varying(80) DEFAULT NULL,
    contact_person_email character varying(60) DEFAULT NULL,
    contact_person_mobile character varying(10) DEFAULT NULL,
    employeed_status smallint DEFAULT 0,
    CONSTRAINT user_details_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;
ALTER TABLE public.user_details OWNER to postgres;

/***************************************************************************************************************/

CREATE TABLE public.school_activities_posts (
    id bigserial NOT NULL,
    school_id bigint NOT NULL,    
    activity_state_id int DEFAULT NULL,
    activity_district_id int DEFAULT NULL,
    activity_category_id int NOT NULL,
    activity_sub_category_id int  NOT NULL,
    class_category_id character varying(30) DEFAULT NULL,
    specialization_id int DEFAULT NULL,
    gender_id int DEFAULT NULL,
    activity_details text,
    activity_frequency varchar(30) DEFAULT 'Onetime',    
    activity_duration int DEFAULT 0,    
    impected_students int DEFAULT 0,
    activity_publish int DEFAULT 0,
    activity_status int DEFAULT 0,
    activity_closed int DEFAULT 0,
    activity_close_reason varchar(255) DEFAULT NULL,
    admin_approval int DEFAULT NULL,
    admin_remark text,        
    activity_last_reciving_date timestamp without time zone DEFAULT NULL,
    activity_tentative_start_date timestamp without time zone DEFAULT NULL,
    activity_actual_start_date timestamp without time zone DEFAULT NULL,
    activity_actual_end_date timestamp without time zone DEFAULT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT school_activities_posts_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;
ALTER TABLE public.school_activities_posts OWNER to postgres;


/***************************************************************************************************************/

CREATE TABLE public.activity_volunteers (
    id bigserial NOT NULL,
    school_activity_post_id bigint NOT NULL,    
    volunteer_id int NOT NULL,
    volunteer_status varchar(255) DEFAULT 'Pending',
    interview_mode varchar(255),
    decline_reason text DEFAULT NULL,
    meeting_details text DEFAULT NULL,
    meeting_date timestamp without time zone DEFAULT NULL,
    meeting_start_date timestamp without time zone DEFAULT NULL,    
    meeting_end_date timestamp without time zone DEFAULT NULL,
    meeting_end_time varchar(255) DEFAULT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_by int DEFAULT NULL,
    modified_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    modified_by int DEFAULT NULL,        
    location varchar(255) DEFAULT NULL,
    completion_status varchar(255) DEFAULT NULL,
    withdrawal_reason text DEFAULT NULL,
    interview_date_acceptance timestamp without time zone DEFAULT NULL,
    activity_meeting_time varchar(255) DEFAULT NULL,
    meeting_time varchar(255) DEFAULT NULL,
    block_profile int DEFAULT 0,
    invited_disclaimer int DEFAULT NULL,
    interview_procedure varchar(255) DEFAULT NULL,   
    CONSTRAINT activity_volunteers_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;
ALTER TABLE public.activity_volunteers OWNER to postgres;


--------------mYSQL ------------------/
DROP TABLE IF EXISTS `activity_volunteers`;
CREATE TABLE IF NOT EXISTS `activity_volunteers` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `activity_id` bigint(20) NOT NULL,
  `volunteer_id` int(11) NOT NULL,
  `report_spam` tinyint(1) NOT NULL DEFAULT '0',
  `spam_note` text DEFAULT NULL,
  `status` enum('Pending','Decline','Invited For Meeting','Reschedule Invited For Meeting','Confirmed','Decline For Confirmed','WithdrawAppliaction') NOT NULL DEFAULT 'Pending',
  `interview_mode` enum('online','inperson') NOT NULL,
  `decline_reason` text DEFAULT NULL,
  `decline_reason_other` text DEFAULT NULL,
  `meeting_details` text DEFAULT NULL,
  `meeting_date` datetime DEFAULT NULL,
  `meeting_start_date` date DEFAULT NULL,
  `meeting_start_time` time DEFAULT NULL,
  `meeting_end_date` date DEFAULT NULL,
  `meeting_end_time` time DEFAULT NULL,
  `is_present_for_activity` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `modified_at` datetime DEFAULT NULL,
  `modified_by` int(11) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `completion_status` varchar(255) DEFAULT NULL,
  `withdrawal_reason` text DEFAULT NULL,
  `interview_date_acceptance` datetime DEFAULT NULL,
  `activity_meeting_time` varchar(255) DEFAULT NULL,
  `meeting_time` varchar(255) DEFAULT NULL,
  `block_profile` tinyint(1) DEFAULT '0',
  `invited_disclaimer` tinyint(1) DEFAULT NULL,
  `interview_procedure` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `activity_id` (`activity_id`),
  KEY `volunteer_id` (`volunteer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
COMMIT;

/***************************************************************************************************************/

CREATE TABLE public.admin_users (
    id bigserial NOT NULL,
    user_name character varying(100) DEFAULT NULL,      
    user_email character varying(80) DEFAULT NULL,
    user_mobile character varying(15) DEFAULT NULL,
    user_password character varying(100) DEFAULT NULL, 
    user_role_id int NOT NULL,
    user_status int DEFAULT 1, 
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,    
    updated_at timestamp default current_timestamp,
    user_state_id int DEFAULT NULL,
    user_district_id int DEFAULT NULL,
    user_block_id int DEFAULT NULL,
    fp_token character varying(255) DEFAULT NULL,
    fp_token_at date DEFAULT NULL, 
    CONSTRAINT admin_users_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;
ALTER TABLE public.admin_users OWNER to postgres;


/***************************************************************************************************************/

CREATE TABLE public.activity_timelines (
    id bigserial NOT NULL,
    activity_id bigserial NOT NULL,      
    activity_image character varying(200) DEFAULT NULL,
    activity_description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,    
    modified_at timestamp default CURRENT_TIMESTAMP,
    created_by int DEFAULT NULL,
    CONSTRAINT activity_timelines_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;
ALTER TABLE public.activity_timelines OWNER to postgres;

/***************************************************************************************************************/

CREATE TABLE public.activity_preferences (
    id bigserial NOT NULL,
    type smallint NOT NULL,      
    user_id int NOT NULL,
    state_id int NOT NULL,
    district_id int NOT NULL,
    activity_type_master_id varchar(255) DEFAULT NULL,
    contribution_type_master_id varchar(255) DEFAULT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,  
    CONSTRAINT activity_preferences_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;
ALTER TABLE activity_preferences OWNER to postgres;


/*--------------------------------------------------------------------------------------------------- */


CREATE TABLE public.school_assets_posts (
    id bigserial NOT NULL,
    school_id int DEFAULT NULL,    
    asset_category_id int DEFAULT NULL,
    asset_sub_category_id int DEFAULT NULL,
    asset_quantity int DEFAULT 0,
    asset_details text,
    asset_status int  DEFAULT 1,
    asset_expected_date timestamp without time zone DEFAULT NULL, 
    asset_last_application_date timestamp without time zone DEFAULT NULL,
    asset_closed int DEFAULT 0,    
    asset_close_reason int DEFAULT 0,
    impected_students int DEFAULT NULL,
    maintenance_required varchar(55) DEFAULT NULL,
    asset_state_id int DEFAULT NULL,
    asset_district_id int DEFAULT NULL,   
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,  
    CONSTRAINT school_assets_posts_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;
ALTER TABLE public.school_assets_posts OWNER to postgres;



/**************************MYSQL**************************************/
DROP TABLE IF EXISTS `school_contributions`;
CREATE TABLE IF NOT EXISTS `school_contributions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `school_id` int(11) DEFAULT NULL,
  `type_master_id` int(11) DEFAULT NULL,
  `sub_category` int(11) DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `title` text COLLATE utf8_unicode_ci,
  `asset_qty` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `contribution_frequency` enum('regular','onetime') COLLATE utf8_unicode_ci NOT NULL DEFAULT 'regular',
  `details` text COLLATE utf8_unicode_ci,
  `status` int(11) DEFAULT '1',
  `expected_date` date DEFAULT NULL,
  `last_application_date` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `modify_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_closed` tinyint(1) DEFAULT '0',
  `reason_closer` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `student_count` int(11) DEFAULT NULL,
  `is_volunteer_requested` int(11) DEFAULT '0',
  `volunteer_id` int(11) DEFAULT NULL,
  `admin_status` int(5) DEFAULT NULL,
  `admin_modify_remarks` text COLLATE utf8_unicode_ci,
  `maintenance_required` varchar(50) COLLATE utf8_unicode_ci DEFAULT NULL,
  `disclaimer` tinyint(1) DEFAULT NULL,
  `contribution_state_id` int(11) DEFAULT NULL,
  `contribution_district_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `school_id_idx` (`school_id`) COMMENT='Filter column',
  KEY `admin_status_idx` (`admin_status`) COMMENT='Filter column',
  KEY `status_idx` (`status`) COMMENT='Filter column',
  KEY `is_closed` (`is_closed`) COMMENT='Filter Column'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
COMMIT;

------------------------------------------------------------------------------------------------

CREATE TABLE public.contribution_volunteers (
    id bigserial NOT NULL,
    school_assets_post_id bigserial NOT NULL,    
    volunteer_id int NOT NULL,    
    volunteer_status varchar(50) DEFAULT 'Pending',
    asset_qty character varying(255) DEFAULT NULL,
    contribution_by_volunteer character varying(255) DEFAULT NULL,
    accepted_by_school character varying(255) DEFAULT NULL,    
    collection_status int DEFAULT 0,
    collection_status_image character varying(255) DEFAULT NULL,
    meeting_date timestamp without time zone DEFAULT NULL,
    meeting_start_date timestamp without time zone DEFAULT NULL,
    meeting_end_date timestamp without time zone DEFAULT NULL,
    meeting_start_time character varying(255) DEFAULT NULL,
    location character varying(255) DEFAULT NULL,
    interview_mode character varying(255) DEFAULT NULL,
    decline_reason character varying(255) DEFAULT NULL,
    decline_reason_other character varying(255) DEFAULT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_by int DEFAULT NULL,    
    modified_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,        
    modified_by int DEFAULT NULL,
    last_collection_id int DEFAULT NULL,
    withdrawal_reason text,    
    meeting_time varchar(255) DEFAULT NULL,
    block_profile int DEFAULT 0,
    invited_disclaimer int DEFAULT NULL,
    completed_delivery_date timestamp without time zone DEFAULT NULL,    
    interview_procedure varchar(255) DEFAULT NULL,
    CONSTRAINT contribution_volunteers_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;
ALTER TABLE public.contribution_volunteers OWNER to postgres;

------------------------------mysql Query----------------------------------------

DROP TABLE IF EXISTS `contribution_volunteers`;
CREATE TABLE IF NOT EXISTS `contribution_volunteers` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `contribution_id` bigint(20) NOT NULL,
  `volunteer_id` int(11) NOT NULL,
  `status` enum('Pending','Invited For Meeting','Reschedule Invited For Meeting','Decline For Confirmed','Decline','Approved','Rejected','WithdrawAppliaction') NOT NULL DEFAULT 'Pending',
  `asset_qty` varchar(255) DEFAULT NULL,
  `contribution_by_volunteer` varchar(255) DEFAULT NULL,
  `accepted_by_school` varchar(255) DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `collection_status` int(1) NOT NULL DEFAULT '0',
  `collection_status_image` varchar(255) DEFAULT NULL,
  `meeting_date` datetime DEFAULT NULL,
  `meeting_start_date` datetime DEFAULT NULL,
  `meeting_end_date` datetime DEFAULT NULL,
  `meeting_start_time` time DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `interview_mode` enum('online','inperson') DEFAULT NULL,
  `decline_reason` varchar(255) DEFAULT NULL,
  `decline_reason_other` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `modified_at` datetime DEFAULT NULL,
  `modified_by` int(11) DEFAULT NULL,
  `last_collection_id` int(11) DEFAULT NULL,
  `withdrawal_reason` text,
  `meeting_time` varchar(255) DEFAULT NULL,
  `block_profile` tinyint(1) DEFAULT '0',
  `invited_disclaimer` tinyint(1) DEFAULT NULL,
  `completed_delivery_date` date DEFAULT NULL,
  `interview_procedure` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `activity_id` (`contribution_id`),
  KEY `volunteer_id` (`volunteer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
COMMIT;

/***************************************************************************************************************/

CREATE TABLE public.contribution_timelines (
    id bigserial NOT NULL,
    contribution_id bigserial NOT NULL,      
    contribution_image character varying(200) DEFAULT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,    
    modified_at timestamp default CURRENT_TIMESTAMP,
    created_by int DEFAULT NULL,
    CONSTRAINT contribution_timelines_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;
ALTER TABLE public.contribution_timelines OWNER to postgres;

/***************************************************************************************************************/

CREATE TABLE public.feedback_contacts (
	id bigserial NOT NULL,
	"name" varchar NOT NULL,
	mobile varchar NOT NULL,
	email varchar NOT NULL,
	message text NULL,
	feedback_type varchar NULL,
	subject varchar NULL,
	status smallint NULL,
	flag smallint NOT NULL,
	rating smallint NULL,
	created_at timestamp NULL
);

TABLESPACE pg_default;
ALTER TABLE public.feedback_contacts OWNER to postgres;

/***************************************************************************************************************/

CREATE TABLE public.request_onboard (
    id bigserial NOT NULL,
    school_id bigserial NOT NULL,
    voluntee_id bigserial NOT NULL 
)

TABLESPACE pg_default;

ALTER TABLE public.request_onboard OWNER to postgres;

/***************************************************************************************************************/

CREATE TABLE public.quantity_received_collections (
    id serial NOT NULL,
    contribution_id  bigserial NOT NULL,
    volunteer_id   bigserial NOT NULL,
    received_qty int DEFAULT NULL,
    received_date date DEFAULT NULL,
    delivery_status int DEFAULT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT quantity_received_collections_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE public.quantity_received_collections OWNER to postgres;


/************************************************************************************/

ALTER TABLE contribution_volunteers ADD COLUMN total_received_deliver_qty int DEFAULT 0

ALTER TABLE assets_timelines ADD COLUMN asset_flag int 


/**********************************************************************************/

CREATE TABLE public.volunteers_rating (
    id serial NOT NULL,
    contribution_id  int DEFAULT NULL,
    activity_id  int DEFAULT NULL,
    volunteer_id  int NOT NULL,
    school_id  int DEFAULT NULL,
    module varchar NULL,
    suggestion text,
    rate int DEFAULT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT volunteers_rating_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE public.volunteers_rating OWNER to postgres;


/**********************************************************************/

ALTER TABLE activity_volunteers ADD COLUMN rate int DEFAULT 0
ALTER TABLE activity_volunteers ADD COLUMN rate_by_school int DEFAULT 0
ALTER TABLE contribution_volunteers ADD COLUMN rate int DEFAULT 0
ALTER TABLE contribution_volunteers ADD COLUMN rate_by_school int DEFAULT 0

/**********************************************************************/

CREATE TABLE public.schools_rating (
    id serial NOT NULL,
    contribution_id  int DEFAULT NULL,
    activity_id  int  default NULL,
    volunteer_id  int NOT NULL,
    school_id  int DEFAULT NULL,
    module varchar NULL,
    suggestion text,
    rate int DEFAULT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT schools_rating_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE public.schools_rating OWNER to postgres;


/********************************************************************/
ALTER TABLE volunteers ADD COLUMN total_participation int DEFAULT 0
ALTER TABLE volunteers ADD COLUMN total_rating int DEFAULT 0
ALTER TABLE volunteers ADD COLUMN number_of_rating int DEFAULT 0

CREATE TABLE public.temp (
    id bigserial NOT NULL,
    participation_count int DEFAULT 0,
    voluntee_id int DEFAULT 0 
)

TABLESPACE pg_default;
ALTER TABLE public.temp OWNER to postgres;

/******************************************************************************/
CREATE TABLE public.master_badge (
    id serial NOT NULL,
    badge_name  varchar DEFAULT NULL,
    badge_level  varchar  default NULL,
    score  int default NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT master_badge_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;
ALTER TABLE public.master_badge OWNER to postgres;

/******************************************************************************/
CREATE TABLE public.volunteer_badge (
    id serial NOT NULL,
    volunteer_id  int DEFAULT NULL,
    badge_id  int  default NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT volunteer_badge_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;
ALTER TABLE public.volunteer_badge OWNER to postgres;

/******************************************************************************/
CREATE TABLE public.media_gallery (
    id serial NOT NULL,
    state_id int NOT NULL,
    category_id int DEFAULT NULL,
    title  varchar DEFAULT NULL,
    flag   varchar DEFAULT NULL,
    name   varchar DEFAULT NULL,
    content   text DEFAULT NULL,
    publish_date  timestamp without time zone DEFAULT NULL,
    status  int default NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT media_gallery_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;
ALTER TABLE public.media_gallery OWNER to postgres;

/******************************************************************************/


/******************************************************************************/
CREATE TABLE public.offline_contribution (
    id serial NOT NULL,
    school_id int NOT NULL,
    volunteer_type_id int NOT NULL,
    mobile varchar default NULL,
    email varchar default NULL,
    name  varchar default NULL,    
    state_id int DEFAULT NULL,
    district_id int DEFAULT NULL,
    country_code int DEFAULT NULL,
    categoery_id int DEFAULT NULL,
    sub_categoery_id int DEFAULT NULL,
    maintenance_required  int DEFAULT NULL,
    quantity int DEFAULT NULL,    
    darapan_id varchar DEFAULT NULL,    
    pancard_number varchar DEFAULT NULL,    
    date_of_receiving  timestamp without time zone DEFAULT NULL, 
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT offline_contribution_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;
ALTER TABLE public.offline_contribution OWNER to postgres;

/******************************************************************************/

CREATE TABLE public.offline_contribution_image (
    id bigserial NOT NULL,
    contribution_id bigserial NOT NULL,      
    contribution_image character varying(200) DEFAULT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT offline_contribution_image_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;
ALTER TABLE public.offline_contribution_image OWNER to postgres;

/***************************************************************************************************************/