package com.example.procurement.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Data;

@Data
public class ProcurementRequestItem {
    private Long itemId;
    private Long procurementRequestId;
    private String itemName;
    private BigDecimal amount;
    private String currency;
    private LocalDateTime createTime;
}
