package com.example.procurement.mapper;

import com.example.procurement.entity.SupplierHistory;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface SupplierHistoryMapper {

    @Insert("INSERT INTO supplier_history (supplier_id, supplier_name, credit_code, contact_phone, address, rating, tags, " +
            "is_qualified, status, region, contact_name, email, application_no, attachments, " +
            "change_type, change_reason, operator_id, operator_name, operate_time) " +
            "VALUES (#{supplierId}, #{supplierName}, #{creditCode}, #{contactPhone}, #{address}, #{rating}, #{tags}, " +
            "#{isQualified}, #{status}, #{region}, #{contactName}, #{email}, #{applicationNo}, #{attachments}, " +
            "#{changeType}, #{changeReason}, #{operatorId}, #{operatorName}, #{operateTime})")
    void insert(SupplierHistory history);

    @Select("SELECT * FROM supplier_history WHERE supplier_id = #{supplierId} ORDER BY operate_time DESC")
    List<SupplierHistory> findBySupplierId(Long supplierId);
}
