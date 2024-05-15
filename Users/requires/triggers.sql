
/*Trigger for users table*/
DROP TRIGGER IF EXISTS trigger_users ON users;
CREATE OR REPLACE FUNCTION function_users() RETURNS TRIGGER LANGUAGE PLPGSQL AS
$$
	BEGIN
		IF(TG_OP = 'INSERT') THEN
			INSERT INTO activity_logs(user_id,tbl_id,tbl_name,attr_name,on_create,action,created_at) VALUES(New.created_by,NEW.id,TG_TABLE_NAME,'new',NEW,'C',now());
		ELSEIF(TG_OP = 'UPDATE') THEN
			IF(OLD.name != NEW.name) THEN
				INSERT INTO activity_logs(user_id,tbl_id,tbl_name,attr_name,on_create,on_update,action,created_at) VALUES(New.updated_by,OLD.id,TG_TABLE_NAME,'name',OLD.name,NEW.name,'U',now());
			END IF;
			IF(OLD.role != NEW.role) THEN
				INSERT INTO activity_logs(user_id,tbl_id,tbl_name,attr_name,on_create,on_update,action,created_at) VALUES(New.updated_by,OLD.id,TG_TABLE_NAME,'role',OLD.name,NEW.name,'U',now());
			END IF;
			IF(OLD.email != NEW.email) THEN
				INSERT INTO activity_logs(user_id,tbl_id,tbl_name,attr_name,on_create,on_update,action,created_at) VALUES(New.updated_by,OLD.id,TG_TABLE_NAME,'email',OLD.email,NEW.email,'U',now());
			END IF;
			IF(OLD.profile_pic != NEW.profile_pic) THEN
				INSERT INTO activity_logs(user_id,tbl_id,tbl_name,attr_name,on_create,on_update,action,created_at) VALUES(New.updated_by,OLD.id,TG_TABLE_NAME,'profile_pic',OLD.profile_pic,NEW.profile_pic,'U',now());
			END IF;
			IF(OLD.password != NEW.password) THEN
				INSERT INTO activity_logs(user_id,tbl_id,tbl_name,attr_name,on_create,on_update,action,created_at) VALUES(New.updated_by,OLD.id,TG_TABLE_NAME,'password',OLD.password,NEW.password,'U',now());
			END IF;
			IF(OLD.status != NEW.status) THEN
				INSERT INTO activity_logs(user_id,tbl_id,tbl_name,attr_name,on_create,on_update,action,created_at) VALUES(New.updated_by,OLD.id,TG_TABLE_NAME,'status',OLD.status,NEW.status,'U',now());
			END IF;
		ELSEIF(TG_OP = 'DELETE') THEN
			INSERT INTO activity_logs(user_id,tbl_id,tbl_name,attr_name,on_update,action,created_at) VALUES(Old.updated_by,Old.id,TG_TABLE_NAME,'data',OLD,'D',now());
		END IF;
		RETURN NULL;
	END;
$$;
CREATE TRIGGER trigger_users AFTER INSERT OR UPDATE OR DELETE ON users FOR EACH ROW EXECUTE PROCEDURE function_users();

/*Trigger for master_states table*/
DROP TRIGGER IF EXISTS trigger_master_states ON master_states;
CREATE OR REPLACE FUNCTION function_master_states() RETURNS TRIGGER LANGUAGE PLPGSQL AS
$$
	BEGIN
		IF(TG_OP = 'INSERT') THEN
			INSERT INTO activity_logs(user_id,tbl_id,tbl_name,attr_name,on_create,action,created_at) VALUES(New.created_by,NEW.id,TG_TABLE_NAME,'new',NEW,'C',now());
		ELSEIF(TG_OP = 'UPDATE') THEN
			IF(OLD.name != NEW.name) THEN
				INSERT INTO activity_logs(user_id,tbl_id,tbl_name,attr_name,on_create,on_update,action,created_at) VALUES(New.updated_by,OLD.id,TG_TABLE_NAME,'name',OLD.name,NEW.name,'U',now());
			END IF;
			IF(OLD.major_head_id != NEW.major_head_id) THEN
				INSERT INTO activity_logs(user_id,tbl_id,tbl_name,attr_name,on_create,on_update,action,created_at) VALUES(New.updated_by,OLD.id,TG_TABLE_NAME,'major_head_id',OLD.major_head_id,NEW.major_head_id,'U',now());
			END IF;
			IF(OLD.status != NEW.status) THEN
				INSERT INTO activity_logs(user_id,tbl_id,tbl_name,attr_name,on_create,on_update,action,created_at) VALUES(New.updated_by,OLD.id,TG_TABLE_NAME,'status',OLD.status,NEW.status,'U',now());
			END IF;
		ELSEIF(TG_OP = 'DELETE') THEN
			INSERT INTO activity_logs(user_id,tbl_id,tbl_name,attr_name,on_update,action,created_at) VALUES(Old.updated_by,Old.id,TG_TABLE_NAME,'data',OLD,'D',now());
		END IF;
		RETURN NULL;
	END;
$$;
CREATE TRIGGER trigger_master_states AFTER INSERT OR UPDATE OR DELETE ON master_states FOR EACH ROW EXECUTE PROCEDURE function_master_states();

/*Trigger for master_units table*/
DROP TRIGGER IF EXISTS trigger_master_units ON master_units;
CREATE OR REPLACE FUNCTION function_master_units() RETURNS TRIGGER LANGUAGE PLPGSQL AS
$$
	BEGIN
		IF(TG_OP = 'INSERT') THEN
			INSERT INTO activity_logs(user_id,tbl_id,tbl_name,attr_name,on_create,action,created_at) VALUES(New.created_by,NEW.id,TG_TABLE_NAME,'new',NEW,'C',now());
		ELSEIF(TG_OP = 'UPDATE') THEN
			IF(OLD.name != NEW.name) THEN
				INSERT INTO activity_logs(user_id,tbl_id,tbl_name,attr_name,on_create,on_update,action,created_at) VALUES(New.updated_by,OLD.id,TG_TABLE_NAME,'name',OLD.name,NEW.name,'U',now());
			END IF;
			IF(OLD.status != NEW.status) THEN
				INSERT INTO activity_logs(user_id,tbl_id,tbl_name,attr_name,on_create,on_update,action,created_at) VALUES(New.updated_by,OLD.id,TG_TABLE_NAME,'status',OLD.status,NEW.status,'U',now());
			END IF;
		ELSEIF(TG_OP = 'DELETE') THEN
			INSERT INTO activity_logs(user_id,tbl_id,tbl_name,attr_name,on_update,action,created_at) VALUES(Old.updated_by,Old.id,TG_TABLE_NAME,'data',OLD,'D',now());
		END IF;
		RETURN NULL;
	END;
$$;
CREATE TRIGGER trigger_master_units AFTER INSERT OR UPDATE OR DELETE ON master_units FOR EACH ROW EXECUTE PROCEDURE function_master_units();

/*Trigger for master_generals table*/
DROP TRIGGER IF EXISTS trigger_master_generals ON master_generals;
CREATE OR REPLACE FUNCTION function_master_generals() RETURNS TRIGGER LANGUAGE PLPGSQL AS
$$
	BEGIN
		IF(TG_OP = 'INSERT') THEN
			INSERT INTO activity_logs(user_id,tbl_id,tbl_name,attr_name,on_create,action,created_at) VALUES(New.created_by,NEW.id,TG_TABLE_NAME,'new',NEW,'C',now());
		ELSEIF(TG_OP = 'UPDATE') THEN
			IF(OLD.name != NEW.name) THEN
				INSERT INTO activity_logs(user_id,tbl_id,tbl_name,attr_name,on_create,on_update,action,created_at) VALUES(New.updated_by,OLD.id,TG_TABLE_NAME,'name',OLD.name,NEW.name,'U',now());
			END IF;
			IF(OLD.status != NEW.status) THEN
				INSERT INTO activity_logs(user_id,tbl_id,tbl_name,attr_name,on_create,on_update,action,created_at) VALUES(New.updated_by,OLD.id,TG_TABLE_NAME,'status',OLD.status,NEW.status,'U',now());
			END IF;
		ELSEIF(TG_OP = 'DELETE') THEN
			INSERT INTO activity_logs(user_id,tbl_id,tbl_name,attr_name,on_update,action,created_at) VALUES(Old.updated_by,Old.id,TG_TABLE_NAME,'data',OLD,'D',now());
		END IF;
		RETURN NULL;
	END;
$$;
CREATE TRIGGER trigger_master_generals AFTER INSERT OR UPDATE OR DELETE ON master_generals FOR EACH ROW EXECUTE PROCEDURE function_master_generals();

/*Trigger for master_heads table*/
DROP TRIGGER IF EXISTS trigger_master_heads ON master_heads;
CREATE OR REPLACE FUNCTION function_master_heads() RETURNS TRIGGER LANGUAGE PLPGSQL AS
$$
	BEGIN
		IF(TG_OP = 'INSERT') THEN
			INSERT INTO activity_logs(user_id,tbl_id,tbl_name,attr_name,on_create,action,created_at) VALUES(New.created_by,NEW.id,TG_TABLE_NAME,'new',NEW,'C',now());
		ELSEIF(TG_OP = 'UPDATE') THEN
			IF(OLD.name != NEW.name) THEN
				INSERT INTO activity_logs(user_id,tbl_id,tbl_name,attr_name,on_create,on_update,action,created_at) VALUES(New.updated_by,OLD.id,TG_TABLE_NAME,'name',OLD.name,NEW.name,'U',now());
			END IF;
			IF(OLD.scheme_id != NEW.scheme_id) THEN
				INSERT INTO activity_logs(user_id,tbl_id,tbl_name,attr_name,on_create,on_update,action,created_at) VALUES(New.updated_by,OLD.id,TG_TABLE_NAME,'scheme_id',OLD.scheme_id,NEW.scheme_id,'U',now());
			END IF;
			IF(OLD.status != NEW.status) THEN
				INSERT INTO activity_logs(user_id,tbl_id,tbl_name,attr_name,on_create,on_update,action,created_at) VALUES(New.updated_by,OLD.id,TG_TABLE_NAME,'status',OLD.status,NEW.status,'U',now());
			END IF;
		ELSEIF(TG_OP = 'DELETE') THEN
			INSERT INTO activity_logs(user_id,tbl_id,tbl_name,attr_name,on_update,action,created_at) VALUES(Old.updated_by,Old.id,TG_TABLE_NAME,'data',OLD,'D',now());
		END IF;
		RETURN NULL;
	END;
$$;
CREATE TRIGGER trigger_master_heads AFTER INSERT OR UPDATE OR DELETE ON master_heads FOR EACH ROW EXECUTE PROCEDURE function_master_heads();

/*Trigger for master_major_heads table*/
DROP TRIGGER IF EXISTS trigger_master_major_heads ON master_major_heads;
CREATE OR REPLACE FUNCTION function_master_major_heads() RETURNS TRIGGER LANGUAGE PLPGSQL AS
$$
	BEGIN
		IF(TG_OP = 'INSERT') THEN
			INSERT INTO activity_logs(user_id,tbl_id,tbl_name,attr_name,on_create,action,created_at) VALUES(New.created_by,NEW.id,TG_TABLE_NAME,'new',NEW,'C',now());
		ELSEIF(TG_OP = 'UPDATE') THEN
			IF(OLD.name != NEW.name) THEN
				INSERT INTO activity_logs(user_id,tbl_id,tbl_name,attr_name,on_create,on_update,action,created_at) VALUES(New.updated_by,OLD.id,TG_TABLE_NAME,'name',OLD.name,NEW.name,'U',now());
			END IF;
			IF(OLD.head != NEW.head) THEN
				INSERT INTO activity_logs(user_id,tbl_id,tbl_name,attr_name,on_create,on_update,action,created_at) VALUES(New.updated_by,OLD.id,TG_TABLE_NAME,'head',OLD.head,NEW.head,'U',now());
			END IF;
			IF(OLD.status != NEW.status) THEN
				INSERT INTO activity_logs(user_id,tbl_id,tbl_name,attr_name,on_create,on_update,action,created_at) VALUES(New.updated_by,OLD.id,TG_TABLE_NAME,'status',OLD.status,NEW.status,'U',now());
			END IF;
		ELSEIF(TG_OP = 'DELETE') THEN
			INSERT INTO activity_logs(user_id,tbl_id,tbl_name,attr_name,on_update,action,created_at) VALUES(Old.updated_by,Old.id,TG_TABLE_NAME,'data',OLD,'D',now());
		END IF;
		RETURN NULL;
	END;
$$;
CREATE TRIGGER trigger_master_major_heads AFTER INSERT OR UPDATE OR DELETE ON master_major_heads FOR EACH ROW EXECUTE PROCEDURE function_master_major_heads();

/*Trigger for master_object_heads table*/
DROP TRIGGER IF EXISTS trigger_master_object_heads ON master_object_heads;
CREATE OR REPLACE FUNCTION function_master_object_heads() RETURNS TRIGGER LANGUAGE PLPGSQL AS
$$
	BEGIN
		IF(TG_OP = 'INSERT') THEN
			INSERT INTO activity_logs(user_id,tbl_id,tbl_name,attr_name,on_create,action,created_at) VALUES(New.created_by,NEW.id,TG_TABLE_NAME,'new',NEW,'C',now());
		ELSEIF(TG_OP = 'UPDATE') THEN
			IF(OLD.name != NEW.name) THEN
				INSERT INTO activity_logs(user_id,tbl_id,tbl_name,attr_name,on_create,on_update,action,created_at) VALUES(New.updated_by,OLD.id,TG_TABLE_NAME,'name',OLD.name,NEW.name,'U',now());
			END IF;
			IF(OLD.code != NEW.code) THEN
				INSERT INTO activity_logs(user_id,tbl_id,tbl_name,attr_name,on_create,on_update,action,created_at) VALUES(New.updated_by,OLD.id,TG_TABLE_NAME,'code',OLD.code,NEW.code,'U',now());
			END IF;
			IF(OLD.status != NEW.status) THEN
				INSERT INTO activity_logs(user_id,tbl_id,tbl_name,attr_name,on_create,on_update,action,created_at) VALUES(New.updated_by,OLD.id,TG_TABLE_NAME,'status',OLD.status,NEW.status,'U',now());
			END IF;
		ELSEIF(TG_OP = 'DELETE') THEN
			INSERT INTO activity_logs(user_id,tbl_id,tbl_name,attr_name,on_update,action,created_at) VALUES(Old.updated_by,Old.id,TG_TABLE_NAME,'data',OLD,'D',now());
		END IF;
		RETURN NULL;
	END;
$$;
CREATE TRIGGER trigger_master_object_heads AFTER INSERT OR UPDATE OR DELETE ON master_object_heads FOR EACH ROW EXECUTE PROCEDURE function_master_object_heads();

/*Trigger for master_roles table*/
DROP TRIGGER IF EXISTS trigger_master_roles ON master_roles;
CREATE OR REPLACE FUNCTION function_master_roles() RETURNS TRIGGER LANGUAGE PLPGSQL AS
$$
	BEGIN
		IF(TG_OP = 'INSERT') THEN
			INSERT INTO activity_logs(user_id,tbl_id,tbl_name,attr_name,on_create,action,created_at) VALUES(New.created_by,NEW.id,TG_TABLE_NAME,'new',NEW,'C',now());
		ELSEIF(TG_OP = 'UPDATE') THEN
			IF(OLD.name != NEW.name) THEN
				INSERT INTO activity_logs(user_id,tbl_id,tbl_name,attr_name,on_create,on_update,action,created_at) VALUES(New.updated_by,OLD.id,TG_TABLE_NAME,'name',OLD.name,NEW.name,'U',now());
			END IF;
			IF(OLD.status != NEW.status) THEN
				INSERT INTO activity_logs(user_id,tbl_id,tbl_name,attr_name,on_create,on_update,action,created_at) VALUES(New.updated_by,OLD.id,TG_TABLE_NAME,'status',OLD.status,NEW.status,'U',now());
			END IF;
		ELSEIF(TG_OP = 'DELETE') THEN
			INSERT INTO activity_logs(user_id,tbl_id,tbl_name,attr_name,on_update,action,created_at) VALUES(Old.updated_by,Old.id,TG_TABLE_NAME,'data',OLD,'D',now());
		END IF;
		RETURN NULL;
	END;
$$;
CREATE TRIGGER trigger_master_roles AFTER INSERT OR UPDATE OR DELETE ON master_roles FOR EACH ROW EXECUTE PROCEDURE function_master_roles();

/*Trigger for master_schemes table*/
DROP TRIGGER IF EXISTS trigger_master_schemes ON master_schemes;
CREATE OR REPLACE FUNCTION function_master_schemes() RETURNS TRIGGER LANGUAGE PLPGSQL AS
$$
	BEGIN
		IF(TG_OP = 'INSERT') THEN
			INSERT INTO activity_logs(user_id,tbl_id,tbl_name,attr_name,on_create,action,created_at) VALUES(New.created_by,NEW.id,TG_TABLE_NAME,'new',NEW,'C',now());
		ELSEIF(TG_OP = 'UPDATE') THEN
			IF(OLD.name != NEW.name) THEN
				INSERT INTO activity_logs(user_id,tbl_id,tbl_name,attr_name,on_create,on_update,action,created_at) VALUES(New.updated_by,OLD.id,TG_TABLE_NAME,'name',OLD.name,NEW.name,'U',now());
			END IF;
			IF(OLD.parent_id != NEW.parent_id) THEN
				INSERT INTO activity_logs(user_id,tbl_id,tbl_name,attr_name,on_create,on_update,action,created_at) VALUES(New.updated_by,OLD.id,TG_TABLE_NAME,'parent_id',OLD.parent_id,NEW.parent_id,'U',now());
			END IF;
			IF(OLD.status != NEW.status) THEN
				INSERT INTO activity_logs(user_id,tbl_id,tbl_name,attr_name,on_create,on_update,action,created_at) VALUES(New.updated_by,OLD.id,TG_TABLE_NAME,'status',OLD.status,NEW.status,'U',now());
			END IF;
		ELSEIF(TG_OP = 'DELETE') THEN
			INSERT INTO activity_logs(user_id,tbl_id,tbl_name,attr_name,on_update,action,created_at) VALUES(Old.updated_by,Old.id,TG_TABLE_NAME,'data',OLD,'D',now());
		END IF;
		RETURN NULL;
	END;
$$;
CREATE TRIGGER trigger_master_schemes AFTER INSERT OR UPDATE OR DELETE ON master_schemes FOR EACH ROW EXECUTE PROCEDURE function_master_schemes();

/*Trigger for budget_allocation_schemes table*/
DROP TRIGGER IF EXISTS trigger_budget_allocation_schemes ON budget_allocation_schemes;
CREATE OR REPLACE FUNCTION function_budget_allocation_schemes() RETURNS TRIGGER LANGUAGE PLPGSQL AS
$$
	BEGIN
		IF(TG_OP = 'INSERT') THEN
			INSERT INTO activity_logs(user_id,tbl_id,tbl_name,attr_name,on_create,action,created_at) VALUES(New.created_by,NEW.id,TG_TABLE_NAME,'new',NEW,'C',now());
		ELSEIF(TG_OP = 'UPDATE') THEN
			IF(OLD.budget != NEW.budget) THEN
				INSERT INTO activity_logs(user_id,tbl_id,tbl_name,attr_name,on_create,on_update,action,created_at) VALUES(New.updated_by,OLD.id,TG_TABLE_NAME,'budget',OLD.budget,NEW.budget,'U',now());
			END IF;
			IF(OLD.approval != NEW.approval) THEN
				INSERT INTO activity_logs(user_id,tbl_id,tbl_name,attr_name,on_create,on_update,action,created_at) VALUES(New.updated_by,OLD.id,TG_TABLE_NAME,'approval',OLD.approval,NEW.approval,'U',now());
			END IF;
		ELSEIF(TG_OP = 'DELETE') THEN
			INSERT INTO activity_logs(user_id,tbl_id,tbl_name,attr_name,on_update,action,created_at) VALUES(Old.updated_by,Old.id,TG_TABLE_NAME,'data',OLD,'D',now());
		END IF;
		RETURN NULL;
	END;
$$;
CREATE TRIGGER trigger_budget_allocation_schemes AFTER INSERT OR UPDATE OR DELETE ON budget_allocation_schemes FOR EACH ROW EXECUTE PROCEDURE function_budget_allocation_schemes();