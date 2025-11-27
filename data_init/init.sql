CREATE TABLE IF NOT EXISTS ProjectMembers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

INSERT INTO ProjectMembers (name) VALUES
('Felix'),
('Iarina'),
('Derjen');
