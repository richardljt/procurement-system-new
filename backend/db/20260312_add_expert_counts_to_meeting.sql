ALTER TABLE requirement_review_meeting
ADD COLUMN num_main_experts INT DEFAULT 3 COMMENT '正选专家数量',
ADD COLUMN num_backup_experts INT DEFAULT 2 COMMENT '备选专家数量';
