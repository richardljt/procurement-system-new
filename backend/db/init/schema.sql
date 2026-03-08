
/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
DROP TABLE IF EXISTS `approval_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `approval_log` (
  `approval_log_id` bigint NOT NULL AUTO_INCREMENT,
  `procurement_request_id` bigint NOT NULL,
  `node_name` varchar(50) NOT NULL COMMENT 'Current Node Name',
  `approver_name` varchar(50) DEFAULT NULL,
  `approver_id` varchar(50) DEFAULT NULL,
  `action` varchar(20) DEFAULT NULL COMMENT 'APPROVE, REJECT',
  `comment` varchar(500) DEFAULT NULL,
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `create_user_id` varchar(50) DEFAULT NULL,
  `create_user_name` varchar(50) DEFAULT NULL,
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `update_user_id` varchar(50) DEFAULT NULL,
  `update_user_name` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`approval_log_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `attachment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `attachment` (
  `attachment_id` bigint NOT NULL AUTO_INCREMENT,
  `business_id` bigint NOT NULL COMMENT 'Related Business ID (e.g. request_id)',
  `business_type` varchar(30) NOT NULL COMMENT 'Business Type (e.g. PROCUREMENT_REQUEST)',
  `file_name` varchar(200) NOT NULL,
  `file_path` varchar(500) NOT NULL COMMENT 'S3 Key or Local Path',
  `file_size` bigint DEFAULT NULL,
  `file_type` varchar(50) DEFAULT NULL,
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `create_user_id` varchar(50) DEFAULT NULL,
  `create_user_name` varchar(50) DEFAULT NULL,
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `update_user_id` varchar(50) DEFAULT NULL,
  `update_user_name` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`attachment_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `bid`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bid` (
  `bid_id` bigint NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `procurement_request_id` bigint DEFAULT NULL,
  `budget` decimal(19,2) DEFAULT NULL,
  `deadline` datetime DEFAULT NULL,
  `description` text,
  `notification_methods` varchar(50) DEFAULT NULL,
  `email_subject` varchar(255) DEFAULT NULL,
  `email_body` text,
  `status` varchar(50) DEFAULT 'draft',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `create_user_id` varchar(50) DEFAULT NULL,
  `create_user_name` varchar(100) DEFAULT NULL,
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `update_user_id` varchar(50) DEFAULT NULL,
  `update_user_name` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`bid_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `bid_attachment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bid_attachment` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `bid_id` bigint NOT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `file_url` varchar(500) DEFAULT NULL,
  `file_size` varchar(50) DEFAULT NULL,
  `file_type` varchar(50) DEFAULT NULL,
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `bid_supplier`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bid_supplier` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `bid_id` bigint NOT NULL,
  `supplier_id` bigint NOT NULL,
  `is_selected` tinyint(1) DEFAULT '1',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `contract`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `contract` (
  `contract_id` bigint NOT NULL AUTO_INCREMENT,
  `procurement_request_id` bigint NOT NULL,
  `contract_name` varchar(255) NOT NULL,
  `contract_code` varchar(100) DEFAULT NULL,
  `supplier_id` bigint DEFAULT NULL,
  `amount` decimal(15,2) DEFAULT NULL,
  `signing_date` datetime DEFAULT NULL,
  `attachment_url` varchar(500) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'DRAFT',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `create_user_id` varchar(50) DEFAULT NULL,
  `create_user_name` varchar(100) DEFAULT NULL,
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `update_user_id` varchar(50) DEFAULT NULL,
  `update_user_name` varchar(100) DEFAULT NULL,
  `signer_name` varchar(100) DEFAULT NULL,
  `signer_contact` varchar(100) DEFAULT NULL,
  `vendor_signer_name` varchar(100) DEFAULT NULL,
  `vendor_signer_contact` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`contract_id`),
  KEY `idx_procurement_request_id` (`procurement_request_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `evaluation_expert`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `evaluation_expert` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `evaluation_id` bigint NOT NULL,
  `expert_name` varchar(100) NOT NULL,
  `role` varchar(100) DEFAULT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `is_online` tinyint(1) DEFAULT '0',
  `has_confirmed` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `evaluation_id` (`evaluation_id`),
  CONSTRAINT `evaluation_expert_ibfk_1` FOREIGN KEY (`evaluation_id`) REFERENCES `evaluation_project` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `evaluation_feedback`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `evaluation_feedback` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `evaluation_id` bigint NOT NULL,
  `supplier_id` bigint NOT NULL,
  `expert_name` varchar(100) DEFAULT NULL,
  `question` text,
  `reply` text,
  `status` varchar(50) DEFAULT 'PENDING',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `evaluation_id` (`evaluation_id`),
  KEY `supplier_id` (`supplier_id`),
  CONSTRAINT `evaluation_feedback_ibfk_1` FOREIGN KEY (`evaluation_id`) REFERENCES `evaluation_project` (`id`),
  CONSTRAINT `evaluation_feedback_ibfk_2` FOREIGN KEY (`supplier_id`) REFERENCES `evaluation_supplier` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `evaluation_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `evaluation_log` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `evaluation_id` bigint NOT NULL,
  `user_name` varchar(100) DEFAULT NULL,
  `action` varchar(255) DEFAULT NULL,
  `details` text,
  `timestamp` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `evaluation_id` (`evaluation_id`),
  CONSTRAINT `evaluation_log_ibfk_1` FOREIGN KEY (`evaluation_id`) REFERENCES `evaluation_project` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=59 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `evaluation_message`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `evaluation_message` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `evaluation_id` bigint NOT NULL,
  `supplier_id` bigint NOT NULL,
  `sender_id` bigint DEFAULT NULL,
  `sender_name` varchar(100) DEFAULT NULL,
  `sender_role` varchar(50) DEFAULT NULL,
  `content` text,
  `parent_id` bigint DEFAULT NULL,
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `attachment_name` varchar(255) DEFAULT NULL,
  `attachment_path` varchar(255) DEFAULT NULL,
  `stage` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `evaluation_project`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `evaluation_project` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `project_code` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `bid_id` bigint DEFAULT NULL,
  `status` varchar(50) DEFAULT 'ONGOING',
  `current_stage` varchar(50) DEFAULT 'BUSINESS',
  `organizer_name` varchar(100) DEFAULT NULL,
  `start_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `project_code` (`project_code`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `evaluation_score`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `evaluation_score` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `evaluation_id` bigint NOT NULL,
  `supplier_id` bigint NOT NULL,
  `expert_id` bigint NOT NULL,
  `score` decimal(5,2) DEFAULT NULL,
  `details` text,
  `comment` text,
  `stage` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `evaluation_id` (`evaluation_id`),
  KEY `supplier_id` (`supplier_id`),
  KEY `expert_id` (`expert_id`),
  CONSTRAINT `evaluation_score_ibfk_1` FOREIGN KEY (`evaluation_id`) REFERENCES `evaluation_project` (`id`),
  CONSTRAINT `evaluation_score_ibfk_2` FOREIGN KEY (`supplier_id`) REFERENCES `evaluation_supplier` (`id`),
  CONSTRAINT `evaluation_score_ibfk_3` FOREIGN KEY (`expert_id`) REFERENCES `evaluation_expert` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `evaluation_supplier`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `evaluation_supplier` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `evaluation_id` bigint NOT NULL,
  `supplier_id` bigint DEFAULT NULL,
  `supplier_name` varchar(255) NOT NULL,
  `supplier_code` varchar(50) DEFAULT NULL,
  `business_score` decimal(5,2) DEFAULT NULL,
  `price_score` decimal(5,2) DEFAULT NULL,
  `total_score` decimal(5,2) DEFAULT NULL,
  `rank_position` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `evaluation_id` (`evaluation_id`),
  CONSTRAINT `evaluation_supplier_ibfk_1` FOREIGN KEY (`evaluation_id`) REFERENCES `evaluation_project` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `exchange_rate`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `exchange_rate` (
  `exchange_rate_id` bigint NOT NULL AUTO_INCREMENT,
  `source_currency` varchar(10) NOT NULL,
  `target_currency` varchar(10) NOT NULL,
  `rate` decimal(18,6) NOT NULL,
  `effective_date` date NOT NULL,
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`exchange_rate_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `expert`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `expert` (
  `expert_id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `department` varchar(255) DEFAULT NULL,
  `entry_date` date DEFAULT NULL,
  `industries` varchar(1024) DEFAULT NULL,
  `level` varchar(50) DEFAULT NULL,
  `avatar` varchar(512) DEFAULT NULL,
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `create_user_id` varchar(50) DEFAULT NULL,
  `create_user_name` varchar(255) DEFAULT NULL,
  `user_id` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`expert_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `meeting_application_rel`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `meeting_application_rel` (
  `relation_id` bigint NOT NULL AUTO_INCREMENT,
  `meeting_id` bigint NOT NULL,
  `procurement_request_id` bigint NOT NULL,
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`relation_id`),
  KEY `idx_meeting_id` (`meeting_id`),
  KEY `idx_procurement_request_id` (`procurement_request_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `meeting_expert_rel`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `meeting_expert_rel` (
  `relation_id` bigint NOT NULL AUTO_INCREMENT,
  `meeting_id` bigint NOT NULL,
  `expert_name` varchar(50) NOT NULL,
  `expert_avatar` varchar(500) DEFAULT NULL COMMENT 'Avatar URL',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `create_user_id` varchar(50) DEFAULT NULL,
  `create_user_name` varchar(50) DEFAULT NULL,
  `expert_id` bigint DEFAULT NULL,
  `type` varchar(20) DEFAULT 'MAIN',
  PRIMARY KEY (`relation_id`),
  KEY `meeting_id` (`meeting_id`),
  CONSTRAINT `meeting_expert_rel_ibfk_1` FOREIGN KEY (`meeting_id`) REFERENCES `requirement_review_meeting` (`meeting_id`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `meeting_material`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `meeting_material` (
  `material_id` bigint NOT NULL AUTO_INCREMENT,
  `meeting_id` bigint NOT NULL,
  `file_name` varchar(200) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_size` bigint DEFAULT NULL,
  `uploader_id` varchar(50) DEFAULT NULL,
  `uploader_name` varchar(50) DEFAULT NULL,
  `upload_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`material_id`),
  KEY `meeting_id` (`meeting_id`),
  CONSTRAINT `meeting_material_ibfk_1` FOREIGN KEY (`meeting_id`) REFERENCES `requirement_review_meeting` (`meeting_id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `meeting_participant`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `meeting_participant` (
  `participant_id` bigint NOT NULL AUTO_INCREMENT,
  `meeting_id` bigint NOT NULL,
  `user_id` varchar(50) NOT NULL,
  `user_name` varchar(50) DEFAULT NULL,
  `role` varchar(20) DEFAULT 'EXPERT',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`participant_id`),
  UNIQUE KEY `uk_meeting_user` (`meeting_id`,`user_id`),
  CONSTRAINT `meeting_participant_ibfk_1` FOREIGN KEY (`meeting_id`) REFERENCES `requirement_review_meeting` (`meeting_id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `meeting_question`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `meeting_question` (
  `question_id` bigint NOT NULL AUTO_INCREMENT,
  `meeting_id` bigint NOT NULL,
  `content` text NOT NULL,
  `asker_id` varchar(50) DEFAULT NULL,
  `asker_name` varchar(50) DEFAULT NULL,
  `is_anonymous` tinyint(1) DEFAULT '0',
  `status` varchar(20) DEFAULT 'PENDING' COMMENT 'PENDING, ANSWERED',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `attachment_name` varchar(200) DEFAULT NULL,
  `attachment_path` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`question_id`),
  KEY `meeting_id` (`meeting_id`),
  CONSTRAINT `meeting_question_ibfk_1` FOREIGN KEY (`meeting_id`) REFERENCES `requirement_review_meeting` (`meeting_id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `meeting_reply`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `meeting_reply` (
  `reply_id` bigint NOT NULL AUTO_INCREMENT,
  `question_id` bigint NOT NULL,
  `content` text NOT NULL,
  `replier_id` varchar(50) DEFAULT NULL,
  `replier_name` varchar(50) DEFAULT NULL,
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `attachment_name` varchar(200) DEFAULT NULL,
  `attachment_path` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`reply_id`),
  KEY `question_id` (`question_id`),
  CONSTRAINT `meeting_reply_ibfk_1` FOREIGN KEY (`question_id`) REFERENCES `meeting_question` (`question_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `meeting_vote`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `meeting_vote` (
  `vote_id` bigint NOT NULL AUTO_INCREMENT,
  `meeting_id` bigint NOT NULL,
  `round` int NOT NULL DEFAULT '1',
  `voter_id` varchar(50) NOT NULL,
  `voter_name` varchar(50) DEFAULT NULL,
  `score` int DEFAULT NULL,
  `comment` varchar(500) DEFAULT NULL,
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`vote_id`),
  UNIQUE KEY `uk_meeting_round_voter` (`meeting_id`,`round`,`voter_id`),
  CONSTRAINT `meeting_vote_ibfk_1` FOREIGN KEY (`meeting_id`) REFERENCES `requirement_review_meeting` (`meeting_id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `pre_application`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pre_application` (
  `pre_application_id` bigint NOT NULL AUTO_INCREMENT,
  `application_code` varchar(30) NOT NULL COMMENT 'Code like PRE-2024-xxx',
  `applicant_name` varchar(50) NOT NULL,
  `department` varchar(50) DEFAULT NULL,
  `apply_date` date DEFAULT NULL,
  `approval_date` date DEFAULT NULL,
  `description` varchar(500) DEFAULT NULL,
  `total_budget` decimal(18,2) NOT NULL DEFAULT '0.00',
  `used_budget` decimal(18,2) NOT NULL DEFAULT '0.00',
  `remaining_budget` decimal(18,2) NOT NULL DEFAULT '0.00',
  `currency` varchar(10) DEFAULT 'HKD' COMMENT 'Budget Currency',
  `status` varchar(20) DEFAULT 'APPROVED',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `create_user_id` varchar(50) DEFAULT NULL,
  `create_user_name` varchar(50) DEFAULT NULL,
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `update_user_id` varchar(50) DEFAULT NULL,
  `update_user_name` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`pre_application_id`),
  UNIQUE KEY `application_code` (`application_code`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `process_instance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `process_instance` (
  `instance_id` bigint NOT NULL AUTO_INCREMENT,
  `business_key` varchar(50) NOT NULL COMMENT 'Business Key e.g. PR-xxx',
  `business_type` varchar(50) NOT NULL DEFAULT 'PROCUREMENT',
  `status` varchar(20) NOT NULL DEFAULT 'RUNNING' COMMENT 'RUNNING, COMPLETED, REJECTED',
  `initiator_id` varchar(50) DEFAULT NULL,
  `initiator_name` varchar(50) DEFAULT NULL,
  `start_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `end_time` datetime DEFAULT NULL,
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`instance_id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `process_task`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `process_task` (
  `task_id` bigint NOT NULL AUTO_INCREMENT,
  `instance_id` bigint NOT NULL,
  `node_name` varchar(100) NOT NULL,
  `node_type` varchar(20) DEFAULT 'APPROVAL' COMMENT 'START, APPROVAL, END',
  `approver_id` varchar(50) DEFAULT NULL,
  `approver_name` varchar(50) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'PENDING' COMMENT 'PENDING, APPROVED, REJECTED',
  `comment` varchar(500) DEFAULT NULL,
  `sequence` int NOT NULL DEFAULT '1',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `handle_time` datetime DEFAULT NULL,
  PRIMARY KEY (`task_id`),
  KEY `instance_id` (`instance_id`),
  CONSTRAINT `process_task_ibfk_1` FOREIGN KEY (`instance_id`) REFERENCES `process_instance` (`instance_id`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `procurement_file`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `procurement_file` (
  `file_id` bigint NOT NULL AUTO_INCREMENT,
  `procurement_request_id` bigint DEFAULT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `file_size` bigint DEFAULT NULL,
  `file_path` varchar(500) DEFAULT NULL,
  `upload_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`file_id`),
  KEY `procurement_request_id` (`procurement_request_id`),
  CONSTRAINT `procurement_file_ibfk_1` FOREIGN KEY (`procurement_request_id`) REFERENCES `procurement_request` (`procurement_request_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `procurement_request`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `procurement_request` (
  `procurement_request_id` bigint NOT NULL AUTO_INCREMENT COMMENT 'Primary Key',
  `request_code` varchar(30) NOT NULL COMMENT 'Request Code like PR-2024-xxx',
  `pre_application_id` bigint DEFAULT NULL COMMENT 'Linked Pre-Application ID',
  `department` varchar(50) NOT NULL COMMENT 'Department Name',
  `applicant_name` varchar(50) NOT NULL COMMENT 'Applicant Name',
  `procurement_type` varchar(30) NOT NULL COMMENT 'Type: FIXED_ASSET, OFFICE_SUPPLY, etc.',
  `urgency_level` varchar(20) NOT NULL COMMENT 'Urgency: NORMAL, URGENT',
  `delivery_address` varchar(200) DEFAULT NULL COMMENT 'Delivery Address',
  `amount` decimal(18,2) NOT NULL DEFAULT '0.00' COMMENT 'Total Amount (Approx in Base Currency or just Sum)',
  `currency` varchar(10) DEFAULT 'CNY' COMMENT 'Main Currency (can be mixed in items)',
  `background_desc` text COMMENT 'Background Description',
  `status` varchar(20) NOT NULL DEFAULT 'DRAFT' COMMENT 'Status: DRAFT, APPROVING, APPROVED, REJECTED',
  `supplier_selection_type` varchar(20) DEFAULT NULL COMMENT 'MULTIPLE or SINGLE',
  `single_source_reason` text COMMENT 'Reason for single source',
  `title` varchar(100) DEFAULT NULL COMMENT 'Request Title',
  `supplier_count` int DEFAULT '0' COMMENT 'Number of candidates',
  `current_approver` varchar(50) DEFAULT NULL COMMENT 'Current Approver Name',
  `approval_stage` varchar(50) DEFAULT NULL COMMENT 'Current Approval Stage',
  `approval_progress` int DEFAULT '0' COMMENT 'Progress Percentage',
  `approval_total_steps` int DEFAULT '1' COMMENT 'Total Approval Steps',
  `approval_current_step` int DEFAULT '1' COMMENT 'Current Approval Step',
  `last_update_time` datetime DEFAULT NULL COMMENT 'Last Status Update Time',
  `rejection_reason` varchar(200) DEFAULT NULL COMMENT 'Reason for rejection if any',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `create_user_id` varchar(50) DEFAULT NULL,
  `create_user_name` varchar(50) DEFAULT NULL,
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `update_user_id` varchar(50) DEFAULT NULL,
  `update_user_name` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`procurement_request_id`),
  UNIQUE KEY `request_code` (`request_code`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Procurement Request Header';
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `procurement_request_item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `procurement_request_item` (
  `item_id` bigint NOT NULL AUTO_INCREMENT,
  `procurement_request_id` bigint NOT NULL,
  `item_name` varchar(200) NOT NULL,
  `amount` decimal(18,2) NOT NULL DEFAULT '0.00',
  `currency` varchar(10) DEFAULT 'CNY',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`item_id`),
  KEY `procurement_request_id` (`procurement_request_id`),
  CONSTRAINT `procurement_request_item_ibfk_1` FOREIGN KEY (`procurement_request_id`) REFERENCES `procurement_request` (`procurement_request_id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `procurement_supplier_rel`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `procurement_supplier_rel` (
  `relation_id` bigint NOT NULL AUTO_INCREMENT,
  `procurement_request_id` bigint NOT NULL,
  `supplier_id` bigint NOT NULL,
  `is_selected` tinyint(1) DEFAULT '0' COMMENT 'Is this the final selected supplier',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `create_user_id` varchar(50) DEFAULT NULL,
  `create_user_name` varchar(50) DEFAULT NULL,
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `update_user_id` varchar(50) DEFAULT NULL,
  `update_user_name` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`relation_id`),
  KEY `procurement_request_id` (`procurement_request_id`),
  KEY `supplier_id` (`supplier_id`),
  CONSTRAINT `procurement_supplier_rel_ibfk_1` FOREIGN KEY (`procurement_request_id`) REFERENCES `procurement_request` (`procurement_request_id`),
  CONSTRAINT `procurement_supplier_rel_ibfk_2` FOREIGN KEY (`supplier_id`) REFERENCES `supplier` (`supplier_id`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `requirement_review_meeting`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `requirement_review_meeting` (
  `meeting_id` bigint NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL COMMENT 'Meeting Title',
  `project_name` varchar(200) DEFAULT NULL COMMENT 'Project Name (or linked project)',
  `project_no` varchar(50) DEFAULT NULL COMMENT 'Project Number',
  `department` varchar(50) DEFAULT NULL COMMENT 'Department',
  `amount` decimal(18,2) DEFAULT '0.00' COMMENT 'Amount',
  `start_time` datetime DEFAULT NULL COMMENT 'Meeting Start Time',
  `end_time` datetime DEFAULT NULL COMMENT 'Meeting End Time',
  `location` varchar(200) DEFAULT NULL COMMENT 'Meeting Location',
  `organizer_name` varchar(50) DEFAULT NULL COMMENT 'Organizer Name',
  `status` varchar(20) DEFAULT 'PENDING' COMMENT 'Status: PENDING, SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `create_user_id` varchar(50) DEFAULT NULL,
  `create_user_name` varchar(50) DEFAULT NULL,
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `update_user_id` varchar(50) DEFAULT NULL,
  `update_user_name` varchar(50) DEFAULT NULL,
  `current_round` int DEFAULT '1',
  `vote_status` varchar(20) DEFAULT 'OPEN',
  `conclusion` text,
  `bid_id` bigint DEFAULT NULL,
  `bid_title` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`meeting_id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `review_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `review_log` (
  `log_id` bigint NOT NULL AUTO_INCREMENT,
  `meeting_id` bigint NOT NULL,
  `operator_id` varchar(50) DEFAULT NULL,
  `operator_name` varchar(50) DEFAULT NULL,
  `action_type` varchar(50) NOT NULL,
  `detail` text,
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`log_id`),
  KEY `meeting_id` (`meeting_id`),
  CONSTRAINT `review_log_ibfk_1` FOREIGN KEY (`meeting_id`) REFERENCES `requirement_review_meeting` (`meeting_id`)
) ENGINE=InnoDB AUTO_INCREMENT=69 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `supplier`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `supplier` (
  `supplier_id` bigint NOT NULL AUTO_INCREMENT,
  `supplier_name` varchar(100) NOT NULL,
  `credit_code` varchar(50) DEFAULT NULL COMMENT 'Unified Social Credit Code',
  `contact_phone` varchar(20) DEFAULT NULL,
  `address` varchar(200) DEFAULT NULL,
  `rating` decimal(2,1) DEFAULT NULL COMMENT 'Rating 0.0-5.0',
  `tags` varchar(200) DEFAULT NULL COMMENT 'Tags separated by comma',
  `is_qualified` tinyint(1) DEFAULT '1',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `create_user_id` varchar(50) DEFAULT NULL,
  `create_user_name` varchar(50) DEFAULT NULL,
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `update_user_id` varchar(50) DEFAULT NULL,
  `update_user_name` varchar(50) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'APPROVED' COMMENT 'DRAFT, PENDING_APPROVAL, APPROVED, REJECTED',
  `region` varchar(20) DEFAULT 'MAINLAND' COMMENT 'HK, MAINLAND',
  `contact_name` varchar(50) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `application_no` varchar(50) DEFAULT NULL,
  `attachments` text COMMENT 'JSON string of attachments',
  PRIMARY KEY (`supplier_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `supplier_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `supplier_history` (
  `history_id` bigint NOT NULL AUTO_INCREMENT,
  `supplier_id` bigint NOT NULL,
  `supplier_name` varchar(100) DEFAULT NULL,
  `credit_code` varchar(50) DEFAULT NULL,
  `contact_phone` varchar(20) DEFAULT NULL,
  `address` varchar(200) DEFAULT NULL,
  `rating` decimal(2,1) DEFAULT NULL,
  `tags` varchar(200) DEFAULT NULL,
  `is_qualified` tinyint(1) DEFAULT NULL,
  `status` varchar(20) DEFAULT NULL,
  `region` varchar(20) DEFAULT NULL,
  `contact_name` varchar(50) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `application_no` varchar(50) DEFAULT NULL,
  `attachments` text,
  `change_type` varchar(20) DEFAULT NULL COMMENT 'CREATE, UPDATE, DELETE',
  `change_reason` varchar(200) DEFAULT NULL,
  `operator_id` varchar(50) DEFAULT NULL,
  `operator_name` varchar(50) DEFAULT NULL,
  `operate_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`history_id`),
  KEY `supplier_id` (`supplier_id`),
  CONSTRAINT `supplier_history_ibfk_1` FOREIGN KEY (`supplier_id`) REFERENCES `supplier` (`supplier_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `sys_resource`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sys_resource` (
  `resource_id` bigint NOT NULL AUTO_INCREMENT,
  `resource_name` varchar(50) NOT NULL,
  `resource_type` varchar(20) DEFAULT 'MENU',
  `path` varchar(100) DEFAULT NULL,
  `icon` varchar(50) DEFAULT NULL,
  `parent_id` bigint DEFAULT NULL,
  `sort_order` int DEFAULT NULL,
  `group_name` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`resource_id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `sys_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sys_user` (
  `user_id` varchar(50) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(100) NOT NULL,
  `real_name` varchar(50) DEFAULT NULL,
  `avatar` varchar(200) DEFAULT NULL,
  `role` varchar(20) DEFAULT NULL,
  `department` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `sys_user_resource_rel`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sys_user_resource_rel` (
  `user_id` varchar(50) NOT NULL,
  `resource_id` bigint NOT NULL,
  PRIMARY KEY (`user_id`,`resource_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

