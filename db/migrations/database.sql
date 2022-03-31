DROP TABLE IF EXISTS levels;

CREATE TABLE levels
(
    id serial PRIMARY KEY,
    xptarget int
);


DROP TABLE IF EXISTS profilePics;

CREATE TABLE profilePics
(
    id serial PRIMARY KEY,
    src VARCHAR
);

DROP TABLE IF EXISTS users;

CREATE TABLE users
(
    id serial PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(200) NOT NULL UNIQUE,
    password VARCHAR(500) NOT NULL,
    rupees int,
    profilePic int,
    FOREIGN KEY(profilePic) REFERENCES profilePics(id),
    xp int,
    level int,
    FOREIGN KEY (level) REFERENCES levels(id)
);


DROP TABLE IF EXISTS habits;

CREATE TABLE habits
(
    id serial PRIMARY KEY,
    user_id int NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id),
    title VARCHAR(50) NOT NULL,
    frequency int NOT NULL,
    streak int,
    category VARCHAR,
    timesdone int,
    completed boolean,
    daysexist int,
    dayscompleted int
);