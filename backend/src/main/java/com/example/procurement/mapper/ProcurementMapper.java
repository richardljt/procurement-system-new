package com.example.procurement.mapper;

import com.example.procurement.entity.ProcurementRequest;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Delete;
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


    void insert(ProcurementRequest request);
    

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

    void updateStatus(@Param("id") Long id, @Param("status") String status, @Param("reason") String reason);

    void update(ProcurementRequest request);

    @Delete("DELETE FROM procurement_supplier_rel WHERE procurement_request_id = #{requestId}")
    void deleteSupplierRelations(Long requestId);
    
    @Delete("DELETE FROM procurement_request_item WHERE procurement_request_id = #{requestId}")
    void deleteItems(Long requestId);
}
