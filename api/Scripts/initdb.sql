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
    reason TEXT DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES "User"(id)
);

-- Purchase Table 
CREATE TABLE Purchase (
    id SERIAL PRIMARY KEY,
    user_id INT,
    item VARCHAR(50),
    project_code VARCHAR(50),
    school_name VARCHAR(100),
    receipt_id INT,
    quantity INT, 
    total_cost_BDT INT, 
    date_purchased DATE
    FOREIGN KEY (user_id) REFERENCES "User"(id)
    FOREIGN KEY (receipt_id) REFERENCES "Receipt"(id)
);


-- Item Table 
-- CREATE TABLE Item (
--     id SERIAL PRIMARY KEY,
--     item_name VARCHAR(100),
--     unit VARCHAR (5),
--     unit_price_BDT INT
-- );

-- School Table 
-- CREATE TABLE School (
--     id SERIAL PRIMARY KEY,
--     school_name VARCHAR(100),
--     country VARCHAR(50),
--     address TEXT,
--     start_date DATE
-- );

-- Project Table
-- CREATE TABLE Project (
--     id SERIAL PRIMARY KEY,
--     project_code VARCHAR (100),
--     project_name VARCHAR (100),
--     country VARCHAR (50),
--     start_date DATE
-- );








