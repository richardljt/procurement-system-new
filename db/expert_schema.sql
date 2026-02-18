CREATE TABLE IF NOT EXISTS expert (
    expert_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    department VARCHAR(255),
    entry_date DATE,
    industries VARCHAR(1024), -- Comma separated
    level VARCHAR(50),
    avatar VARCHAR(512),
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    create_user_id VARCHAR(50),
    create_user_name VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
