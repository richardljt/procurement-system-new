package com.example.procurement.mapper;

import com.example.procurement.entity.ProcurementRequestItem;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface ProcurementRequestItemMapper {
    void insert(ProcurementRequestItem item);
    
    @Select("SELECT * FROM procurement_request_item WHERE procurement_request_id = #{requestId}")
    List<ProcurementRequestItem> findByRequestId(Long requestId);
}
