package com.example.procurement.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class EvaluationScoreDTO {
    private Long id;
    private Long supplierId;
    private Long expertId;
    private BigDecimal score;
    private String details;
    private String comment;
    private String stage;
}
