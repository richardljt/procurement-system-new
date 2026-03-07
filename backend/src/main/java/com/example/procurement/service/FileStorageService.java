package com.example.procurement.service;

import com.example.procurement.entity.FileRecord;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface FileStorageService {
    FileRecord storeFile(MultipartFile file, String module) throws IOException;
}
