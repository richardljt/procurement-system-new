package com.example.procurement.entity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.Data;

@Data
public class PreApplication {
    private Long preApplicationId;
    private String applicationCode;
    private String applicantName;
    private String department;
    private LocalDate applyDate;
    private LocalDate approvalDate;
    private String description;
    private BigDecimal totalBudget;
    private BigDecimal usedBudget;
    private BigDecimal remainingBudget;
    private String currency;
    private String status;
    
    private LocalDateTime createTime;
    private String createUserId;
    private String createUserName;
    private LocalDateTime updateTime;
    private String updateUserId;
    private String updateUserName;
}
