package com.example.procurement.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ProcurementFile {
    private Long fileId;
    private Long procurementRequestId;
    private String fileName;
    private Long fileSize;
    private String filePath;
    private LocalDateTime uploadTime;
}
