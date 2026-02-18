package com.example.procurement.entity;

import java.time.LocalDateTime;
import lombok.Data;

@Data
public class ProcessInstance {
    private Long instanceId;
    private String businessKey;
    private String businessType;
    private String status;
    private String initiatorId;
    private String initiatorName;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
}
