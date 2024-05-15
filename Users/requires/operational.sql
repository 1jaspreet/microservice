
/* update master_schools set school_onboard = 1 from request_onboard  ro where master_schools.id = ro.school_id*/

SELECT * FROM users WHERE role_id !=3 AND CHAR_LENGTH(mobile_no) > 10 ORDER BY id DESC ;

/*SELECT REPLACE(LTRIM(REPLACE(mobile_no,'+1 0',' ')),'','+1 0') FROM users*/


Update users set country_code_id = NULL WHERE role_id !=3 AND CHAR_LENGTH(country_code_id) = 0 

UPDATE users SET qualification = '0' WHERE qualification IS NULL;
UPDATE users SET qualification = '0' WHERE qualification='';

UPDATE users SET aadhaar_desc= REPLACE(aadhaar_desc,' ','');
UPDATE users SET driving_license_desc= REPLACE(driving_license_desc,' ','');
UPDATE users SET organization_cin= REPLACE(organization_cin,' ','');
UPDATE users SET darapan_id= REPLACE(darapan_id,' ','');
UPDATE users SET ngo_pan= REPLACE(ngo_pan,' ','');
UPDATE users SET organization_pan= REPLACE(organization_pan,' ','');
UPDATE users SET pancard_desc= REPLACE(pancard_desc,' ','');
UPDATE users SET mobile_no= REPLACE(mobile_no,' ','');

UPDATE users SET mobile_no= REPLACE(LTRIM(REPLACE(mobile_no,'0',' ')),'','0')  WHERE  CHAR_LENGTH(mobile_no) > 10;
UPDATE users SET mobile_no= REPLACE(LTRIM(REPLACE(mobile_no,'+91',' ')),'','+91')  WHERE  CHAR_LENGTH(mobile_no) > 10;
UPDATE users SET mobile_no= REPLACE(LTRIM(REPLACE(mobile_no,'+10',' ')),'','+10')  WHERE  CHAR_LENGTH(mobile_no) > 10;
UPDATE `users`  SET volunteer_type = 0 where volunteer_type is NULL;

UPDATE `users`  SET country_code_id = 91 where country_code_id is NULL and role_id != 3;
UPDATE `users`  SET country_code_id = 91 where country_code_id ='' and role_id != 3;

UPDATE activities SET activity_class = REPLACE(activity_class ,'Any,','');
UPDATE activities SET duration = REPLACE(duration ,' ',0);
UPDATE activities SET student_count =0 WHERE student_count IS NULL;
UPDATE activities SET admin_status =0 WHERE admin_status IS NULL; 
UPDATE activities SET specialization_id =0 WHERE specialization_id IS NULL; 
UPDATE activities SET activity_class =0 WHERE activity_class IS NULL; 
UPDATE activities SET activity_state_id =0 WHERE state_id IS NULL; 
UPDATE activities SET activity_district_id =0 WHERE district_id IS NULL; 


UPDATE school_contributions SET type_master_id =0 WHERE type_master_id IS NULL; 
UPDATE school_contributions SET sub_category =0 WHERE sub_category IS NULL; 
UPDATE school_contributions SET contribution_state_id =0 WHERE contribution_state_id IS NULL; 
UPDATE school_contributions SET contribution_district_id =0 WHERE contribution_district_id IS NULL; 
UPDATE school_contributions SET reason_closer =0 WHERE reason_closer IS NULL; 
UPDATE school_contributions SET student_count =0 WHERE student_count IS NULL; 

