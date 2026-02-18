package com.example.procurement.entity;

import lombok.Data;

@Data
public class EvaluationExpert {
    private Long id;
    private Long evaluationId;
    private String expertName;
    private String role;
    private String avatar;
    private Boolean isOnline;
    private Boolean hasConfirmed;
}
