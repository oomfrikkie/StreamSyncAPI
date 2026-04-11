-- views.sql: Database views for StreamSyncAPI

-- Full movie details: joins content, movie, age_category, quality, and aggregates genres
CREATE OR REPLACE VIEW v_movie_full AS
SELECT
    m.movie_id,
    c.content_id,
    c.title,
    c.description,
    c.duration_minutes,
    ac.name        AS age_category,
    q.name         AS quality,
    q.monthly_value,
    STRING_AGG(g.name, ', ' ORDER BY g.name) AS genres
FROM movie m
JOIN content      c  ON c.content_id       = m.content_id
JOIN age_category ac ON ac.age_category_id = c.age_category_id
JOIN quality      q  ON q.quality_id       = c.quality_id
LEFT JOIN content_genre cg ON cg.content_id = c.content_id
LEFT JOIN genre         g  ON g.genre_id    = cg.genre_id
GROUP BY m.movie_id, c.content_id, c.title, c.description, c.duration_minutes,
         ac.name, q.name, q.monthly_value;

-- Series overview: series with total season count and total episode count
CREATE OR REPLACE VIEW v_series_overview AS
SELECT
    s.series_id,
    s.name                                              AS series_name,
    COUNT(DISTINCT sn.season_id)                        AS season_count,
    COUNT(DISTINCT e.episode_id)                        AS episode_count,
    STRING_AGG(DISTINCT g.name, ', ' ORDER BY g.name)  AS genres
FROM series s
LEFT JOIN season       sn ON sn.series_id  = s.series_id
LEFT JOIN episode      e  ON e.season_id   = sn.season_id
LEFT JOIN series_genre sg ON sg.series_id  = s.series_id
LEFT JOIN genre        g  ON g.genre_id    = sg.genre_id
GROUP BY s.series_id, s.name;

-- Profile viewing history: what each profile has watched, with progress info
CREATE OR REPLACE VIEW v_profile_viewing_history AS
SELECT
    p.profile_id,
    p.name                              AS profile_name,
    a.account_id,
    a.email,
    c.content_id,
    c.title,
    c.content_type,
    vs.watched_seconds,
    c.duration_minutes * 60             AS total_seconds,
    vs.last_position_seconds,
    vs.completed,
    vs.auto_continued_next,
    vs.start_timestamp
FROM viewing_session vs
JOIN profile p ON p.profile_id = vs.profile_id
JOIN account a ON a.account_id = p.account_id
JOIN content c ON c.content_id = vs.content_id;

-- Active subscriptions: accounts currently subscribed (no end date or end date in future)
CREATE OR REPLACE VIEW v_active_subscriptions AS
SELECT
    a.account_id,
    a.email,
    a.status        AS account_status,
    q.name          AS quality_tier,
    q.monthly_value,
    sub.start_date,
    sub.end_date,
    sub.is_trial
FROM account_subscription sub
JOIN account a ON a.account_id = sub.account_id
JOIN quality q ON q.quality_id = sub.quality_id
WHERE sub.end_date IS NULL OR sub.end_date >= CURRENT_DATE;

-- =========================
-- VIEW GRANTS
-- =========================

-- junior and above: can read movie and series catalogue views (no financial data)
GRANT SELECT ON v_movie_full TO junior_employee;
GRANT SELECT ON v_series_overview TO junior_employee;

-- senior only: viewing history and subscription/financial views
GRANT SELECT ON v_profile_viewing_history TO senior_employee;
GRANT SELECT ON v_active_subscriptions TO senior_employee;
