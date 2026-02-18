package com.example.procurement.dto;

import com.example.procurement.entity.Supplier;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class SupplierUpdateDTO extends Supplier {
    private String changeReason;
}
