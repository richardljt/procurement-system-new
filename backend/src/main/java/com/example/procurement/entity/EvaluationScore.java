package com.example.procurement.entity;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class EvaluationScore {
    private Long id;
    private Long evaluationId;
    private Long supplierId;
    private Long expertId;
    private BigDecimal score;
    private String details;
    private String comment;
    private String stage; // BUSINESS or PRICE

    public String getStage() {
        return stage;
    }

    public void setStage(String stage) {
        this.stage = stage;
    }
}
