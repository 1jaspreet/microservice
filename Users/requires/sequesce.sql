
/*For creating sequnces on existing table */

Drop SEQUENCE if exists volunteers_id_seq CASCADE;
CREATE SEQUENCE volunteers_id_seq owned by volunteers.id;
Alter table volunteers alter column id set default nextval('volunteers_id_seq');
Select setval('volunteers_id_seq',(SELECT (MAX(ID)+1) FROM volunteers));

Drop SEQUENCE if exists school_activities_posts_id_seq CASCADE;
CREATE SEQUENCE school_activities_posts_id_seq owned by school_activities_posts.id;
Alter table school_activities_posts alter column id set default nextval('school_activities_posts_id_seq');
Select setval('school_activities_posts_id_seq',(SELECT (MAX(ID)+1) FROM school_activities_posts));


Drop SEQUENCE if exists school_assets_posts_id_seq CASCADE;
CREATE SEQUENCE school_assets_posts_id_seq owned by school_assets_posts.id;
Alter table school_assets_posts alter column id set default nextval('school_assets_posts_id_seq');
Select setval('school_assets_posts_id_seq',(SELECT (MAX(ID)+1) FROM school_assets_posts));


Drop SEQUENCE if exists activity_volunteers_id_seq CASCADE;
CREATE SEQUENCE activity_volunteers_id_seq owned by activity_volunteers.id;
Alter table activity_volunteers alter column id set default nextval('activity_volunteers_id_seq');
Select setval('activity_volunteers_id_seq',(SELECT (MAX(ID)+1) FROM activity_volunteers));

Drop SEQUENCE if exists contribution_volunteers_id_seq CASCADE;
CREATE SEQUENCE contribution_volunteers_id_seq owned by contribution_volunteers.id;
Alter table contribution_volunteers alter column id set default nextval('contribution_volunteers_id_seq');
Select setval('contribution_volunteers_id_seq',(SELECT (MAX(ID)+1) FROM contribution_volunteers));


Drop SEQUENCE if exists admin_users_id_seq CASCADE;
CREATE SEQUENCE admin_users_id_seq owned by admin_users.id;
Alter table admin_users alter column id set default nextval('admin_users_id_seq');
Select setval('admin_users_id_seq',(SELECT (MAX(ID)+1) FROM admin_users));

Drop SEQUENCE if exists activity_timelines_id_seq CASCADE;
CREATE SEQUENCE activity_timelines_id_seq owned by activity_timelines.id;
Alter table activity_timelines alter column id set default nextval('activity_timelines_id_seq');
Select setval('activity_timelines_id_seq',(SELECT (MAX(ID)+1) FROM activity_timelines));