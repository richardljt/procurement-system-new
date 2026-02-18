package com.example.procurement.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class EvaluationLog {
    private Long id;
    private Long evaluationId;
    private String userName;
    private String action;
    private String details;
    private LocalDateTime timestamp;
}
