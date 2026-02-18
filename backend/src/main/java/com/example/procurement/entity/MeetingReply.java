package com.example.procurement.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class MeetingReply {
    private Long replyId;
    private Long questionId;
    private String content;
    private String replierId;
    private String replierName;
    private LocalDateTime createTime;
    
    // Attachments
    private String attachmentName;
    private String attachmentPath;
}
