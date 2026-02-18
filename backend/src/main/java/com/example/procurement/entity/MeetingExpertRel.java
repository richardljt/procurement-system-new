package com.example.procurement.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class MeetingExpertRel {
    private Long relationId;
    private Long meetingId;
    private Long expertId; // Added expertId
    private String expertName;
    private String expertAvatar;
    private String type; // MAIN or BACKUP
    
    // Audit fields
    private LocalDateTime createTime;
    private String createUserId;
    private String createUserName;
}
