USE procurement_db;

-- Clear existing data (optional, be careful in prod)
-- DELETE FROM evaluation_feedback;
-- DELETE FROM evaluation_log;
-- DELETE FROM evaluation_score;
-- DELETE FROM evaluation_expert;
-- DELETE FROM evaluation_supplier;
-- DELETE FROM evaluation_project;

-- 1. Project
INSERT INTO evaluation_project (project_code, title, status, current_stage, organizer_name)
VALUES ('EVAL-2024-001', '办公设备采购评标', 'ONGOING', 'BUSINESS', '张明');

SET @eval_id = LAST_INSERT_ID();

-- 2. Suppliers
INSERT INTO evaluation_supplier (evaluation_id, supplier_name, supplier_code, business_score, rank_position) VALUES 
(@eval_id, '科技有限公司', 'A1', 88.6, 1),
(@eval_id, '智能设备公司', 'A2', 86.5, 2),
(@eval_id, '创新科技集团', 'A3', 84.5, 3),
(@eval_id, '优质办公设备', 'A4', 82.3, 4),
(@eval_id, '精英办公用品', 'A5', 80.5, 5),
(@eval_id, '专业设备供应', 'A6', NULL, NULL),
(@eval_id, '卓越办公方案', 'A7', NULL, NULL),
(@eval_id, '高端设备提供商', 'A8', NULL, NULL);

-- 3. Experts
INSERT INTO evaluation_expert (evaluation_id, expert_name, role, is_online, has_confirmed, avatar) VALUES
(@eval_id, '张教授', '技术专家', TRUE, TRUE, 'avatar-4.jpg'),
(@eval_id, '李专家', '财务专家', TRUE, TRUE, 'avatar-1.jpg'),
(@eval_id, '王工程师', '技术专家', TRUE, FALSE, 'avatar-2.jpg'),
(@eval_id, '赵顾问', '法律专家', TRUE, TRUE, 'avatar-3.jpg'),
(@eval_id, '陈主任', '采购专家', TRUE, TRUE, 'avatar-5.jpg');

-- 4. Logs
INSERT INTO evaluation_log (evaluation_id, user_name, action, details, timestamp) VALUES
(@eval_id, '张教授', '提交评分', '张教授提交了科技有限公司的商务评分', DATE_SUB(NOW(), INTERVAL 15 MINUTE)),
(@eval_id, '管理员', '启动评标', '管理员启动了商务评标阶段', DATE_SUB(NOW(), INTERVAL 2 HOUR));

-- 5. Feedback
-- Need supplier IDs
SET @sup_4 = (SELECT id FROM evaluation_supplier WHERE evaluation_id = @eval_id AND supplier_code = 'A4');
SET @sup_6 = (SELECT id FROM evaluation_supplier WHERE evaluation_id = @eval_id AND supplier_code = 'A6');
SET @sup_8 = (SELECT id FROM evaluation_supplier WHERE evaluation_id = @eval_id AND supplier_code = 'A8');

INSERT INTO evaluation_feedback (evaluation_id, supplier_id, expert_name, question, status) VALUES
(@eval_id, @sup_4, '王工程师', '设备的质保期限是多久？是否提供延保服务？', 'PENDING'),
(@eval_id, @sup_6, '李专家', '报价中是否包含安装调试费用？如果不包含，请单独列明费用明细。', 'PENDING'),
(@eval_id, @sup_8, '张教授', '请问贵公司提供的设备是否包含3年的免费维护服务？标书中未明确说明。', 'PENDING');

-- 6. Scores (Sample for A1)
SET @sup_1 = (SELECT id FROM evaluation_supplier WHERE evaluation_id = @eval_id AND supplier_code = 'A1');
SET @exp_1 = (SELECT id FROM evaluation_expert WHERE evaluation_id = @eval_id AND expert_name = '张教授');

INSERT INTO evaluation_score (evaluation_id, supplier_id, expert_id, score, details) VALUES
(@eval_id, @sup_1, @exp_1, 88.5, '{"technical": 15, "innovation": 12, "feasibility": 9}');
