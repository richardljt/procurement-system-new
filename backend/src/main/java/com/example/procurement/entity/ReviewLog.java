package com.example.procurement.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ReviewLog {
    private Long logId;
    private Long meetingId;
    private String operatorId;
    private String operatorName;
    private String actionType;
    private String detail;
    private LocalDateTime createTime;
}
