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

    void insert(Supplier supplier);

    void update(Supplier supplier);
}
