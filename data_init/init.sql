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

CREATE TABLE IF NOT EXISTS profile (
    profile_id SERIAL PRIMARY KEY,
    account_id INT NOT NULL,
    age_category_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    image_url VARCHAR(500),

    FOREIGN KEY (account_id) REFERENCES account(account_id),
    FOREIGN KEY (age_category_id) REFERENCES age_category(age_category_id)
);

CREATE TABLE IF NOT EXISTS age_category (
    age_category_id SERIAL PRIMARY KEY, 
    name VARCHAR(100) NOT NULL,
    guidelines_text TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS profile_genre_preference (
    profile_id INT NOT NULL,
    genre_id INT NOT NULL,

    PRIMARY KEY (profile_id, genre_id),

    FOREIGN KEY (profile_id) REFERENCES profile(profile_id),
    FOREIGN KEY (genre_id) REFERENCES genre(genre_id)
);

CREATE TABLE IF NOT EXISTS genre (
    genre_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
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

INSERT INTO profile (profile_id, account_id, age_category_id, name, image_url) VALUES
(1, 1, 2, 'Alice Teen', NULL),
(2, 1, 3, 'Alice Adult', NULL),
(3, 2, 1, 'Bob Child', NULL);

INSERT INTO genre (genre_id, name) VALUES
(1, 'Comedy'),
(2, 'Action'),
(3, 'Drama');

INSERT INTO account_subscription (account_subscription_id, account_id, quality_id, start_date, end_date, is_trial) VALUES
(1, 1, 2, '2025-12-01', NULL, FALSE), -- Alice, HD, paid
(2, 2, 1, '2025-12-01', '2025-12-08', TRUE); -- Bob, SD, trial

INSERT INTO invitation (invitation_id, inviter_account_id, invitee_account_id, status, sent_timestamp, accepted_timestamp, discount_expiry_date) VALUES
(1, 1, 2, 'ACCEPTED', '2025-12-01 10:00:00', '2025-12-02 12:00:00', '2026-01-01'),
(2, 2, 3, 'PENDING', '2025-12-02 14:00:00', NULL, NULL);

INSERT INTO profile_genre_preference (profile_id, genre_id) VALUES
(1, 2), -- Alice Teen likes Action
(2, 1), -- Alice Adult likes Comedy
(3, 3); -- Bob Child likes Drama
