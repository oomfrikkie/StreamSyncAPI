-- PostgreSQL stored procedure to create a movie and its content
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
