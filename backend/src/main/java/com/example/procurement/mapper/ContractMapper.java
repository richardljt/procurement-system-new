package com.example.procurement.mapper;

import com.example.procurement.entity.Contract;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface ContractMapper {
    int insert(Contract contract);
    int update(Contract contract);
    Contract findById(Long contractId);
    List<Contract> findByProcurementRequestId(Long procurementRequestId);
    int deleteById(Long contractId);
}
