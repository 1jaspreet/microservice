  Drop VIEW view_school_activities;
  CREATE OR REPLACE VIEW public.view_school_activities
    AS select
      ac.id,
      ac.school_id,
      ac.activity_state_id,
      ac.activity_district_id,
      ac.gender_id,
      ac.specialization_id,
      ms.specialization_name,
      ac.activity_category_id,
      ac.activity_sub_category_id,
      ac.activity_tentative_start_date,
      ac.activity_last_reciving_date,
      ac.activity_closed,
      ac.application_status,
      s.school_postal_address,
      mg.gender_name,
      s.udise_code,
      s.school_name,
      sm.state_name,
      md.district_name,
      mac.activity_category_name,
      masc.activity_sub_category_name,
      ( select count(av.id) as cnt from activity_volunteers as av where av.school_activity_post_id = ac.id and av.volunteer_status != 'WithdrawAppliaction') as 
        volunteer_count
      from school_activities_posts ac
      join master_schools s on s.id = ac.school_id
      join master_states sm on sm.id = ac.activity_state_id
      join master_districts md on md.id = ac.activity_district_id
      join master_activity_categories mac on mac.id = ac.activity_category_id
      join master_activity_sub_categories masc on masc.id= ac.activity_sub_category_id
      join master_specializations ms on ms.id= ac.specialization_id
      join master_genders mg on mg.id= ac.gender_id
      /*where activity_last_reciving_date >= CURRENT_DATE */
    /*---------------------------------------------------------------------------------------------------------*/
Drop VIEW view_school_assets_material;
  CREATE OR REPLACE VIEW public.view_school_assets_material
  AS select
    sap.id,
    sap.school_id,
    sap.asset_quantity,
    sap.asset_state_id,
    sap.asset_district_id,
    sap.asset_expected_date,
    sap.asset_last_application_date,
	  sap.asset_category_id,
	  sap.asset_sub_category_id,
    sap.asset_closed,
    sap.application_status,
    sap.asset_details,
    s.school_postal_address,
    s.udise_code,
    s.school_name,
	  sm.state_name,
	  md.district_name,
    mac.asset_category_name,
    masc.asset_sub_category_name,
    ( select count(cv.id) as cnt from contribution_volunteers as cv where cv.school_assets_post_id = sap.id and cv.volunteer_status != 'WithdrawAppliaction') as volunteer_count
    from school_assets_posts sap
     join master_schools s on s.id = sap.school_id
    join master_states sm on sm.id = sap.asset_state_id
    join master_districts md on md.id = sap.asset_district_id
	
    join master_asset_categories mac on mac.id = sap.asset_category_id
    join master_asset_sub_categories masc on masc.id= sap.asset_sub_category_id
   /* where asset_last_application_date >= CURRENT_DATE */


  /*---------------------------------------------------------------------------------------------------------*/
Drop VIEW view_volunteer_activities;
CREATE OR REPLACE VIEW public.view_volunteer_activities
  AS select
    av.id as id,
    ac.id as activity_id,
    av.volunteer_id as volunteer_id,
    ( select activity_sub_category_name from master_activity_sub_categories as masc where masc.id = ac.activity_sub_category_id) as activity_name,
    ac.activity_last_reciving_date,
    ac.activity_tentative_start_date,
    av.volunteer_status,
    ms.id as school_id,    
    ms.school_name,    
    ms.school_email,
    ms.school_mobile,
    ms.school_postal_code,
    ms.school_address,
    av.created_at as application_date,
    av.completion_status as completion_status,  
    ( select ms.state_name from master_states as ms where ms.id = ac.activity_state_id) as state_name,
    ( select district_name from master_districts as msd where msd.id = ac.activity_district_id) as district_name
    from school_activities_posts ac
    join master_schools ms on ms.id = ac.school_id  
    join activity_volunteers av on av.school_activity_post_id = ac.id   
    join master_activity_categories mac on mac.id = ac.activity_category_id
    where ac.activity_publish=1
    

    /*---------------------------------------------------------------------------------------------------------*/

/*---------------------------------------------------------------------------------------------------------*/

Drop VIEW view_volunteer_assets_material;
CREATE OR REPLACE VIEW public.view_volunteer_assets_material
AS SELECT cv.id,
    cv.school_assets_post_id,
    cv.volunteer_id,
    vs.volunteer_name,
    vs.total_participation,
    vs.total_rating,
    vs.total_number_of_rating,
    vs.badge_id,
    mac.asset_category_name,
    ( SELECT masc.asset_sub_category_name
           FROM master_asset_sub_categories masc
          WHERE masc.id = sap.asset_sub_category_id) AS material_name,
    sap.asset_expected_date,
    sap.asset_quantity,
    cv.contribution_by_volunteer,
    cv.volunteer_status,
    cv.last_collection_id,
    ms.school_name,
    ms.school_email,
    ms.school_mobile,
    ms.school_postal_code,
    ms.school_address,
    ( SELECT ms_1.state_name
           FROM master_states ms_1
          WHERE ms_1.id = sap.asset_state_id) AS state_name,
    ( SELECT msd.district_name
           FROM master_districts msd
          WHERE msd.id = sap.asset_district_id) AS district_name
   FROM contribution_volunteers cv
     JOIN school_assets_posts sap ON sap.id = cv.school_assets_post_id
     JOIN master_schools ms ON ms.id = sap.school_id
     JOIN volunteers vs ON vs.id = cv.volunteer_id
     JOIN master_asset_categories mac ON mac.id = sap.asset_category_id;
     
   
  
    

    /*---------------------------------------------------------------------------------------------------------*/


 $join = [];
		$join =  ['SchoolContributions' => [
						'table'      => 'school_contributions',
						'alias'      => 'SchoolContributions',
						'type'       => 'LEFT',
						'conditions' => [
							'SchoolContributions.id = ContributionVolunteers.contribution_id',
						],
				 ],
				 'Schools' => [
						'table'      => 'schools',
						'alias'      => 'Schools',
						'type'       => 'LEFT',
						'conditions' => [
							'Schools.id = SchoolContributions.school_id',
						],
				 ],
				 'SchoolsRating' => [
						'table'      => 'schools_rating',
						'alias'      => 'SchoolsRating',
						'type'       => 'LEFT',
						'conditions' => [
							'SchoolsRating.contribution_id = ContributionVolunteers.contribution_id',
							//'VolunteersRating.volunteer_id =ContributionVolunteers.volunteer_id',
							//'VolunteersRating.module = "contribution"',
						], 
				 ],
            ];	   
		
	   	
	   $query = $this->ContributionVolunteers->find('all')
				->select([
						'id' => 'ContributionVolunteers.id',
						'contribution_id' => 'ContributionVolunteers.contribution_id',
						'MaterialName' => '(select name from type_master where type_master.id = SchoolContributions.type_master_id)',
						'expected_date'=>'SchoolContributions.expected_date',
						'contribution_by_volunteer',
						'ContributionVolunteers.status',
						'ContributionVolunteers.last_collection_id',
						'SchoolName'=>'Schools.name',
						'SchoolID'=>'Schools.id',
						'RatingId' =>'SchoolsRating.id',
					    'Rate'  =>'SchoolsRating.rate',
					    'RatingSuggestion'=>'SchoolsRating.suggestion',
					    'last_collection_id' => 'ContributionVolunteers.last_collection_id'
				])
				 ->join($join) 
				 ->where([$conditions])
				 ->group(['ContributionVolunteers.id'])
				 ->order(['ContributionVolunteers.id' => 'DESC']);





            'id' => 'ActivityVolunteers.id',
						'ActivityId' => 'Activities.id',
						'ActivityName' => '(select name from type_master where type_master.id = Activities.name)',
						'Activities.last_application_date',
						'Activities.tentative_start_date',
						'Activities.status',
						'schoolId'=>'Schools.id',
						'SchoolName'=>'Schools.name',
						'SchoolEmail'=>'SUser.email_id',
						'SchoolMobile'=>'SUser.mobile_no',
						'SchoolPinCode'=>'Schools.postal_code',
						'PostalAddress'=> 'Schools.postal_address',
						'ActivityStatus'=>'ActivityVolunteers.status',
						'applicationDate' => 'ActivityVolunteers.created_at',
						'completion_status'=>'ActivityVolunteers.completion_status',
						'RatingId' =>'SchoolsRating.id',
					  'Rate' =>'SchoolsRating.rate',
					  'RatingSuggestion'=>'SchoolsRating.suggestion',
						'StateName' => '(select name from states where states.id = SUser.state_id)',
						'DistrictsName' => '(select district_name from districts where districts.id = SUser.district_id)',


            $join = [
			     'ActivityVolunteers' => [
						'table'      => 'activity_volunteers',
						'alias'      => 'ActivityVolunteers',
						'type'       => 'INNER',
						'conditions' => [
							'ActivityVolunteers.activity_id = Activities.id',
						],
					],
					'SUser' => [
						   'table'      => 'users',
						   'alias'      => 'SUser',
						   'type'       => 'LEFT',
						   'conditions' => [
							   'SUser.school_id = Activities.school_id',
						   ],
					],
					'Schools' => [
						'table'      => 'schools',
						'alias'      => 'Schools',
						'type'       => 'INNER',
						'conditions' => [
							'Schools.id = Activities.school_id',
						],
				 ],  
				 'SchoolsRating' => [
						'table'      => 'schools_rating',
						'alias'      => 'SchoolsRating',
						'type'       => 'LEFT',
						'conditions' => [
							'SchoolsRating.activity_id = ActivityVolunteers.activity_id',
							'SchoolsRating.school_id = Schools.id',
							'SchoolsRating.volunteer_id = ActivityVolunteers.volunteer_id',
						], 
				 ], 
			];



/*****************************************************************MATERIALIZED VIEW********************************************************************/

CREATE MATERIALIZED VIEW public.view_school_activities_mts
AS SELECT ac.id,
    ac.school_id,
    ac.activity_state_id,
    ac.activity_district_id,
    ac.gender_id,
    ac.activity_category_id,
    ac.activity_sub_category_id,
    ac.activity_tentative_start_date,
    ac.activity_last_reciving_date,   
    s.school_postal_address,
    mg.gender_name,
    s.udise_code,
    s.school_name,
    sm.state_name,
    md.district_name,
    mac.activity_category_name,
    masc.activity_sub_category_name,
    ( SELECT count(av.id) AS cnt FROM activity_volunteers av WHERE av.activity_id = ac.id AND av.status::text <> 'WithdrawAppliaction'::text) AS volunteer_count
   FROM activities ac
     JOIN master_schools s ON s.id = ac.school_id
     JOIN master_states sm ON sm.id = ac.activity_state_id
     JOIN master_districts md ON md.id = ac.activity_district_id
     JOIN master_activity_categories mac ON mac.id = ac.activity_category_id
     JOIN master_activity_sub_categories masc ON masc.id = ac.activity_sub_category_id
     JOIN master_specializations ms ON ms.id = ac.specialization_id
     JOIN master_genders mg ON mg.id = ac.gender_id;

/*****************************************************************MATERIALIZED VIEW********************************************************************/