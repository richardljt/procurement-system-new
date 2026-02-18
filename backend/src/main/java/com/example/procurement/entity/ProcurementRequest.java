package com.example.procurement.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import lombok.Data;

@Data
public class ProcurementRequest {
    private Long procurementRequestId;
    private String requestCode;
    private Long preApplicationId; // Added
    private String department;
    private String applicantName;
    private String procurementType;
    private String urgencyLevel;
    private String deliveryAddress;
    private BigDecimal amount;
    private String currency;
    private String backgroundDesc;
    private String status;
    private String supplierSelectionType;
    private String singleSourceReason;
    
    private String title;
    private Integer supplierCount;
    private String currentApprover;
    private String approvalStage;
    private Integer approvalProgress;
    private Integer approvalTotalSteps;
    private Integer approvalCurrentStep;
    private LocalDateTime lastUpdateTime;
    private String rejectionReason;
    
    // Transient fields for input
    private List<Long> supplierIds; 
    private List<Supplier> supplierList; // Added for detail view
    private List<ProcurementRequestItem> items;
    private List<ProcurementFile> files; // Added for file attachments
    private List<ProcessTask> processTasks; // Added for process flow display
    
    private LocalDateTime createTime;
    private String createUserId;
    private String createUserName;
    private LocalDateTime updateTime;
    private String updateUserId;
    private String updateUserName;
}
