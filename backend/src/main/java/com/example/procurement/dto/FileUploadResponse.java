package com.example.procurement.dto;

import lombok.Data;

@Data
public class FileUploadResponse {
    private String fileName;
    private long fileSize;
    private String filePath;
}
