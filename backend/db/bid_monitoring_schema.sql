-- Create BidMonitoring table for caching or snapshotting bid monitoring data
-- Although live data comes from Bid and BidSupplier, this table can be used for logging snapshots or specific monitoring configuration.

CREATE TABLE IF NOT EXISTS bid_monitoring (
    bid_id BIGINT PRIMARY KEY,
    title VARCHAR(255),
    status ENUM('ongoing', 'completed') DEFAULT 'ongoing',
    countdown VARCHAR(50) COMMENT 'Snapshot of countdown, e.g. 2d 10h',
    deadline DATETIME,
    
    -- JSON fields for complex structures
    stats JSON COMMENT '{invited: number, submitted: number, inProgress: number, notSubmitted: number, completionRate: string}',
    suppliers JSON COMMENT 'Array of {name, contact, status, businessPart, pricePart, submitTime, completion}',
    logs JSON COMMENT 'Array of {type, title, description, user, time}',
    
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (bid_id) REFERENCES bid(bid_id) ON DELETE CASCADE
);
