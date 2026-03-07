package com.example.procurement.mapper;

import com.example.procurement.entity.SupplierHistory;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface SupplierHistoryMapper {

    void insert(SupplierHistory history);

    @Select("SELECT * FROM supplier_history WHERE supplier_id = #{supplierId} ORDER BY operate_time DESC")
    List<SupplierHistory> findBySupplierId(Long supplierId);
}
