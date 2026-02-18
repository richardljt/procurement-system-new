package com.example.procurement.mapper;

import com.example.procurement.entity.Supplier;
import org.apache.ibatis.annotations.*;
import java.util.List;

@Mapper
public interface SupplierMapper {
    @Select("SELECT * FROM supplier")
    List<Supplier> findAll();
    
    @Select("SELECT * FROM supplier WHERE status = 'APPROVED'")
    List<Supplier> findAllApproved();

    @Select("SELECT * FROM supplier WHERE create_user_id = #{userId} ORDER BY create_time DESC")
    List<Supplier> findByCreateUserId(String userId);

    @Select("SELECT * FROM supplier WHERE supplier_id = #{id}")
    Supplier findById(Long id);

    @Select("SELECT * FROM supplier WHERE status = #{status} ORDER BY create_time DESC")
    List<Supplier> findByStatus(String status);

    @Insert("INSERT INTO supplier (supplier_name, credit_code, contact_phone, address, rating, tags, is_qualified, " +
            "status, region, contact_name, email, application_no, attachments, " +
            "create_time, create_user_id, create_user_name, update_time, update_user_id, update_user_name) " +
            "VALUES (#{supplierName}, #{creditCode}, #{contactPhone}, #{address}, #{rating}, #{tags}, #{isQualified}, " +
            "#{status}, #{region}, #{contactName}, #{email}, #{applicationNo}, #{attachments}, " +
            "#{createTime}, #{createUserId}, #{createUserName}, #{updateTime}, #{updateUserId}, #{updateUserName})")
    @Options(useGeneratedKeys = true, keyProperty = "supplierId")
    void insert(Supplier supplier);

    @Update("UPDATE supplier SET supplier_name = #{supplierName}, credit_code = #{creditCode}, " +
            "contact_phone = #{contactPhone}, address = #{address}, rating = #{rating}, tags = #{tags}, " +
            "is_qualified = #{isQualified}, status = #{status}, region = #{region}, " +
            "contact_name = #{contactName}, email = #{email}, attachments = #{attachments}, " +
            "update_time = #{updateTime}, update_user_id = #{updateUserId}, update_user_name = #{updateUserName} " +
            "WHERE supplier_id = #{supplierId}")
    void update(Supplier supplier);
}
