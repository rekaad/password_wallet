CREATE DATABASE passwallet;

CREATE TABLE user_table(
    id SERIAL PRIMARY KEY,
    user_login VARCHAR(30) UNIQUE NOT NULL,
    password_hash VARCHAR(250) NOT NULL,
    salt VARCHAR(30),
    isPasswordKeptAsHash BOOLEAN,
    fail_count INT DEFAULT 0,
    ban_date TIMESTAMP
    );

DROP TABLE user_table;

CREATE TABLE password_table(
    id SERIAL PRIMARY KEY,
    password VARCHAR(256) NOT NULL,
    id_user INT NOT NULL,
    web_address VARCHAR(256),
    description VARCHAR(256),
    login VARCHAR(30),
    FOREIGN KEY (id_user) REFERENCES user_table(id)
    );

DROP TABLE password_table;

CREATE TABLE login_results(
    id SERIAL PRIMARY KEY,
    login_date TIMESTAMP,
    login_result BOOLEAN,
    user_Ip VARCHAR(64),
    id_user INT NOT NULL,
    FOREIGN KEY (id_user) REFERENCES user_table(id)
    );

DROP TABLE login_results;

CREATE TABLE ip_table(
    id SERIAL PRIMARY KEY,
    ip_address VARCHAR(64) NOT NULL,
    ban_date TIMESTAMP,
    fail_count INT DEFAULT 0,
    id_user INT NOT NULL,
    UNIQUE(ip_address,id_user),
    FOREIGN KEY (id_user) REFERENCES user_table(id)  
);

DROP TABLE ip_table;

