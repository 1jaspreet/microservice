CREATE INDEX users_role_id_idx ON public.users (role_id);
CREATE INDEX users_name_idx ON public.users (name);
CREATE INDEX users_designation_id_idx ON public.users (designation_id);
CREATE INDEX users_mobile_idx ON public.users (mobile);
CREATE INDEX users_email_idx ON public.users (email);
CREATE INDEX users_is_active_idx ON public.users (is_active);
CREATE INDEX users_state_id_idx ON public.users (state_id);
CREATE INDEX users_district_id_idx ON public.users (district_id);
CREATE INDEX users_permision_idx ON public.users (permision);

CREATE INDEX master_blocks_name_idx ON public.master_blocks ("name");
CREATE INDEX master_blocks_block_id_idx ON public.master_blocks (block_id);
CREATE INDEX master_blocks_state_id_idx ON public.master_blocks (state_id);
CREATE INDEX master_blocks_district_id_idx ON public.master_blocks (district_id);
CREATE INDEX master_blocks_location_id_idx ON public.master_blocks (location_id);

CREATE INDEX master_categories_name_idx ON public.master_categories ("name");
CREATE INDEX master_categories_order_by_idx ON public.master_categories (order_by);

CREATE INDEX master_designations_name_idx ON public.master_designations ("name");

CREATE INDEX master_districts_state_id_idx ON public.master_districts (state_id);
CREATE INDEX master_districts_name_idx ON public.master_districts ("name");
CREATE INDEX master_districts_lgd_district_id_idx ON public.master_districts (lgd_district_id);
CREATE INDEX master_districts_lgd_state_id_idx ON public.master_districts (lgd_state_id);
CREATE INDEX master_districts_is_active_idx ON public.master_districts (is_active);

CREATE INDEX master_questions_question_idx ON public.master_questions (question);

CREATE INDEX master_regions_school_type_idx ON public.master_regions (school_type);
CREATE INDEX master_regions_name_idx ON public.master_regions ("name");

CREATE INDEX master_roles_name_idx ON public.master_roles ("name");
CREATE INDEX master_roles_status_idx ON public.master_roles (status);

CREATE INDEX master_scheme_category_question_marks_schemes_id_idx ON public.master_scheme_category_question_marks (schemes_id);
CREATE INDEX master_scheme_category_question_marks_categories_id_idx ON public.master_scheme_category_question_marks (categories_id);
CREATE INDEX master_scheme_category_question_marks_questions_idx ON public.master_scheme_category_question_marks (questions);
CREATE INDEX master_scheme_category_question_marks_marks_idx ON public.master_scheme_category_question_marks (marks);

CREATE INDEX master_scheme_questions_schemes_id_idx ON public.master_scheme_questions (schemes_id);
CREATE INDEX master_scheme_questions_name_idx ON public.master_scheme_questions ("name");
CREATE INDEX master_scheme_questions_status_idx ON public.master_scheme_questions (status);
CREATE INDEX master_scheme_questions_order_idx ON public.master_scheme_questions ("order");

CREATE INDEX master_schemes_name_idx ON public.master_schemes ("name");
CREATE INDEX master_schemes_order_idx ON public.master_schemes ("order");
CREATE INDEX master_schemes_question_count_idx ON public.master_schemes (question_count);
CREATE INDEX master_schemes_score_idx ON public.master_schemes (score);

CREATE INDEX master_school_designations_name_idx ON public.master_school_designations ("name");
CREATE INDEX master_school_designations_status_idx ON public.master_school_designations (status);

CREATE INDEX master_states_name_idx ON public.master_states ("name");
CREATE INDEX master_states_is_active_idx ON public.master_states (is_active);
CREATE INDEX master_states_user_id_idx ON public.master_states (user_id);

CREATE INDEX master_protocols_name_idx ON public.master_protocols ("name");

CREATE INDEX scheme_question_markings_schemes_id_idx ON public.scheme_question_markings (schemes_id);
CREATE INDEX scheme_question_markings_scheme_questions_id_idx ON public.scheme_question_markings (scheme_questions_id);

CREATE INDEX school_benchmarks_udise_code_idx ON public.school_benchmarks (udise_code);
CREATE INDEX school_benchmarks_school_name_idx ON public.school_benchmarks (school_name);
CREATE INDEX school_benchmarks_state_id_idx ON public.school_benchmarks (state_id);
CREATE INDEX school_benchmarks_district_id_idx ON public.school_benchmarks (district_id);
CREATE INDEX school_benchmarks_category_id_idx ON public.school_benchmarks (category_id);
CREATE INDEX school_benchmarks_sch_mgmt_center_id_idx ON public.school_benchmarks (sch_mgmt_center_id);
CREATE INDEX school_benchmarks_location_type_idx ON public.school_benchmarks (location_type);
CREATE INDEX school_benchmarks_block_id_idx ON public.school_benchmarks (block_id);
CREATE INDEX school_benchmarks_email_idx ON public.school_benchmarks (email);
CREATE INDEX school_benchmarks_mobile_idx ON public.school_benchmarks (mobile);

CREATE INDEX master_school_udise_code_idx ON public.master_school (udise_code);
CREATE INDEX master_school_school_name_idx ON public.master_school (school_name);
CREATE INDEX master_school_sch_mgmt_center_id_idx ON public.master_school (sch_mgmt_center_id);
CREATE INDEX master_school_category_id_idx ON public.master_school (category_id);
CREATE INDEX master_school_state_id_idx ON public.master_school (state_id);
CREATE INDEX master_school_district_id_idx ON public.master_school (district_id);
CREATE INDEX master_school_location_type_idx ON public.master_school (location_type);
CREATE INDEX master_school_cat_order_idx ON public.master_school (cat_order);

CREATE INDEX school_question_marking_final_sections_schools_id_idx ON public.school_question_marking_final_sections (schools_id);
CREATE INDEX school_question_marking_final_sections_school_udise_code_idx ON public.school_question_marking_final_sections (school_udise_code);
CREATE INDEX school_question_marking_final_sections_district_id_idx ON public.school_question_marking_final_sections (district_id);
CREATE INDEX school_question_marking_final_sections_state_id_idx ON public.school_question_marking_final_sections (state_id);

CREATE INDEX school_school_section_wises_schools_id_idx ON public.school_school_section_wises (schools_id);
CREATE INDEX school_school_section_wises_schemes_id_idx ON public.school_school_section_wises (schemes_id);
CREATE INDEX school_school_section_wises_district_id_idx ON public.school_school_section_wises (district_id);
CREATE INDEX school_school_section_wises_state_id_idx ON public.school_school_section_wises (state_id);

CREATE INDEX school_question_markings_schools_id_idx ON public.school_question_markings (schools_id);
CREATE INDEX school_question_markings_schemes_id_idx ON public.school_question_markings (schemes_id);
CREATE INDEX school_question_markings_questions_id_idx ON public.school_question_markings (questions_id);
CREATE INDEX school_question_markings_district_id_idx ON public.school_question_markings (district_id);
CREATE INDEX school_question_markings_district_protocol_id_idx ON public.school_question_markings (district_protocol_id);
CREATE INDEX school_question_markings_state_id_idx ON public.school_question_markings (state_id);
CREATE INDEX school_question_markings_state_protocol_id_idx ON public.school_question_markings (state_protocol_id);
CREATE INDEX school_question_markings_national_id_idx ON public.school_question_markings (national_id);
CREATE INDEX school_question_markings_national_protocol_id_idx ON public.school_question_markings (national_protocol_id);

CREATE INDEX school_region_wise_statics_region_id_idx ON public.school_region_wise_statics (region_id);
CREATE INDEX school_region_wise_statics_region_parent_id_idx ON public.school_region_wise_statics (region_parent_id);
CREATE INDEX school_region_wise_statics_region_name_idx ON public.school_region_wise_statics (region_name);
CREATE INDEX school_region_wise_statics_broad_category_idx ON public.school_region_wise_statics (broad_category);
CREATE INDEX school_region_wise_statics_cat_order_idx ON public.school_region_wise_statics (cat_order);
CREATE INDEX school_region_wise_statics_sch_excluded_idx ON public.school_region_wise_statics (sch_excluded);
CREATE INDEX school_region_wise_statics_sch_benchmark_idx ON public.school_region_wise_statics (sch_benchmark);

CREATE INDEX school_region_wises_region_id_idx ON public.school_region_wises (region_id);
CREATE INDEX school_region_wises_region_type_idx ON public.school_region_wises (region_type);

CREATE INDEX school_selection_user_comments_school_udise_code_idx ON public.school_selection_user_comments (school_udise_code);
CREATE INDEX school_selection_user_comments_district_user_id_idx ON public.school_selection_user_comments (district_user_id);
CREATE INDEX school_selection_user_comments_state_user_id_idx ON public.school_selection_user_comments (state_user_id);
CREATE INDEX school_selection_user_comments_national_user_id_idx ON public.school_selection_user_comments (national_user_id);