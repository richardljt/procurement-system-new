package com.example.procurement.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class EvaluationFeedback {
    private Long id;
    private Long evaluationId;
    private Long supplierId;
    private String expertName;
    private String question;
    private String reply;
    private String status; // PENDING, REPLIED
    private LocalDateTime createTime;
}
