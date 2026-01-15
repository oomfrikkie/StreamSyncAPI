-- roles.sql: Create login users and grant them to NOLOGIN roles
-- This file is named to run after all other init scripts

-- Create login users (will error if they already exist, which is fine)
CREATE ROLE junior_user LOGIN PASSWORD 'juniorpass';
CREATE ROLE mid_user LOGIN PASSWORD 'midpass';
CREATE ROLE senior_user LOGIN PASSWORD 'seniorpass';

-- Create API user account for technical/API access
CREATE ROLE api_user_account LOGIN PASSWORD 'apipass';

-- Grant NOLOGIN roles to login users
GRANT junior_employee TO junior_user;
GRANT mid_employee TO mid_user;
GRANT senior_employee TO senior_user;

-- Grant all permissions to roles (moved from init.sql)
GRANT USAGE ON SCHEMA public TO junior_employee, mid_employee, senior_employee;

-- Fix: Grant schema usage to API user account
GRANT USAGE ON SCHEMA public TO api_user_account;

-- Fix: Allow API user to use function by granting SELECT on profile
GRANT SELECT ON profile TO api_user_account;

GRANT SELECT (account_id, email, is_verified, status, failed_login_attempts, created_timestamp)
ON account TO junior_employee;

GRANT SELECT (profile_id, account_id, age_category_id, name, image_url, min_quality_id)
ON profile TO junior_employee;

GRANT SELECT ON age_category, genre, quality TO junior_employee;

GRANT SELECT (content_id, age_category_id, title, description, content_type, quality_id, duration_minutes)
ON content TO junior_employee;

GRANT SELECT ON series, season, episode, movie, series_genre, content_genre TO junior_employee;

GRANT junior_employee TO mid_employee;

GRANT UPDATE (name, age_category_id, image_url, min_quality_id) ON profile TO mid_employee;

GRANT UPDATE (status, failed_login_attempts) ON account TO mid_employee;

GRANT junior_employee TO senior_employee;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
	account,
	profile,
	account_subscription,
	discount,
	invitation,
	viewing_session,
	watchlist_item,
	content,
	series,
	season,
	episode,
	movie,
	account_token,
	profile_genre_preference,
	content_genre,
	series_genre,
	quality,
	genre,
	age_category
TO senior_employee;


-- Create API view and function for API user (moved from init.sql to ensure creation)
CREATE OR REPLACE VIEW api_v_account_profile AS
SELECT 
	a.account_id, a.email, a.is_verified, a.status, a.created_timestamp,
	p.profile_id, p.name AS profile_name, p.age_category_id, p.image_url, p.min_quality_id
FROM account a
JOIN profile p ON a.account_id = p.account_id;

CREATE OR REPLACE FUNCTION api_get_profiles_for_account(api_account_id INT)
RETURNS TABLE(
	profile_id INT,
	profile_name VARCHAR,
	age_category_id INT,
	image_url VARCHAR,
	min_quality_id INT
) AS $$
BEGIN
	RETURN QUERY
		SELECT p.profile_id, p.name, p.age_category_id, p.image_url, p.min_quality_id
		FROM profile p
		WHERE p.account_id = api_account_id;
END;
$$ LANGUAGE plpgsql;

GRANT SELECT ON api_v_account_profile TO api_user_account;
GRANT EXECUTE ON FUNCTION api_get_profiles_for_account(INT) TO api_user_account;
