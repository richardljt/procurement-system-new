package com.example.procurement.service;

import com.example.procurement.entity.FileRecord;
import com.example.procurement.mapper.FileRecordMapper;
import com.example.procurement.util.SnowflakeIdGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;

@Service
public class LocalStorageFileStorageService implements FileStorageService {

    private static final String UPLOAD_DIR = "upload/";

    @Autowired
    private SnowflakeIdGenerator snowflakeIdGenerator;

    @Autowired
    private FileRecordMapper fileRecordMapper;

    @Override
    public FileRecord storeFile(MultipartFile file, String module) throws IOException {
        File uploadDir = new File(UPLOAD_DIR + module);
        if (!uploadDir.exists()) {
            uploadDir.mkdirs();
        }

        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }

        long fileId = snowflakeIdGenerator.nextId();
        String newFilename = fileId + extension;
        String filePath = "/" + module + "/" + newFilename;

        Path path = Paths.get(UPLOAD_DIR + filePath);
        Files.write(path, file.getBytes());

        FileRecord fileRecord = new FileRecord();
        fileRecord.setFileId(fileId);
        fileRecord.setModule(module);
        fileRecord.setOriginalFileName(originalFilename);
        fileRecord.setFilePath(filePath);
        fileRecord.setFileSize(file.getSize());
        fileRecord.setUploadTime(LocalDateTime.now());
        fileRecord.setCreateUserId("U001");
        fileRecord.setCreateUserName("Zhang Ming");

        fileRecordMapper.insert(fileRecord);

        return fileRecord;
    }
}
