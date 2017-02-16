-- Users
CREATE TABLE IF NOT EXISTS users (
    user_id INT NOT NULL AUTO_INCREMENT,
    username VARCHAR(40) NOT NULL,
    firstname VARCHAR(40),
    lastname VARCHAR(40),
    password VARCHAR(20) NOT NULL,
    address VARCHAR(100),
    zip VARCHAR(10),
    city VARCHAR(40),
    state VARCHAR(40),
    country VARCHAR(40),
    PRIMARY KEY(user_id)
);


-- Machines
CREATE TABLE IF NOT EXISTS machines (
    machine_id INT,
    apartment_id INT,
    idle_power FLOAT NOT NULL,
    running_time_minute INT NOT NULL,
    address VARCHAR(100),
    zip VARCHAR(10),
    city VARCHAR(40),
    state VARCHAR(40),
    country VARCHAR(40),
    PRIMARY KEY(machine_id)
);


-- Schedule
CREATE TABLE IF NOT EXISTS schedules (
    user_id INT NOT NULL,
    machine_id INT NOT NULL,
    start_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,
    PRIMARY KEY(user_id, machine_id, start_time),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (machine_id) REFERENCES machines(machine_id) ON DELETE CASCADE
);


-- Schedule without login
CREATE TABLE IF NOT EXISTS schedules_annonymous (
    machine_id INT NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    PRIMARY KEY(machine_id, start_time, end_time),
    FOREIGN KEY (machine_id) REFERENCES machines(machine_id) ON DELETE CASCADE
);
