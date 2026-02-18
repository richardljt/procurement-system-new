CREATE TABLE IF NOT EXISTS supplier_history (
    history_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    supplier_id BIGINT NOT NULL,
    supplier_name VARCHAR(100),
    credit_code VARCHAR(50),
    contact_phone VARCHAR(20),
    address VARCHAR(200),
    rating DECIMAL(2, 1),
    tags VARCHAR(200),
    is_qualified BOOLEAN,
    status VARCHAR(20),
    region VARCHAR(20),
    contact_name VARCHAR(50),
    email VARCHAR(100),
    application_no VARCHAR(50),
    attachments TEXT,
    
    change_type VARCHAR(20) COMMENT 'CREATE, UPDATE, DELETE',
    change_reason VARCHAR(200),
    
    operator_id VARCHAR(50),
    operator_name VARCHAR(50),
    operate_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (supplier_id) REFERENCES supplier(supplier_id)
);
