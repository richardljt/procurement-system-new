package com.example.procurement.entity;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class Expert {
    private Long expertId;
    private String name;
    private String department;
    private LocalDate entryDate;
    private String industries; // Comma separated
    private String level;
    private String avatar;
    private String userId; // Associated system user ID
    
    // Audit fields
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
    private String createUserId;
    private String createUserName;
}
