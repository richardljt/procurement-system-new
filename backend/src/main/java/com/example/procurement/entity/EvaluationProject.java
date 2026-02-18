package com.example.procurement.entity;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class EvaluationProject {
    private Long id;
    private String projectCode;
    private String title;
    private Long bidId;
    private String status; // ONGOING, PAUSED, COMPLETED
    private String currentStage; // BUSINESS, PRICE
    private String organizerName;
    private LocalDateTime startTime;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
