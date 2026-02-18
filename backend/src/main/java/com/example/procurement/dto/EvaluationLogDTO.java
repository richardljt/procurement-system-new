package com.example.procurement.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class EvaluationLogDTO {
    private Long id;
    private String userName;
    private String action;
    private String details;
    private LocalDateTime timestamp;
}
