package com.example.procurement.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class MeetingApplicationRel {
    private Long relationId;
    private Long meetingId;
    private Long procurementRequestId;
    
    // Audit fields
    private LocalDateTime createTime;
}
