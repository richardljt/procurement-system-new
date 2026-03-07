package com.example.procurement.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class FileRecord {
    private Long fileId;
    private String module;
    private String originalFileName;
    private String filePath;
    private Long fileSize;
    private LocalDateTime uploadTime;
    private String createUserId;
    private String createUserName;
}
