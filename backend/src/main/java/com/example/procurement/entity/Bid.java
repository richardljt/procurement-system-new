package com.example.procurement.entity;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class Bid {
    private Long bidId;
    private String title;
    private Long procurementRequestId;
    private BigDecimal budget;
    private LocalDateTime deadline;
    private String description;
    private String notificationMethods;
    private String emailSubject;
    private String emailBody;
    private String status;
    private LocalDateTime createTime;
    private String createUserId;
    private String createUserName;
    private LocalDateTime updateTime;
    private String updateUserId;
    private String updateUserName;
    
    // Transient
    private List<BidSupplier> suppliers;
    private List<BidAttachment> attachments;
    private String procurementRequestName; // To display associated PR name
    private Integer supplierCount; // Transient field for list view
    
    private String evaluationCode; // Code of the evaluation project if started
}
