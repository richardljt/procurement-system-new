package com.example.procurement.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class MeetingMaterial {
    private Long materialId;
    private Long meetingId;
    private String fileName;
    private String filePath;
    private Long fileSize;
    private String uploaderId;
    private String uploaderName;
    private LocalDateTime uploadTime;
}
