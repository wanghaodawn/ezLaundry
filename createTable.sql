-- Landlord
CREATE TABLE IF NOT EXISTS landlords (
    landlord_id INT NOT NULL AUTO_INCREMENT,
    latitude DECIMAL (11, 7) NOT NULL,
    longitude DECIMAL(11, 7) NOT NULL,
    property_name VARCHAR(40) NOT NULL,
    email VARCHAR(254) NOT NULL,
    PRIMARY KEY(landlord_id)
);


-- Users
CREATE TABLE IF NOT EXISTS users (
    username VARCHAR(40) NOT NULL,
    email VARCHAR(254) NOT NULL,
    password VARCHAR(128) NOT NULL,
    landlord_id INT NOT NULL,
    has_verified_email BIT NOT NULL,
    PRIMARY KEY(username),
    FOREIGN KEY (landlord_id) REFERENCES landlords(landlord_id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS email_verifications (
    id INT NOT NULL AUTO_INCREMENT,
    username VARCHAR(40) NOT NULL,
    timestamp DATETIME NOT NULL,
    code VARCHAR(20),
    PRIMARY KEY (id),
    FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
);


-- Machines
-- machine_id is given by developers
CREATE TABLE IF NOT EXISTS machines (
    machine_id INT NOT NULL,
    idle_power FLOAT NOT NULL,
    running_time_minute INT NOT NULL,
    landlord_id INT NOT NULL,
    machine_type VARCHAR(10) NOT NULL,
    PRIMARY KEY(machine_id),
    FOREIGN KEY (landlord_id) REFERENCES landlords(landlord_id) ON DELETE CASCADE
);


-- Schedule
CREATE TABLE IF NOT EXISTS schedules (
    schedule_id INT NOT NULL AUTO_INCREMENT,
    username VARCHAR(40) NOT NULL,
    machine_id INT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    PRIMARY KEY(schedule_id),
    FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE,
    FOREIGN KEY (machine_id) REFERENCES machines(machine_id) ON DELETE CASCADE
);


-- Schedule without login
CREATE TABLE IF NOT EXISTS schedules_annonymous (
    schedule_id INT NOT NULL AUTO_INCREMENT,
    machine_id INT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    PRIMARY KEY(schedule_id),
    FOREIGN KEY (machine_id) REFERENCES machines(machine_id) ON DELETE CASCADE
);


-- Feedback table
CREATE TABLE IF NOT EXISTS feedbacks (
    username VARCHAR(40) NOT NULL,
    text TEXT NOT NULL,
    timestamp DATETIME NOT NULL,
    PRIMARY KEY (username, timestamp),
    FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
);
