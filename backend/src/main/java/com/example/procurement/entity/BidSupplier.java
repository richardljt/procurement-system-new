package com.example.procurement.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class BidSupplier {
    private Long id;
    private Long bidId;
    private Long supplierId;
    private Boolean isSelected;
    private LocalDateTime createTime;
    
    // Transient
    private String supplierName;
    private String supplierEmail;
}
