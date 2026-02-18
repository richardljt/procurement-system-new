package com.example.procurement.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class MeetingParticipant {
    private Long participantId;
    private Long meetingId;
    private String userId;
    private String userName;
    private String role;
    private LocalDateTime createTime;
}