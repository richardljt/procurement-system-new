-- Database Initialization Script for Procurement System

DROP DATABASE IF EXISTS procurement_db;
CREATE DATABASE IF NOT EXISTS procurement_db;
USE procurement_db;

-- 0. Pre-Application Table (New)
CREATE TABLE IF NOT EXISTS pre_application (
    pre_application_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    application_code VARCHAR(30) NOT NULL UNIQUE COMMENT 'Code like PRE-2024-xxx',
    applicant_name VARCHAR(50) NOT NULL,
    department VARCHAR(50),
    apply_date DATE,
    approval_date DATE,
    description VARCHAR(500),
    total_budget DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    used_budget DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    remaining_budget DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(10) DEFAULT 'HKD' COMMENT 'Budget Currency',
    status VARCHAR(20) DEFAULT 'APPROVED',
    
    -- Audit Fields
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    create_user_id VARCHAR(50),
    create_user_name VARCHAR(50),
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    update_user_id VARCHAR(50),
    update_user_name VARCHAR(50)
);

-- 1. Procurement Request Table
CREATE TABLE IF NOT EXISTS procurement_request (
    procurement_request_id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'Primary Key',
    request_code VARCHAR(30) NOT NULL UNIQUE COMMENT 'Request Code like PR-2024-xxx',
    pre_application_id BIGINT COMMENT 'Linked Pre-Application ID',
    department VARCHAR(50) NOT NULL COMMENT 'Department Name',
    applicant_name VARCHAR(50) NOT NULL COMMENT 'Applicant Name',
    procurement_type VARCHAR(30) NOT NULL COMMENT 'Type: FIXED_ASSET, OFFICE_SUPPLY, etc.',
    urgency_level VARCHAR(20) NOT NULL COMMENT 'Urgency: NORMAL, URGENT',
    delivery_address VARCHAR(200) COMMENT 'Delivery Address',
    amount DECIMAL(18, 2) NOT NULL DEFAULT 0.00 COMMENT 'Total Amount (Approx in Base Currency or just Sum)',
    currency VARCHAR(10) DEFAULT 'CNY' COMMENT 'Main Currency (can be mixed in items)',
    background_desc TEXT COMMENT 'Background Description',
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' COMMENT 'Status: DRAFT, APPROVING, APPROVED, REJECTED',
    supplier_selection_type VARCHAR(20) COMMENT 'MULTIPLE or SINGLE',
    single_source_reason TEXT COMMENT 'Reason for single source',
    
    -- New fields for card display
    title VARCHAR(100) COMMENT 'Request Title',
    supplier_count INT DEFAULT 0 COMMENT 'Number of candidates',
    current_approver VARCHAR(50) COMMENT 'Current Approver Name',
    approval_stage VARCHAR(50) COMMENT 'Current Approval Stage',
    approval_progress INT DEFAULT 0 COMMENT 'Progress Percentage',
    approval_total_steps INT DEFAULT 1 COMMENT 'Total Approval Steps',
    approval_current_step INT DEFAULT 1 COMMENT 'Current Approval Step',
    last_update_time DATETIME COMMENT 'Last Status Update Time',
    rejection_reason VARCHAR(200) COMMENT 'Reason for rejection if any',
    
    -- Audit Fields
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    create_user_id VARCHAR(50),
    create_user_name VARCHAR(50),
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    update_user_id VARCHAR(50),
    update_user_name VARCHAR(50)
) COMMENT 'Procurement Request Header';

-- 1.1 Procurement Request Items (New)
CREATE TABLE IF NOT EXISTS procurement_request_item (
    item_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    procurement_request_id BIGINT NOT NULL,
    item_name VARCHAR(200) NOT NULL,
    amount DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(10) DEFAULT 'CNY',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (procurement_request_id) REFERENCES procurement_request(procurement_request_id)
);

-- 1.2 Exchange Rate Table (New)
CREATE TABLE IF NOT EXISTS exchange_rate (
    exchange_rate_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    source_currency VARCHAR(10) NOT NULL,
    target_currency VARCHAR(10) NOT NULL,
    rate DECIMAL(18, 6) NOT NULL,
    effective_date DATE NOT NULL,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Supplier Table
CREATE TABLE IF NOT EXISTS supplier (
    supplier_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    supplier_name VARCHAR(100) NOT NULL,
    credit_code VARCHAR(50) COMMENT 'Unified Social Credit Code',
    contact_phone VARCHAR(20),
    address VARCHAR(200),
    rating DECIMAL(2, 1) COMMENT 'Rating 0.0-5.0',
    tags VARCHAR(200) COMMENT 'Tags separated by comma',
    is_qualified BOOLEAN DEFAULT TRUE,
    
    -- Audit Fields
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    create_user_id VARCHAR(50),
    create_user_name VARCHAR(50),
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    update_user_id VARCHAR(50),
    update_user_name VARCHAR(50)
);

-- 3. Procurement Request - Supplier Relation (Candidates)
CREATE TABLE IF NOT EXISTS procurement_supplier_rel (
    relation_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    procurement_request_id BIGINT NOT NULL,
    supplier_id BIGINT NOT NULL,
    is_selected BOOLEAN DEFAULT FALSE COMMENT 'Is this the final selected supplier',
    
    -- Audit Fields
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    create_user_id VARCHAR(50),
    create_user_name VARCHAR(50),
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    update_user_id VARCHAR(50),
    update_user_name VARCHAR(50),
    
    FOREIGN KEY (procurement_request_id) REFERENCES procurement_request(procurement_request_id),
    FOREIGN KEY (supplier_id) REFERENCES supplier(supplier_id)
);

-- 4. Attachment Table
CREATE TABLE IF NOT EXISTS attachment (
    attachment_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    business_id BIGINT NOT NULL COMMENT 'Related Business ID (e.g. request_id)',
    business_type VARCHAR(30) NOT NULL COMMENT 'Business Type (e.g. PROCUREMENT_REQUEST)',
    file_name VARCHAR(200) NOT NULL,
    file_path VARCHAR(500) NOT NULL COMMENT 'S3 Key or Local Path',
    file_size BIGINT,
    file_type VARCHAR(50),
    
    -- Audit Fields
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    create_user_id VARCHAR(50),
    create_user_name VARCHAR(50),
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    update_user_id VARCHAR(50),
    update_user_name VARCHAR(50)
);

-- 5. Approval Log
CREATE TABLE IF NOT EXISTS approval_log (
    approval_log_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    procurement_request_id BIGINT NOT NULL,
    node_name VARCHAR(50) NOT NULL COMMENT 'Current Node Name',
    approver_name VARCHAR(50),
    approver_id VARCHAR(50),
    action VARCHAR(20) COMMENT 'APPROVE, REJECT',
    comment VARCHAR(500),
    
    -- Audit Fields
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    create_user_id VARCHAR(50),
    create_user_name VARCHAR(50),
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    update_user_id VARCHAR(50),
    update_user_name VARCHAR(50)
);

-- Initial Data

-- Exchange Rates (Base HKD)
INSERT INTO exchange_rate (source_currency, target_currency, rate, effective_date) VALUES
('CNY', 'HKD', 1.09, '2024-01-01'),
('USD', 'HKD', 7.82, '2024-01-01'),
('EUR', 'HKD', 8.50, '2024-01-01'),
('JPY', 'HKD', 0.053, '2024-01-01'),
('HKD', 'HKD', 1.00, '2024-01-01');

-- Pre Applications
INSERT INTO pre_application (application_code, applicant_name, department, apply_date, approval_date, description, total_budget, used_budget, remaining_budget, currency, create_user_name) VALUES
('PRE-2024-00089', 'Zhang Ming', 'R&D', '2024-01-05', '2024-01-06', 'Office equipment for team expansion', 100000.00, 15000.00, 85000.00, 'HKD', 'Zhang Ming'),
('PRE-2024-00092', 'Li Hua', 'Marketing', '2024-01-10', '2024-01-12', 'Q1 Marketing Campaign Materials', 500000.00, 120000.00, 380000.00, 'HKD', 'Li Hua');

-- Suppliers
INSERT INTO supplier (supplier_name, credit_code, contact_phone, address, rating, tags, create_user_name) VALUES 
('Lenovo Technology', '91110000123456789X', '010-12345678', 'Beijing Haidian', 4.8, 'IT Equipment,Office', 'System'),
('Dell China', '91110000987654321A', '010-87654321', 'Shanghai Pudong', 4.9, 'Computer,Server', 'System'),
('HP China', '91110000456789123B', '021-34567890', 'Shenzhen Nanshan', 4.7, 'Printer,Accessories', 'System');

INSERT INTO procurement_request (request_code, department, applicant_name, procurement_type, urgency_level, amount, status, create_time, create_user_name, title, supplier_count, current_approver, approval_stage, approval_progress, approval_total_steps, approval_current_step, last_update_time, rejection_reason) VALUES
('PR-2024-00157', 'R&D Department', 'Zhang Ming', 'FIXED_ASSET', 'NORMAL', 85000.00, 'APPROVING', '2024-01-15 09:30:00', 'Zhang Ming', '办公设备采购申请', 3, '李经理', '李经理审批中', 50, 2, 1, '2024-01-15 14:23:00', NULL),
('PR-2024-00145', 'R&D Department', 'Zhang Ming', 'FIXED_ASSET', 'URGENT', 320000.00, 'APPROVED', '2024-01-10 14:20:00', 'Zhang Ming', '服务器设备采购', 5, NULL, '审批已完成', 100, 2, 2, '2024-01-12 09:15:00', NULL),
('PR-2024-00132', 'R&D Department', 'Zhang Ming', 'FIXED_ASSET', 'NORMAL', 180000.00, 'REJECTED', '2024-01-05 10:00:00', 'Zhang Ming', '网络设备升级采购', 4, '李经理', '李经理驳回', 30, 2, 1, '2024-01-05 16:00:00', '技术方案不完整,需补充详细配置说明'),
('DRAFT-2024-003', 'R&D Department', 'Zhang Ming', 'OFFICE_SUPPLY', 'NORMAL', 45000.00, 'DRAFT', '2024-01-14 16:42:00', 'Zhang Ming', '办公家具采购', 0, NULL, '草稿状态', 0, 1, 0, '2024-01-14 16:42:00', NULL);

-- 6. Requirement Review Meeting Table
CREATE TABLE IF NOT EXISTS requirement_review_meeting (
    meeting_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL COMMENT 'Meeting Title',
    project_name VARCHAR(200) COMMENT 'Project Name (or linked project)',
    project_no VARCHAR(50) COMMENT 'Project Number',
    department VARCHAR(50) COMMENT 'Department',
    amount DECIMAL(18, 2) DEFAULT 0.00 COMMENT 'Amount',
    start_time DATETIME COMMENT 'Meeting Start Time',
    end_time DATETIME COMMENT 'Meeting End Time',
    location VARCHAR(200) COMMENT 'Meeting Location',
    organizer_name VARCHAR(50) COMMENT 'Organizer Name',
    status VARCHAR(20) DEFAULT 'PENDING' COMMENT 'Status: PENDING, SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED',
    
    -- Audit Fields
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    create_user_id VARCHAR(50),
    create_user_name VARCHAR(50),
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    update_user_id VARCHAR(50),
    update_user_name VARCHAR(50)
);

-- 7. Meeting Expert Relation
CREATE TABLE IF NOT EXISTS meeting_expert_rel (
    relation_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    meeting_id BIGINT NOT NULL,
    expert_name VARCHAR(50) NOT NULL,
    expert_avatar VARCHAR(500) COMMENT 'Avatar URL',
    
    -- Audit Fields
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    create_user_id VARCHAR(50),
    create_user_name VARCHAR(50),
    
    FOREIGN KEY (meeting_id) REFERENCES requirement_review_meeting(meeting_id)
);

-- Initial Data for Meetings
INSERT INTO requirement_review_meeting (title, project_name, project_no, department, amount, start_time, end_time, location, organizer_name, status, create_user_name) VALUES
('供应链系统二期需求评审', '供应链系统二期', 'PR-2024-00142', '技术研发部', 1580000.00, '2024-01-20 10:00:00', '2024-01-20 12:00:00', '第二会议室', '王建国', 'SCHEDULED', 'System'),
('软件许可证采购', '软件许可证采购', 'PR-2024-00138', '技术研发部', 28000.00, NULL, NULL, NULL, '李思思', 'PENDING', 'System'),
('云存储服务采购', '云存储服务采购', 'PR-2024-00120', '技术研发部', 150000.00, '2024-01-10 14:00:00', '2024-01-10 15:30:00', '第一会议室', '张伟', 'COMPLETED', 'System'),
('数据库软件采购', '数据库软件采购', 'PR-2024-00115', '技术研发部', 280000.00, '2024-01-08 09:30:00', '2024-01-08 11:00:00', '第三会议室', '赵强', 'COMPLETED', 'System'),
('办公设备批量采购', '办公设备批量采购', 'PR-2024-00156', '行政部', 56000.00, NULL, NULL, NULL, '孙丽', 'PENDING', 'System');

INSERT INTO meeting_expert_rel (meeting_id, expert_name, expert_avatar) VALUES
(1, 'Expert A', 'https://api.dicebear.com/7.x/avataaars/svg?seed=1'),
(1, 'Expert B', 'https://api.dicebear.com/7.x/avataaars/svg?seed=2'),
(1, 'Expert C', 'https://api.dicebear.com/7.x/avataaars/svg?seed=3'),
(3, 'Expert D', 'https://api.dicebear.com/7.x/avataaars/svg?seed=4'),
(3, 'Expert E', 'https://api.dicebear.com/7.x/avataaars/svg?seed=5'),
(3, 'Expert F', 'https://api.dicebear.com/7.x/avataaars/svg?seed=6'),
(4, 'Expert G', 'https://api.dicebear.com/7.x/avataaars/svg?seed=7'),
(4, 'Expert H', 'https://api.dicebear.com/7.x/avataaars/svg?seed=8');
