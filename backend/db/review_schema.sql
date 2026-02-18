USE procurement_db;

-- 1. Meeting Materials
CREATE TABLE IF NOT EXISTS meeting_material (
    material_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    meeting_id BIGINT NOT NULL,
    file_name VARCHAR(200) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT,
    uploader_id VARCHAR(50),
    uploader_name VARCHAR(50),
    upload_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (meeting_id) REFERENCES requirement_review_meeting(meeting_id)
);

-- 2. Meeting Questions
CREATE TABLE IF NOT EXISTS meeting_question (
    question_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    meeting_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    asker_id VARCHAR(50),
    asker_name VARCHAR(50),
    is_anonymous BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'PENDING' COMMENT 'PENDING, ANSWERED',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (meeting_id) REFERENCES requirement_review_meeting(meeting_id)
);

-- 3. Question Replies
CREATE TABLE IF NOT EXISTS meeting_reply (
    reply_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    question_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    replier_id VARCHAR(50),
    replier_name VARCHAR(50),
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (question_id) REFERENCES meeting_question(question_id)
);

-- 4. Meeting Votes
CREATE TABLE IF NOT EXISTS meeting_vote (
    vote_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    meeting_id BIGINT NOT NULL,
    round INT NOT NULL DEFAULT 1,
    voter_id VARCHAR(50) NOT NULL,
    voter_name VARCHAR(50),
    score INT,
    comment VARCHAR(500),
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_meeting_round_voter (meeting_id, round, voter_id),
    FOREIGN KEY (meeting_id) REFERENCES requirement_review_meeting(meeting_id)
);

-- 5. Review Logs
CREATE TABLE IF NOT EXISTS review_log (
    log_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    meeting_id BIGINT NOT NULL,
    operator_id VARCHAR(50),
    operator_name VARCHAR(50),
    action_type VARCHAR(50) NOT NULL,
    detail TEXT,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (meeting_id) REFERENCES requirement_review_meeting(meeting_id)
);
