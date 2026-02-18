package com.example.procurement.dto;

import lombok.Data;
import java.util.List;

@Data
public class EvaluationDetailDTO {
    private Long id;
    private String projectCode;
    private String title;
    private String status;
    private String currentStage;
    private String organizerName;
    
    private List<EvaluationSupplierDTO> suppliers;
    private List<EvaluationExpertDTO> experts;
    private List<EvaluationScoreDTO> scores;
    private List<EvaluationLogDTO> logs;
    private List<EvaluationFeedbackDTO> feedbacks;
}
