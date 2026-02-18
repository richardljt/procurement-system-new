package com.example.procurement.mapper;

import com.example.procurement.entity.ProcurementRequest;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Param;
import java.util.List;
import java.math.BigDecimal;

@Mapper
public interface ProcurementMapper {
    @Select("<script>" +
            "SELECT * FROM procurement_request " +
            "<where>" +
            "  <if test='status != null and status != \"\"'> AND status = #{status} </if>" +
            "  <if test='procurementType != null and procurementType != \"\"'> AND procurement_type = #{procurementType} </if>" +
            "  <if test='urgencyLevel != null and urgencyLevel != \"\"'> AND urgency_level = #{urgencyLevel} </if>" +
            "  <if test='startDate != null and startDate != \"\"'> AND create_time &gt;= #{startDate} </if>" +
            "  <if test='endDate != null and endDate != \"\"'> AND create_time &lt;= #{endDate} </if>" +
            "  <if test='keyword != null and keyword != \"\"'> AND (title LIKE CONCAT('%', #{keyword}, '%') OR request_code LIKE CONCAT('%', #{keyword}, '%') OR background_desc LIKE CONCAT('%', #{keyword}, '%')) </if>" +
            "  <if test='excludeScheduled == true'> AND procurement_request_id NOT IN (SELECT procurement_request_id FROM meeting_application_rel) </if>" +
            "</where>" +
            "ORDER BY create_time DESC" +
            "</script>")
    List<ProcurementRequest> findAll(@Param("status") String status, 
                                   @Param("procurementType") String procurementType,
                                   @Param("urgencyLevel") String urgencyLevel,
                                   @Param("startDate") String startDate,
                                   @Param("endDate") String endDate,
                                   @Param("keyword") String keyword,
                                   @Param("excludeScheduled") Boolean excludeScheduled);

    @Insert("INSERT INTO procurement_request (request_code, pre_application_id, department, applicant_name, procurement_type, " +
            "urgency_level, delivery_address, amount, currency, background_desc, status, " +
            "supplier_selection_type, single_source_reason, create_time, create_user_name, title, supplier_count) " +
            "VALUES (#{requestCode}, #{preApplicationId}, #{department}, #{applicantName}, #{procurementType}, " +
            "#{urgencyLevel}, #{deliveryAddress}, #{amount}, #{currency}, #{backgroundDesc}, #{status}, " +
            "#{supplierSelectionType}, #{singleSourceReason}, NOW(), #{createUserName}, #{title}, #{supplierCount})")
    @Options(useGeneratedKeys = true, keyProperty = "procurementRequestId")
    void insert(ProcurementRequest request);
    
    @Insert("INSERT INTO procurement_supplier_rel (procurement_request_id, supplier_id, is_selected, create_time) " +
            "VALUES (#{requestId}, #{supplierId}, #{isSelected}, NOW())")
    void insertSupplierRelation(@Param("requestId") Long requestId, @Param("supplierId") Long supplierId, @Param("isSelected") Boolean isSelected);

    @Select("SELECT COUNT(*) FROM procurement_request")
    long countAll();

    @Select("<script>" +
            "SELECT status, COUNT(*) as cnt FROM procurement_request " +
            "<where>" +
            "  <if test='status != null and status != \"\"'> AND status = #{status} </if>" +
            "  <if test='procurementType != null and procurementType != \"\"'> AND procurement_type = #{procurementType} </if>" +
            "  <if test='urgencyLevel != null and urgencyLevel != \"\"'> AND urgency_level = #{urgencyLevel} </if>" +
            "  <if test='startDate != null and startDate != \"\"'> AND create_time &gt;= #{startDate} </if>" +
            "  <if test='endDate != null and endDate != \"\"'> AND create_time &lt;= #{endDate} </if>" +
            "  <if test='keyword != null and keyword != \"\"'> AND (title LIKE CONCAT('%', #{keyword}, '%') OR request_code LIKE CONCAT('%', #{keyword}, '%') OR background_desc LIKE CONCAT('%', #{keyword}, '%')) </if>" +
            "</where>" +
            "GROUP BY status" +
            "</script>")
    List<java.util.Map<String, Object>> countStatusGroup(@Param("status") String status, 
                                   @Param("procurementType") String procurementType,
                                   @Param("urgencyLevel") String urgencyLevel,
                                   @Param("startDate") String startDate,
                                   @Param("endDate") String endDate,
                                   @Param("keyword") String keyword);

    @Select("SELECT COUNT(*) FROM procurement_request WHERE status = #{status}")
    long countByStatus(String status);

    @Select("SELECT * FROM procurement_request WHERE procurement_request_id = #{id}")
    ProcurementRequest findById(Long id);
    
    @Select("SELECT supplier_id FROM procurement_supplier_rel WHERE procurement_request_id = #{requestId}")
    List<Long> findSupplierIdsByRequestId(Long requestId);

    @Select("SELECT s.* FROM supplier s " +
            "JOIN procurement_supplier_rel r ON s.supplier_id = r.supplier_id " +
            "WHERE r.procurement_request_id = #{requestId}")
    List<com.example.procurement.entity.Supplier> findSuppliersByRequestId(Long requestId);

    @Select("SELECT COALESCE(SUM(amount), 0) FROM procurement_request WHERE pre_application_id = #{preApplicationId}")
    BigDecimal sumAmountByPreApplicationId(Long preApplicationId);

    @Select("SELECT * FROM procurement_request WHERE pre_application_id = #{preApplicationId}")
    List<ProcurementRequest> findByPreApplicationId(Long preApplicationId);

    @org.apache.ibatis.annotations.Update("UPDATE procurement_request SET status = #{status}, rejection_reason = #{reason}, update_time = NOW() WHERE procurement_request_id = #{id}")
    void updateStatus(@Param("id") Long id, @Param("status") String status, @Param("reason") String reason);

    @org.apache.ibatis.annotations.Update("UPDATE procurement_request SET " +
            "pre_application_id = #{preApplicationId}, department = #{department}, applicant_name = #{applicantName}, " +
            "procurement_type = #{procurementType}, urgency_level = #{urgencyLevel}, delivery_address = #{deliveryAddress}, " +
            "amount = #{amount}, currency = #{currency}, background_desc = #{backgroundDesc}, status = #{status}, " +
            "supplier_selection_type = #{supplierSelectionType}, single_source_reason = #{singleSourceReason}, " +
            "title = #{title}, supplier_count = #{supplierCount}, update_time = NOW() " +
            "WHERE procurement_request_id = #{procurementRequestId}")
    void update(ProcurementRequest request);

    @org.apache.ibatis.annotations.Delete("DELETE FROM procurement_supplier_rel WHERE procurement_request_id = #{requestId}")
    void deleteSupplierRelations(Long requestId);
    
    @org.apache.ibatis.annotations.Delete("DELETE FROM procurement_request_item WHERE procurement_request_id = #{requestId}")
    void deleteItems(Long requestId);
}
