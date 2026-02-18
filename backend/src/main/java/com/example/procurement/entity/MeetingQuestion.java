package com.example.procurement.entity;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class MeetingQuestion {
    private Long questionId;
    private Long meetingId;
    private String content;
    private String askerId;
    private String askerName;
    private Boolean isAnonymous;
    private String status; // PENDING, ANSWERED
    private LocalDateTime createTime;
    
    // Attachments
    private String attachmentName;
    private String attachmentPath;
    
    private List<MeetingReply> replies;
}
