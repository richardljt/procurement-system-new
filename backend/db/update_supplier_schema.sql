USE procurement_db;

ALTER TABLE supplier ADD COLUMN status VARCHAR(20) DEFAULT 'APPROVED' COMMENT 'DRAFT, PENDING_APPROVAL, APPROVED, REJECTED';
ALTER TABLE supplier ADD COLUMN region VARCHAR(20) DEFAULT 'MAINLAND' COMMENT 'HK, MAINLAND';
ALTER TABLE supplier ADD COLUMN contact_name VARCHAR(50);
ALTER TABLE supplier ADD COLUMN email VARCHAR(100);
ALTER TABLE supplier ADD COLUMN application_no VARCHAR(50);
ALTER TABLE supplier ADD COLUMN attachments TEXT COMMENT 'JSON string of attachments';

-- Update existing records to be APPROVED and have some default values
UPDATE supplier SET status = 'APPROVED', region = 'MAINLAND' WHERE status IS NULL;
