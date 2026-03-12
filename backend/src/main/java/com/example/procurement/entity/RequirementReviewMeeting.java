package com.example.procurement.entity;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class RequirementReviewMeeting {
    private Long meetingId;
    private String title;
    private String projectName;
    private String projectNo;
    private String department;
    private BigDecimal amount;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String location;
    private String organizerName;
    private String status; // PENDING, SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED
    
    private String conclusion; // Meeting conclusion
    
    // Additional fields from schema update
    private Integer currentRound;
    private String voteStatus;
    
    // Bid fields
    private Long bidId;
    private String bidTitle;

    private Integer numMainExperts;
    private Integer numBackupExperts;
    private String expertSelectionMode;

    // Audit fields
    private LocalDateTime createTime;
    private String createUserId;
    private String createUserName;
    private LocalDateTime updateTime;
    private String updateUserId;
    private String updateUserName;
}
