ALTER TABLE procurement_request ADD COLUMN attachment_ids VARCHAR(255), ADD COLUMN single_source_attachment_ids VARCHAR(255);
CREATE TABLE `file_record` (
  `file_id` bigint NOT NULL,
  `module` varchar(255) DEFAULT NULL,
  `original_file_name` varchar(255) DEFAULT NULL,
  `file_path` varchar(255) DEFAULT NULL,
  `file_size` bigint DEFAULT NULL,
  `upload_time` datetime DEFAULT NULL,
  `create_user_id` varchar(255) DEFAULT NULL,
  `create_user_name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`file_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;