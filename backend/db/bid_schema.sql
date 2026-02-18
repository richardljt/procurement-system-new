CREATE TABLE IF NOT EXISTS bid (
    bid_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    procurement_request_id BIGINT,
    budget DECIMAL(19, 2),
    deadline DATETIME,
    description TEXT,
    notification_methods VARCHAR(50), -- Comma separated 'email,sms'
    email_subject VARCHAR(255),
    email_body TEXT,
    status VARCHAR(50) DEFAULT 'draft', -- draft, initiated, ongoing, completed, terminated
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    create_user_id VARCHAR(50),
    create_user_name VARCHAR(100),
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    update_user_id VARCHAR(50),
    update_user_name VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS bid_supplier (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    bid_id BIGINT NOT NULL,
    supplier_id BIGINT NOT NULL,
    is_selected BOOLEAN DEFAULT TRUE,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bid_attachment (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    bid_id BIGINT NOT NULL,
    file_name VARCHAR(255),
    file_url VARCHAR(500),
    file_size VARCHAR(50),
    file_type VARCHAR(50),
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP
);
