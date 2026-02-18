package com.example.procurement.controller;

import com.example.procurement.common.ApiResponse;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@RestController
@RequestMapping("/api/files")
@CrossOrigin(origins = "*")
public class FileController {

    private static final String UPLOAD_DIR = "uploads/";

    @PostMapping("/upload")
    public ApiResponse<String> uploadFile(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ApiResponse.error("Please select a file to upload");
        }

        try {
            // Create upload directory if not exists
            File uploadDir = new File(UPLOAD_DIR);
            if (!uploadDir.exists()) {
                uploadDir.mkdirs();
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String newFilename = UUID.randomUUID().toString() + extension;

            // Save file
            byte[] bytes = file.getBytes();
            Path path = Paths.get(UPLOAD_DIR + newFilename);
            Files.write(path, bytes);

            // Return URL (Assuming server is running on localhost:8082)
            // In production, this should be a full URL or relative path handled by frontend
            String fileUrl = "/uploads/" + newFilename;
            
            return ApiResponse.success(fileUrl);

        } catch (IOException e) {
            e.printStackTrace();
            return ApiResponse.error("Failed to upload file: " + e.getMessage());
        }
    }
}
