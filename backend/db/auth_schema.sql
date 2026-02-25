USE procurement_db;

DROP TABLE IF EXISTS sys_user_resource_rel;
DROP TABLE IF EXISTS sys_resource;
DROP TABLE IF EXISTS sys_user;

CREATE TABLE sys_user (
    user_id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL, -- Plain text for demo
    real_name VARCHAR(50),
    avatar VARCHAR(200),
    role VARCHAR(20), -- HEAD, MANAGER, EMPLOYEE, SUPPLIER
    department VARCHAR(50),
    supplier_id BIGINT
);

CREATE TABLE sys_resource (
    resource_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    resource_name VARCHAR(50) NOT NULL,
    resource_type VARCHAR(20) DEFAULT 'MENU',
    path VARCHAR(100),
    icon VARCHAR(50),
    parent_id BIGINT,
    sort_order INT,
    group_name VARCHAR(50) -- For grouping in sidebar
);

CREATE TABLE sys_user_resource_rel (
    user_id VARCHAR(50) NOT NULL,
    resource_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, resource_id)
);

INSERT INTO sys_user (user_id, username, password, real_name, role) VALUES 
('U001', 'Zhang Ming', '123456', 'Zhang Ming', 'EMPLOYEE'),
('U002', 'Li Si', '123456', 'Li Si', 'MANAGER'),
('U004', 'Henry', '123456', 'Henry', 'HEAD'),
('E001', 'Li Ming', '123456', '李明', 'EXPERT'),
('E002', 'Wang Qiang', '123456', '王强', 'EXPERT'),
('E003', 'Zhang Wei', '123456', '张伟', 'EXPERT'),
('E004', 'Chen Jing', '123456', '陈静', 'EXPERT');

-- Resources
-- Group: 待办任务
INSERT INTO sys_resource (resource_id, resource_name, path, icon, group_name, sort_order) VALUES
(1, '待我处理', '/tasks', 'Clock', '待办任务', 1),
(16, '待我参会', '/my-meetings', 'Users', '待办任务', 2),
(2, '抄送我的', '/cc-me', 'Eye', '待办任务', 3),
(3, '我的收藏', '/favorites', 'Star', '待办任务', 4);

-- Group: 采购申请管理
INSERT INTO sys_resource (resource_id, resource_name, path, icon, group_name, sort_order) VALUES
(4, '我的申请', '/procurement/list', 'FileText', '采购申请管理', 1),
(5, '新建申请', '/create', 'Plus', '采购申请管理', 2),
(6, '历史申请', '/history', 'History', '采购申请管理', 3);

-- Group: 集采办管理
INSERT INTO sys_resource (resource_id, resource_name, path, icon, group_name, sort_order) VALUES
(7, '需求评审会管理', '/meeting/requirement-review', 'Users', '集采办管理', 1),
(15, '投标管理', '/bid/list', 'Gavel', '集采办管理', 2),
(9, '专家库管理', '/expert/list', 'Users', '集采办管理', 4);

-- Group: 合同管理
INSERT INTO sys_resource (resource_id, resource_name, path, icon, group_name, sort_order) VALUES
(10, '合同归档管理', '/contract/archive', 'FileSignature', '合同管理', 1),
(11, '合同档案库', '/contract/library', 'FolderOpen', '合同管理', 2);

-- Group: 快捷筛选
INSERT INTO sys_resource (resource_id, resource_name, path, icon, group_name, sort_order) VALUES
(12, '紧急采购', '/filter/urgent', 'Filter', '快捷筛选', 1),
(13, '即将超期', '/filter/overdue', 'CalendarX', '快捷筛选', 2),
(14, '统计报表', '/stats', 'LineChart', '快捷筛选', 3);

-- Permissions
-- Henry (U004): All
INSERT INTO sys_user_resource_rel (user_id, resource_id) SELECT 'U004', resource_id FROM sys_resource;

-- All other users (Zhang Ming, Li Si, Experts): All EXCEPT "集采办管理" (Group)
INSERT INTO sys_user_resource_rel (user_id, resource_id) 
SELECT user_id, resource_id 
FROM sys_user u, sys_resource r 
WHERE u.user_id != 'U004' 
AND r.group_name != '集采办管理';

-- Update ownership
UPDATE procurement_request SET create_user_id = 'U001', create_user_name = 'Zhang Ming' WHERE applicant_name = 'Zhang Ming';
UPDATE pre_application SET create_user_id = 'U001', create_user_name = 'Zhang Ming' WHERE applicant_name = 'Zhang Ming';

-- Add a sample supplier user (e.g., Zhang San from Supplier with ID 1)
INSERT INTO sys_user (user_id, username, password, real_name, role, supplier_id) VALUES 
('S001', 'zhangsan', '123456', '张三', 'SUPPLIER', 1) ON DUPLICATE KEY UPDATE real_name = '张三', role = 'SUPPLIER', supplier_id = 1;
