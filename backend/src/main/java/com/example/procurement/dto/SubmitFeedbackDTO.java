package com.example.procurement.dto;

import lombok.Data;

@Data
public class SubmitFeedbackDTO {
    private String projectCode;
    private Long supplierId; // Optional if general comment
    private String question;
    private String expertName; // Mocked from frontend or token
}
