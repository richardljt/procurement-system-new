package com.example.procurement.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class MeetingVote {
    private Long voteId;
    private Long meetingId;
    private Integer round;
    private String voterId;
    private String voterName;
    private Integer score;
    private String comment;
    private LocalDateTime createTime;
}
