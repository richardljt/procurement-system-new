USE procurement_db;

ALTER TABLE meeting_question ADD COLUMN attachment_name VARCHAR(200);
ALTER TABLE meeting_question ADD COLUMN attachment_path VARCHAR(500);

ALTER TABLE meeting_reply ADD COLUMN attachment_name VARCHAR(200);
ALTER TABLE meeting_reply ADD COLUMN attachment_path VARCHAR(500);

-- Meeting status management might be needed for 'End Vote' / 'End Meeting'
ALTER TABLE requirement_review_meeting ADD COLUMN current_round INT DEFAULT 1;
ALTER TABLE requirement_review_meeting ADD COLUMN vote_status VARCHAR(20) DEFAULT 'OPEN'; -- OPEN, CLOSED
