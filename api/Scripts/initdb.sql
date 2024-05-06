CREATE DATABASE receipts;

-- User Table
CREATE TABLE "User" (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(50) NOT NULL,
    admin BOOLEAN NOT NULL DEFAULT FALSE,
    date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Receipt Table
CREATE TABLE Receipt (
    id SERIAL PRIMARY KEY,
    date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id INT,
    country VARCHAR(50),
    project_code VARCHAR(50),
    school_name VARCHAR(100),
    merchant_name VARCHAR(100),
    receipt_date DATE,
    receipt_url VARCHAR(255),
    status VARCHAR(20) CHECK (status IN ('Accepted', 'Rejected', 'Pending')) DEFAULT 'Pending',
    reason TEXT,
    FOREIGN KEY (user_id) REFERENCES "User"(id)
);

