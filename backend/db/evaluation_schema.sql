USE procurement_db;

CREATE TABLE IF NOT EXISTS evaluation_project (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_code VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    bid_id BIGINT,
    status VARCHAR(50) DEFAULT 'ONGOING', -- ONGOING, PAUSED, COMPLETED
    current_stage VARCHAR(50) DEFAULT 'BUSINESS', -- BUSINESS, PRICE
    organizer_name VARCHAR(100),
    start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS evaluation_supplier (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    evaluation_id BIGINT NOT NULL,
    supplier_id BIGINT, -- External supplier ID
    supplier_name VARCHAR(255) NOT NULL,
    supplier_code VARCHAR(50), -- e.g. A1
    business_score DECIMAL(5, 2),
    price_score DECIMAL(5, 2),
    total_score DECIMAL(5, 2),
    rank_position INT,
    FOREIGN KEY (evaluation_id) REFERENCES evaluation_project(id)
);

CREATE TABLE IF NOT EXISTS evaluation_expert (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    evaluation_id BIGINT NOT NULL,
    expert_name VARCHAR(100) NOT NULL,
    role VARCHAR(100), -- e.g. 技术专家
    avatar VARCHAR(255),
    is_online BOOLEAN DEFAULT FALSE,
    has_confirmed BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (evaluation_id) REFERENCES evaluation_project(id)
);

CREATE TABLE IF NOT EXISTS evaluation_score (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    evaluation_id BIGINT NOT NULL,
    supplier_id BIGINT NOT NULL, -- Refers to evaluation_supplier.id
    expert_id BIGINT NOT NULL, -- Refers to evaluation_expert.id
    score DECIMAL(5, 2),
    details TEXT, -- JSON string for breakdown
    comment TEXT,
    stage VARCHAR(50), -- BUSINESS, PRICE
    FOREIGN KEY (evaluation_id) REFERENCES evaluation_project(id),
    FOREIGN KEY (supplier_id) REFERENCES evaluation_supplier(id),
    FOREIGN KEY (expert_id) REFERENCES evaluation_expert(id)
);

CREATE TABLE IF NOT EXISTS evaluation_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    evaluation_id BIGINT NOT NULL,
    user_name VARCHAR(100),
    action VARCHAR(255),
    details TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (evaluation_id) REFERENCES evaluation_project(id)
);

CREATE TABLE IF NOT EXISTS evaluation_feedback (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    evaluation_id BIGINT NOT NULL,
    supplier_id BIGINT NOT NULL, -- Refers to evaluation_supplier.id
    expert_name VARCHAR(100),
    question TEXT,
    reply TEXT,
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, REPLIED
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (evaluation_id) REFERENCES evaluation_project(id),
    FOREIGN KEY (supplier_id) REFERENCES evaluation_supplier(id)
);
