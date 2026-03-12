ALTER TABLE requirement_review_meeting
ADD COLUMN expert_selection_mode VARCHAR(20) DEFAULT 'MANUAL' COMMENT '专家选择方式';
