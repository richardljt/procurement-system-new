USE procurement_db;

-- Add "My Meetings" menu item
INSERT INTO sys_resource (resource_id, resource_name, path, icon, group_name, sort_order) VALUES
(15, '待我参会', '/my-meetings', 'Users', '待办任务', 2); -- Insert after 'My Tasks'

-- Grant permission to all users
INSERT INTO sys_user_resource_rel (user_id, resource_id) VALUES
('U001', 15),
('U002', 15),
('U004', 15);
