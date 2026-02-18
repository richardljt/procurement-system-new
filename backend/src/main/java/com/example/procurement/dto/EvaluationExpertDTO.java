package com.example.procurement.dto;

import lombok.Data;

@Data
public class EvaluationExpertDTO {
    private Long id;
    private String expertName;
    private String role;
    private String avatar;
    private Boolean isOnline;
    private Boolean hasConfirmed;
}
