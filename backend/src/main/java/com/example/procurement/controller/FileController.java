package com.example.procurement.controller;

import com.example.procurement.common.ApiResponse;
import com.example.procurement.dto.FileUploadResponse;
import com.example.procurement.entity.FileRecord;
import com.example.procurement.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/files")
@CrossOrigin(origins = "*")
public class FileController {

    @Autowired
    private FileStorageService fileStorageService;

    @PostMapping("/upload")
    public ApiResponse<FileRecord> uploadFile(@RequestParam("file") MultipartFile file, @RequestParam("module") String module) {
        if (file.isEmpty()) {
            return ApiResponse.error("Please select a file to upload");
        }

        try {
            FileRecord fileRecord = fileStorageService.storeFile(file, module);
            return ApiResponse.success(fileRecord);
        } catch (IOException e) {
            e.printStackTrace();
            return ApiResponse.error("Failed to upload file: " + e.getMessage());
        }
    }
}
