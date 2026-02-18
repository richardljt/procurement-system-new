package com.example.procurement.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class EvaluationFeedbackDTO {
    private Long id;
    private Long supplierId;
    private String expertName;
    private String question;
    private String reply;
    private String status;
    private LocalDateTime createTime;
}
