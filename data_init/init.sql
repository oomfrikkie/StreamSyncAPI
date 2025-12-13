CREATE TABLE IF NOT EXISTS projectmembers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS quality (
    quality_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    monthly_value DOUBLE PRECISION NOT NULL
);

CREATE TABLE IF NOT EXISTS api_user_account (
    api_user_id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS account (
    account_id SERIAL PRIMARY KEY,
    email VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    failed_login_attempts INT DEFAULT 0,
    created_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS age_category (
    age_category_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    guidelines_text TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS genre (
    genre_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS account_token (
    token_id SERIAL PRIMARY KEY,
    token VARCHAR(255) NOT NULL,
    token_type VARCHAR(50) NOT NULL,
    account_id INT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    used_at TIMESTAMP,
    is_used BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (account_id) REFERENCES account(account_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS profile (
    profile_id SERIAL PRIMARY KEY,
    account_id INT NOT NULL,
    age_category_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    image_url VARCHAR(500),
    FOREIGN KEY (account_id) REFERENCES account(account_id),
    FOREIGN KEY (age_category_id) REFERENCES age_category(age_category_id)
);

CREATE TABLE IF NOT EXISTS account_subscription (
    account_subscription_id SERIAL PRIMARY KEY,
    account_id INT NOT NULL,
    quality_id INT NOT NULL,
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,
    is_trial BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (account_id) REFERENCES account(account_id),
    FOREIGN KEY (quality_id) REFERENCES quality(quality_id)
);

CREATE TABLE IF NOT EXISTS invitation (
    invitation_id SERIAL PRIMARY KEY,
    inviter_account_id INT NOT NULL,
    invitee_account_id INT NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING',
    sent_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    accepted_timestamp TIMESTAMP,
    discount_expiry_date DATE,
    FOREIGN KEY (inviter_account_id) REFERENCES account(account_id),
    FOREIGN KEY (invitee_account_id) REFERENCES account(account_id)
);

CREATE TABLE IF NOT EXISTS profile_genre_preference (
    profile_id INT NOT NULL,
    genre_id INT NOT NULL,
    PRIMARY KEY (profile_id, genre_id),
    FOREIGN KEY (profile_id) REFERENCES profile(profile_id),
    FOREIGN KEY (genre_id) REFERENCES genre(genre_id)
);

CREATE TABLE IF NOT EXISTS content (
    content_id SERIAL PRIMARY KEY,
    age_category_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content_type VARCHAR(50) NOT NULL,
    quality_id INT NOT NULL,
    FOREIGN KEY (age_category_id) REFERENCES age_category(age_category_id),
    FOREIGN KEY (quality_id) REFERENCES quality(quality_id)
);

CREATE TABLE IF NOT EXISTS movie (
    movie_id SERIAL PRIMARY KEY,
    content_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    duration INT NOT NULL,
    FOREIGN KEY (content_id) REFERENCES content(content_id)
);

CREATE TABLE IF NOT EXISTS series (
    series_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS season (
    season_id SERIAL PRIMARY KEY,
    series_id INT NOT NULL,
    season_number INT NOT NULL,
    FOREIGN KEY (series_id) REFERENCES series(series_id)
);

CREATE TABLE IF NOT EXISTS episode (
    episode_id SERIAL PRIMARY KEY,
    content_id INT NOT NULL,
    episode_number INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    duration_minutes INT NOT NULL,
    season_id INT NOT NULL,
    FOREIGN KEY (content_id) REFERENCES content(content_id),
    FOREIGN KEY (season_id) REFERENCES season(season_id)
);

CREATE TABLE IF NOT EXISTS watchlist_item (
    profile_id INT NOT NULL,
    content_id INT NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (profile_id, content_id),
    FOREIGN KEY (profile_id) REFERENCES profile(profile_id),
    FOREIGN KEY (content_id) REFERENCES content(content_id)
);

CREATE TABLE IF NOT EXISTS viewing_session (
    viewing_session_id SERIAL PRIMARY KEY,
    profile_id INT NOT NULL,
    content_id INT NOT NULL,
    last_position_seconds INT NOT NULL DEFAULT 0,
    watched_seconds INT NOT NULL DEFAULT 0,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    auto_continued_next BOOLEAN NOT NULL DEFAULT FALSE,
    start_timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_profile_content UNIQUE (profile_id, content_id),
    FOREIGN KEY (profile_id) REFERENCES profile(profile_id),
    FOREIGN KEY (content_id) REFERENCES content(content_id)
);

-- =========================
-- SEED DATA
-- =========================

INSERT INTO projectmembers VALUES
(1, 'Felix'),
(2, 'Iarina'),
(3, 'Derjen');

INSERT INTO quality VALUES
(1, 'SD', 10.0),
(2, 'HD', 20.0),
(3, 'UHD', 30.0);

INSERT INTO api_user_account VALUES
(1, 'api_streamflix', 'Technical API user', TRUE);

INSERT INTO account (email, password_hash, is_verified, status, failed_login_attempts) VALUES
('alice@example.com', 'hash_alice', TRUE, 'ACTIVE', 0),
('bob@example.com', 'hash_bob', FALSE, 'ACTIVE', 0),
('carol@example.com', 'hash_carol', TRUE, 'BLOCKED', 3);

INSERT INTO age_category VALUES
(1, 'Child', 'No violence, fear, or coarse language'),
(2, 'Teen', 'Limited violence and fear, no coarse language'),
(3, 'Adult', 'All content allowed');

INSERT INTO genre VALUES
(1, 'Comedy'),
(2, 'Action'),
(3, 'Drama');

INSERT INTO profile VALUES
(1, 1, 2, 'Alice Teen', NULL),
(2, 1, 3, 'Alice Adult', NULL),
(3, 2, 1, 'Bob Child', NULL);

INSERT INTO account_subscription VALUES
(1, 1, 2, '2025-12-01', NULL, FALSE),
(2, 2, 1, '2025-12-01', '2025-12-08', TRUE);

INSERT INTO invitation VALUES
(1, 1, 2, 'ACCEPTED', '2025-12-01 10:00:00', '2025-12-02 12:00:00', '2026-01-01'),
(2, 2, 3, 'PENDING', '2025-12-02 14:00:00', NULL, NULL);

INSERT INTO profile_genre_preference VALUES
(1, 2),
(2, 1),
(3, 3);

-- =========================
-- CONTENT
-- =========================

INSERT INTO content VALUES
(1, 3, 'Space Adventures S1E1', 'Pilot episode', 'EPISODE', 3),
(2, 3, 'Space Adventures S1E2', 'Episode 2', 'EPISODE', 3),
(3, 2, 'The Funny Movie', 'Comedy movie', 'MOVIE', 2),
(4, 1, 'Kids Adventure', 'Fun animated movie for kids', 'MOVIE', 1),

(5, 3, 'Stranger Things S1E1', 'Chapter One', 'EPISODE', 3),
(6, 3, 'Stranger Things S1E2', 'Chapter Two', 'EPISODE', 3),
(7, 3, 'Stranger Things S1E3', 'Chapter Three', 'EPISODE', 3),
(8, 3, 'Stranger Things S1E4', 'Chapter Four', 'EPISODE', 3),
(9, 3, 'Stranger Things S1E5', 'Chapter Five', 'EPISODE', 3),
(10, 3, 'Stranger Things S1E6', 'Chapter Six', 'EPISODE', 3),
(11, 3, 'Stranger Things S1E7', 'Chapter Seven', 'EPISODE', 3),
(12, 3, 'Stranger Things S1E8', 'Chapter Eight', 'EPISODE', 3),

(13, 3, 'Stranger Things S2E1', 'MADMAX', 'EPISODE', 3),
(14, 3, 'Stranger Things S2E2', 'Trick or Treat, Freak', 'EPISODE', 3),
(15, 3, 'Stranger Things S2E3', 'The Pollywog', 'EPISODE', 3),
(16, 3, 'Stranger Things S2E4', 'Will the Wise', 'EPISODE', 3),
(17, 3, 'Stranger Things S2E5', 'Dig Dug', 'EPISODE', 3),
(18, 3, 'Stranger Things S2E6', 'The Spy', 'EPISODE', 3),
(19, 3, 'Stranger Things S2E7', 'The Lost Sister', 'EPISODE', 3),
(20, 3, 'Stranger Things S2E8', 'The Mind Flayer', 'EPISODE', 3),
(21, 3, 'Stranger Things S2E9', 'The Gate', 'EPISODE', 3),

(22, 3, 'Stranger Things S3E1', 'Suzie, Do You Copy?', 'EPISODE', 3),
(23, 3, 'Stranger Things S3E2', 'The Mall Rats', 'EPISODE', 3),
(24, 3, 'Stranger Things S3E3', 'The Case of the Missing Lifeguard', 'EPISODE', 3),
(25, 3, 'Stranger Things S3E4', 'The Sauna Test', 'EPISODE', 3),
(26, 3, 'Stranger Things S3E5', 'The Flayed', 'EPISODE', 3),
(27, 3, 'Stranger Things S3E6', 'E Pluribus Unum', 'EPISODE', 3),
(28, 3, 'Stranger Things S3E7', 'The Bite', 'EPISODE', 3),
(29, 3, 'Stranger Things S3E8', 'The Battle of Starcourt', 'EPISODE', 3),

(30, 3, 'Saw', 'Psychological horror movie', 'MOVIE', 3),
(31, 3, 'Saw II', 'Psychological horror movie', 'MOVIE', 3),
(32, 3, 'Saw III', 'Psychological horror movie', 'MOVIE', 3),
(33, 3, 'Saw IV', 'Psychological horror movie', 'MOVIE', 3);

-- =========================
-- MOVIES
-- =========================

INSERT INTO movie VALUES
(1, 3, 'The Funny Movie', 95),
(2, 4, 'Kids Adventure', 80),
(3, 30, 'Saw', 103),
(4, 31, 'Saw II', 95),
(5, 32, 'Saw III', 108),
(6, 33, 'Saw IV', 93);

-- =========================
-- SERIES / SEASONS / EPISODES
-- =========================

INSERT INTO series VALUES
(1, 'Space Adventures'),
(2, 'Mystery Island'),
(3, 'Stranger Things');

INSERT INTO season VALUES
(1, 1, 1),
(2, 1, 2),
(3, 2, 1),
(4, 3, 1),
(5, 3, 2),
(6, 3, 3);

INSERT INTO episode VALUES
(1, 1, 1, 'Pilot', 45, 1),
(2, 2, 2, 'Second Episode', 47, 1),

(3, 5, 1, 'Chapter One', 47, 4),
(4, 6, 2, 'Chapter Two', 55, 4),
(5, 7, 3, 'Chapter Three', 51, 4),
(6, 8, 4, 'Chapter Four', 50, 4),
(7, 9, 5, 'Chapter Five', 53, 4),
(8, 10, 6, 'Chapter Six', 46, 4),
(9, 11, 7, 'Chapter Seven', 41, 4),
(10, 12, 8, 'Chapter Eight', 62, 4),

(11, 13, 1, 'MADMAX', 48, 5),
(12, 14, 2, 'Trick or Treat, Freak', 56, 5),
(13, 15, 3, 'The Pollywog', 51, 5),
(14, 16, 4, 'Will the Wise', 46, 5),
(15, 17, 5, 'Dig Dug', 58, 5),
(16, 18, 6, 'The Spy', 46, 5),
(17, 19, 7, 'The Lost Sister', 45, 5),
(18, 20, 8, 'The Mind Flayer', 46, 5),
(19, 21, 9, 'The Gate', 77, 5),

(20, 22, 1, 'Suzie, Do You Copy?', 50, 6),
(21, 23, 2, 'The Mall Rats', 52, 6),
(22, 24, 3, 'The Case of the Missing Lifeguard', 49, 6),
(23, 25, 4, 'The Sauna Test', 51, 6),
(24, 26, 5, 'The Flayed', 52, 6),
(25, 27, 6, 'E Pluribus Unum', 59, 6),
(26, 28, 7, 'The Bite', 54, 6),
(27, 29, 8, 'The Battle of Starcourt', 79, 6);

-- =========================
-- WATCHING DATA
-- =========================

INSERT INTO watchlist_item VALUES
(1, 3),
(1, 1),
(2, 4);

INSERT INTO viewing_session (profile_id, content_id, last_position_seconds, watched_seconds, completed) VALUES
(1, 1, 1200, 1200, FALSE),
(1, 3, 5400, 5400, TRUE),
(3, 4, 800, 800, FALSE);

-- =========================
-- SEQUENCE FIXES
-- =========================

SELECT setval('projectmembers_id_seq', (SELECT MAX(id) FROM projectmembers));
SELECT setval('quality_quality_id_seq', (SELECT MAX(quality_id) FROM quality));
SELECT setval('api_user_account_api_user_id_seq', (SELECT MAX(api_user_id) FROM api_user_account));
SELECT setval('account_account_id_seq', (SELECT MAX(account_id) FROM account));
SELECT setval('age_category_age_category_id_seq', (SELECT MAX(age_category_id) FROM age_category));
SELECT setval('genre_genre_id_seq', (SELECT MAX(genre_id) FROM genre));
SELECT setval('profile_profile_id_seq', (SELECT MAX(profile_id) FROM profile));
SELECT setval('account_subscription_account_subscription_id_seq', (SELECT MAX(account_subscription_id) FROM account_subscription));
SELECT setval('invitation_invitation_id_seq', (SELECT MAX(invitation_id) FROM invitation));
SELECT setval('content_content_id_seq', (SELECT MAX(content_id) FROM content));
SELECT setval('movie_movie_id_seq', (SELECT MAX(movie_id) FROM movie));
SELECT setval('series_series_id_seq', (SELECT MAX(series_id) FROM series));
SELECT setval('season_season_id_seq', (SELECT MAX(season_id) FROM season));
SELECT setval('episode_episode_id_seq', (SELECT MAX(episode_id) FROM episode));
SELECT setval('viewing_session_viewing_session_id_seq', (SELECT MAX(viewing_session_id) FROM viewing_session));
