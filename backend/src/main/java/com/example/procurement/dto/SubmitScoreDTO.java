package com.example.procurement.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class SubmitScoreDTO {
    private String projectCode;
    private Long supplierId;
    private Long expertId; // In real app, this comes from token
    private BigDecimal score;
    private String details; // JSON
    private String comment;
}
