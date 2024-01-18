CREATE DATABASE IF NOT EXISTS mydatabase;
USE mydatabase;

CREATE TABLE IF NOT EXISTS user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    logins VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS notes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    text TEXT,
    userId INT,
    date DATE,
    type ENUM('image', 'text') NOT NULL,
    FOREIGN KEY (userId) REFERENCES user(id)
);

INSERT INTO user (logins, password) VALUES ('test', 'test');
