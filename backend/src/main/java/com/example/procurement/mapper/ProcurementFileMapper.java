package com.example.procurement.mapper;

import com.example.procurement.entity.ProcurementFile;
import org.apache.ibatis.annotations.*;
import java.util.List;

@Mapper
public interface ProcurementFileMapper {
    @Insert("INSERT INTO procurement_file (procurement_request_id, file_name, file_size, file_path, upload_time) " +
            "VALUES (#{procurementRequestId}, #{fileName}, #{fileSize}, #{filePath}, NOW())")
    @Options(useGeneratedKeys = true, keyProperty = "fileId")
    void insert(ProcurementFile file);

    @Select("SELECT * FROM procurement_file WHERE procurement_request_id = #{requestId}")
    List<ProcurementFile> findByRequestId(Long requestId);

    @Delete("DELETE FROM procurement_file WHERE procurement_request_id = #{requestId}")
    void deleteByRequestId(Long requestId);
}
