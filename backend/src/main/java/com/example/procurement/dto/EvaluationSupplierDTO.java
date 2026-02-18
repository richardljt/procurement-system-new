package com.example.procurement.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class EvaluationSupplierDTO {
    private Long id;
    private String supplierName;
    private String supplierCode;
    private BigDecimal businessScore;
    private BigDecimal priceScore;
    private BigDecimal totalScore;
    private Integer rankPosition;
}
