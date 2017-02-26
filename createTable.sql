-- Users
CREATE TABLE IF NOT EXISTS users (
    username VARCHAR(40) NOT NULL,
    firstname VARCHAR(40),
    lastname VARCHAR(40),
    password VARCHAR(20) NOT NULL,
    address VARCHAR(100),
    zip VARCHAR(10),
    city VARCHAR(40),
    state VARCHAR(40),
    country VARCHAR(40),
    apartment_name VARCHAR(40),
    PRIMARY KEY(username)
);


-- Machines
-- machine_id is given by developers
CREATE TABLE IF NOT EXISTS machines (
    machine_id INT NOT NULL,
    idle_power FLOAT NOT NULL,
    running_time_minute INT NOT NULL,
    address VARCHAR(100),
    zip VARCHAR(10),
    city VARCHAR(40),
    state VARCHAR(40),
    country VARCHAR(40),
    machine_type VARCHAR(10) NOT NULL,
    PRIMARY KEY(machine_id)
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
