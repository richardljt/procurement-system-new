CREATE TABLE IF NOT EXISTS procurement_file (
    file_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    procurement_request_id BIGINT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    upload_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_proc_req (procurement_request_id)
);
