package com.example.procurement.entity;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class Contract {
    private Long contractId;
    private Long procurementRequestId;
    private String contractName;
    private String contractCode;
    private Long supplierId;
    private BigDecimal amount;
    private LocalDateTime signingDate;
    private String attachmentUrl;
    private String status;
    private String signerName;
    private String signerContact;
    private String vendorSignerName;
    private String vendorSignerContact;
    private LocalDateTime createTime;
    private String createUserId;
    private String createUserName;
    private LocalDateTime updateTime;
    private String updateUserId;
    private String updateUserName;
}
