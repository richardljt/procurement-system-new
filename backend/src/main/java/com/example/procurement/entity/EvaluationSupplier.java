package com.example.procurement.entity;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class EvaluationSupplier {
    private Long id;
    private Long evaluationId;
    private Long supplierId;
    private String supplierName;
    private String supplierCode;
    private BigDecimal businessScore;
    private BigDecimal priceScore;
    private BigDecimal totalScore;
    private Integer rankPosition;
}
