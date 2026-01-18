
-- Procedure to add a season to a series
CREATE OR REPLACE FUNCTION add_season_to_series(
    p_series_id INT,
    p_season_number INT
) RETURNS TABLE (
    season_id INT,
    series_id INT,
    series_name VARCHAR,
    season_number INT
) AS $$
DECLARE
    found_season_id INT;
BEGIN
    -- Check if the series exists
    IF NOT EXISTS (SELECT 1 FROM series WHERE series.series_id = p_series_id) THEN
        RAISE EXCEPTION 'Series does not exist';
    END IF;
    -- Check if the season already exists
    SELECT s.season_id INTO found_season_id FROM season s WHERE s.series_id = p_series_id AND s.season_number = p_season_number;
    IF found_season_id IS NULL THEN
        INSERT INTO season (series_id, season_number) VALUES (p_series_id, p_season_number) RETURNING season.season_id INTO found_season_id;
    END IF;
    RETURN QUERY
      SELECT s.season_id, s.series_id, sr.name AS series_name, s.season_number
      FROM season s
      JOIN series sr ON sr.series_id = s.series_id
      WHERE s.series_id = p_series_id AND s.season_number = p_season_number;
END;
$$ LANGUAGE plpgsql;

-- stored procedure to create a movie and its content
CREATE OR REPLACE FUNCTION create_movie(
    p_age_category_id INT,
    p_title VARCHAR,
    p_description TEXT,
    p_quality_id INT,
    p_duration_minutes INT
) RETURNS VOID AS $$
DECLARE
    new_content_id INT;
BEGIN
    INSERT INTO content (age_category_id, title, description, content_type, quality_id, duration_minutes)
    VALUES (p_age_category_id, p_title, p_description, 'MOVIE', p_quality_id, p_duration_minutes)
    RETURNING content_id INTO new_content_id;

    INSERT INTO movie (content_id)
    VALUES (new_content_id);
END;
$$ LANGUAGE plpgsql;

-- Procedure to create an episode, creating the season if it does not exist
CREATE OR REPLACE FUNCTION create_episode_with_season(
    p_series_id INT,
    p_season_number INT,
    p_episode_number INT,
    p_title VARCHAR,
    p_description TEXT,
    p_age_category_id INT,
    p_quality_id INT,
    p_duration_minutes INT
) RETURNS VOID AS $$
DECLARE
    new_content_id INT;
    found_season_id INT;
BEGIN
    -- Try to find the season
    SELECT season_id INTO found_season_id FROM season WHERE series_id = p_series_id AND season_number = p_season_number;
    -- If not found, create it
    IF found_season_id IS NULL THEN
        INSERT INTO season (series_id, season_number) VALUES (p_series_id, p_season_number) RETURNING season_id INTO found_season_id;
    END IF;

    -- Insert content
    INSERT INTO content (age_category_id, title, description, content_type, quality_id, duration_minutes)
    VALUES (p_age_category_id, p_title, p_description, 'EPISODE', p_quality_id, p_duration_minutes)
    RETURNING content_id INTO new_content_id;

    -- Insert episode
    INSERT INTO episode (content_id, episode_number, season_id)
    VALUES (new_content_id, p_episode_number, found_season_id);
END;
$$ LANGUAGE plpgsql;




