package com.example.procurement.mapper;

import com.example.procurement.entity.FileRecord;
import org.apache.ibatis.annotations.Mapper;
import java.util.List;

@Mapper
public interface FileRecordMapper {
    void insert(FileRecord fileRecord);
    FileRecord findById(Long fileId);
    List<FileRecord> findByIds(List<Long> fileIds);
}
