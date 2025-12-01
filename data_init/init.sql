CREATE TABLE IF NOT EXISTS projectmembers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS quality (
    quality_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    monthly_value DOUBLE PRECISION NOT NULL
);

INSERT INTO projectmembers (name) VALUES
('Felix'),
('Iarina'),
('Derjen');

INSERT INTO quality (name, monthly_value) VALUES
('4K', 30.0),
('1080P', 25.0),
('720P', 20.0);

const result = await this.dataSource.query('SELECT * FROM "Quality"');