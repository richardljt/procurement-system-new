package com.example.procurement.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Data;

@Data
public class Supplier {
    private Long supplierId;
    private String supplierName;
    private String creditCode;
    private String contactPhone;
    private String address;
    private BigDecimal rating;
    private String tags;
    private Boolean isQualified;

    // New fields for Admission Application
    private String status; // DRAFT, PENDING_APPROVAL, APPROVED, REJECTED
    private String region; // HK, MAINLAND
    private String contactName;
    private String email;
    private String applicationNo;
    private String attachments; // JSON string
    
    private LocalDateTime createTime;
    private String createUserId;
    private String createUserName;
    private LocalDateTime updateTime;
    private String updateUserId;
    private String updateUserName;
}
