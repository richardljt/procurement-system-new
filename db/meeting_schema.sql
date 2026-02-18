
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
