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

INSERT INTO projectmembers (id, name) VALUES
(1, 'Felix'),
(2, 'Iarina'),
(3, 'Derjen');

INSERT INTO quality (quality_id, name, monthly_value) VALUES
(1, 'SD', 10.0),
(2, 'HD', 20.0),
(3, 'UHD', 30.0);

INSERT INTO api_user_account (api_user_id, username, description, is_active) VALUES
(1, 'api_streamflix', 'Technical API user', TRUE);

INSERT INTO account (email, password_hash, is_verified, status, failed_login_attempts) VALUES
('alice@example.com', 'hash_alice', TRUE, 'ACTIVE', 0),
('bob@example.com', 'hash_bob', FALSE, 'ACTIVE', 0),
('carol@example.com', 'hash_carol', TRUE, 'BLOCKED', 3);

INSERT INTO age_category (age_category_id, name, guidelines_text) VALUES
(1, 'Child', 'No violence, fear, or coarse language'),
(2, 'Teen', 'Limited violence and fear, no coarse language'),
(3, 'Adult', 'All content allowed');

INSERT INTO genre (genre_id, name) VALUES
(1, 'Comedy'),
(2, 'Action'),
(3, 'Drama');

INSERT INTO profile (profile_id, account_id, age_category_id, name, image_url) VALUES
(1, 1, 2, 'Alice Teen', NULL),
(2, 1, 3, 'Alice Adult', NULL),
(3, 2, 1, 'Bob Child', NULL);

INSERT INTO account_subscription (account_subscription_id, account_id, quality_id, start_date, end_date, is_trial) VALUES
(1, 1, 2, '2025-12-01', NULL, FALSE),
(2, 2, 1, '2025-12-01', '2025-12-08', TRUE);

INSERT INTO invitation (invitation_id, inviter_account_id, invitee_account_id, status, sent_timestamp, accepted_timestamp, discount_expiry_date) VALUES
(1, 1, 2, 'ACCEPTED', '2025-12-01 10:00:00', '2025-12-02 12:00:00', '2026-01-01'),
(2, 2, 3, 'PENDING', '2025-12-02 14:00:00', NULL, NULL);

INSERT INTO profile_genre_preference (profile_id, genre_id) VALUES
(1, 2),
(2, 1),
(3, 3);

INSERT INTO content (content_id, age_category_id, title, description, content_type, quality_id) VALUES
(1, 3, 'Space Adventures S1E1', 'Pilot episode', 'EPISODE', 3),
(2, 3, 'Space Adventures S1E2', 'Episode 2', 'EPISODE', 3),
(3, 2, 'The Funny Movie', 'Comedy movie', 'MOVIE', 2),
(4, 1, 'Kids Adventure', 'Fun animated movie for kids', 'MOVIE', 1);

INSERT INTO movie (movie_id, content_id, name, duration) VALUES
(1, 3, 'The Funny Movie', 95),
(2, 4, 'Kids Adventure', 80);

INSERT INTO series (series_id, name) VALUES
(1, 'Space Adventures'),
(2, 'Mystery Island');

INSERT INTO season (season_id, series_id, season_number) VALUES
(1, 1, 1),
(2, 1, 2),
(3, 2, 1);

INSERT INTO episode (episode_id, content_id, episode_number, name, duration_minutes, season_id) VALUES
(1, 1, 1, 'Pilot', 45, 1),
(2, 2, 2, 'Second Episode', 47, 1);

INSERT INTO watchlist_item (profile_id, content_id) VALUES
(1, 3),
(1, 1),
(2, 4);

INSERT INTO viewing_session (profile_id, content_id, last_position_seconds, watched_seconds, completed) VALUES
(1, 1, 1200, 1200, FALSE),
(1, 3, 5400, 5400, TRUE),
(3, 4, 800, 800, FALSE);

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
