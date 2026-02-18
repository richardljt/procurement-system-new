USE procurement_db;

CREATE TABLE IF NOT EXISTS process_instance (
    instance_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    business_key VARCHAR(50) NOT NULL COMMENT 'Business Key e.g. PR-xxx',
    business_type VARCHAR(50) NOT NULL DEFAULT 'PROCUREMENT',
    status VARCHAR(20) NOT NULL DEFAULT 'RUNNING' COMMENT 'RUNNING, COMPLETED, REJECTED',
    initiator_id VARCHAR(50),
    initiator_name VARCHAR(50),
    start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    end_time DATETIME,
    
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS process_task (
    task_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    instance_id BIGINT NOT NULL,
    node_name VARCHAR(100) NOT NULL,
    node_type VARCHAR(20) DEFAULT 'APPROVAL' COMMENT 'START, APPROVAL, END',
    approver_id VARCHAR(50),
    approver_name VARCHAR(50),
    status VARCHAR(20) DEFAULT 'PENDING' COMMENT 'PENDING, APPROVED, REJECTED',
    comment VARCHAR(500),
    sequence INT NOT NULL DEFAULT 1,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    handle_time DATETIME,
    
    FOREIGN KEY (instance_id) REFERENCES process_instance(instance_id)
);
