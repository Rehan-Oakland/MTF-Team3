-- User Table
CREATE TABLE "User" (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(50) NOT NULL,
    admin BOOLEAN NOT NULL DEFAULT FALSE,
    date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    is_active BOOLEAN DEFAULT TRUE

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
    project_code VARCHAR(50),
    school_name VARCHAR(100),
    receipt_id INT,
    item VARCHAR(50),
    unit_price_bdt INT,
    unit VARCHAR(50),
    quantity INT, 
    total_cost_BDT INT, 
    date_purchased DATE
    FOREIGN KEY (user_id) REFERENCES "User"(id)
    FOREIGN KEY (receipt_id) REFERENCES "Receipt"(id)
);