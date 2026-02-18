package com.example.procurement.entity;

import java.time.LocalDateTime;
import lombok.Data;

@Data
public class ProcessTask {
    private Long taskId;
    private Long instanceId;
    private String nodeName;
    private String nodeType; // START, APPROVAL, END
    private String approverId;
    private String approverName;
    private String status; // PENDING, APPROVED, REJECTED
    private String comment;
    private Integer sequence;
    private LocalDateTime createTime;
    private LocalDateTime handleTime;
}
