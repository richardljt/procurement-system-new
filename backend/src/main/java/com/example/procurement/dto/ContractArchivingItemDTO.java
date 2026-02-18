package com.example.procurement.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ContractArchivingItemDTO {
    private Long procurementRequestId;
    private String procurementRequestCode;
    private String procurementTitle;
    private BigDecimal amount;
    private String applicantName;
    private String department;
    private LocalDateTime createTime;
    
    // Evaluation Info
    private boolean evaluationCompleted;
    private Long bidId;
    
    // Contract Info
    private Long contractId;
    private String contractStatus; // "PENDING_ENTRY" or "ENTERED"
    private String contractName;
    private LocalDateTime signingDate;
}
