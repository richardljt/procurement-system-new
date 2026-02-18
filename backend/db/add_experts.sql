USE procurement_db;

-- Add Experts to System User
INSERT INTO sys_user (user_id, username, password, real_name, role, avatar) VALUES 
('E001', 'Li Ming', '123456', '李明', 'EXPERT', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'),
('E002', 'Wang Qiang', '123456', '王强', 'EXPERT', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka'),
('E003', 'Zhang Wei', '123456', '张伟', 'EXPERT', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jude'),
('E004', 'Chen Jing', '123456', '陈静', 'EXPERT', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria');

-- Grant permissions for Experts
-- Experts only need 'My Meetings' (resource_id=15 from previous step)
INSERT INTO sys_user_resource_rel (user_id, resource_id) VALUES
('E001', 15),
('E002', 15),
('E003', 15),
('E004', 15);

-- Create meeting_participant table to link meetings and experts
CREATE TABLE IF NOT EXISTS meeting_participant (
    participant_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    meeting_id BIGINT NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    user_name VARCHAR(50),
    role VARCHAR(20) DEFAULT 'EXPERT', -- EXPERT, GUEST
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_meeting_user (meeting_id, user_id),
    FOREIGN KEY (meeting_id) REFERENCES requirement_review_meeting(meeting_id)
);

-- Init some dummy participants for existing meetings (assuming meeting_id 1 exists)
-- This is optional, but helps demo.
-- INSERT INTO meeting_participant (meeting_id, user_id, user_name) VALUES (1, 'E001', '李明');
