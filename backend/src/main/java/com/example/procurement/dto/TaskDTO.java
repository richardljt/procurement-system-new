package com.example.procurement.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TaskDTO {
    private Long taskId;
    private String nodeName;
    private String nodeType;
    private String status;
    private String businessKey;
    private String businessType;
    private String businessTitle; // Optional, maybe for future
    private Long businessId;
    private LocalDateTime createTime;
    private Long instanceId;
}
