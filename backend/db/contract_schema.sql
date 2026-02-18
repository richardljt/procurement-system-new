CREATE TABLE IF NOT EXISTS contract (
    contract_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    procurement_request_id BIGINT NOT NULL,
    contract_name VARCHAR(255) NOT NULL,
    contract_code VARCHAR(100),
    supplier_id BIGINT,
    amount DECIMAL(15, 2),
    signing_date DATETIME,
    attachment_url VARCHAR(500),
    status VARCHAR(50) DEFAULT 'DRAFT', -- DRAFT, SIGNED, ARCHIVED
    signer_name VARCHAR(100),
    signer_contact VARCHAR(100),
    vendor_signer_name VARCHAR(100),
    vendor_signer_contact VARCHAR(100),
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    create_user_id VARCHAR(50),
    create_user_name VARCHAR(100),
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    update_user_id VARCHAR(50),
    update_user_name VARCHAR(100),
    INDEX idx_procurement_request_id (procurement_request_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
