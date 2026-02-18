USE procurement_db;

-- 1. Add user_id column to expert table if it doesn't exist
-- Using a stored procedure to check column existence to avoid errors
DROP PROCEDURE IF EXISTS AddUserIdToExpert;
DELIMITER //
CREATE PROCEDURE AddUserIdToExpert()
BEGIN
    IF NOT EXISTS (
        SELECT * FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = 'procurement_db' 
        AND TABLE_NAME = 'expert' 
        AND COLUMN_NAME = 'user_id'
    ) THEN
        ALTER TABLE expert ADD COLUMN user_id VARCHAR(50);
    END IF;
END //
DELIMITER ;
CALL AddUserIdToExpert();
DROP PROCEDURE AddUserIdToExpert;

-- 2. Ensure Expert Users exist in sys_user
INSERT IGNORE INTO sys_user (user_id, username, password, real_name, role, avatar) VALUES 
('E001', 'Li Ming', '123456', '李明', 'EXPERT', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'),
('E002', 'Wang Qiang', '123456', '王强', 'EXPERT', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka');

-- 3. Ensure these users have access to Expert Library (or at least some menu)
-- Giving them "My Meetings" access as per add_experts.sql
INSERT IGNORE INTO sys_resource (resource_id, resource_name, path, icon, group_name, sort_order) VALUES
(15, '待我参会', '/my-meetings', 'Users', '待办任务', 2);

INSERT IGNORE INTO sys_user_resource_rel (user_id, resource_id) VALUES
('E001', 15),
('E002', 15);

-- 4. Insert or Update Experts in expert table linked to these users
-- Li Ming
INSERT INTO expert (name, department, entry_date, industries, level, avatar, create_user_id, create_user_name, user_id)
SELECT '李明', '技术部', '2023-01-01', '计算机,人工智能', '高级专家', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix', 'system', 'System', 'E001'
WHERE NOT EXISTS (SELECT 1 FROM expert WHERE user_id = 'E001');

-- Wang Qiang
INSERT INTO expert (name, department, entry_date, industries, level, avatar, create_user_id, create_user_name, user_id)
SELECT '王强', '财务部', '2023-02-15', '财务审计,风险控制', '资深专家', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka', 'system', 'System', 'E002'
WHERE NOT EXISTS (SELECT 1 FROM expert WHERE user_id = 'E002');
