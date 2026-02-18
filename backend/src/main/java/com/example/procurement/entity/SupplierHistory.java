package com.example.procurement.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Data;

@Data
public class SupplierHistory {
    private Long historyId;
    private Long supplierId;
    private String supplierName;
    private String creditCode;
    private String contactPhone;
    private String address;
    private BigDecimal rating;
    private String tags;
    private Boolean isQualified;

    private String status;
    private String region;
    private String contactName;
    private String email;
    private String applicationNo;
    private String attachments;
    
    private String changeType; // CREATE, UPDATE, DELETE
    private String changeReason;
    
    private String operatorId;
    private String operatorName;
    private LocalDateTime operateTime;
}
