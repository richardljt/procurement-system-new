package com.example.procurement.entity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.Data;

@Data
public class ExchangeRate {
    private Long exchangeRateId;
    private String sourceCurrency;
    private String targetCurrency;
    private BigDecimal rate;
    private LocalDate effectiveDate;
    private LocalDateTime createTime;
}
