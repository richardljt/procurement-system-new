package com.example.procurement.dto;

import com.example.procurement.entity.RequirementReviewMeeting;
import lombok.Data;
import java.util.List;

@Data
public class MeetingDTO extends RequirementReviewMeeting {
    // Explicitly add fields if not inherited (though they are inherited, sometimes DTOs duplicate them for clarity or if base class is Entity)
    // Since RequirementReviewMeeting has bidId/Title, we inherit them.
    
    private List<Long> mainExpertIds;
    private List<Long> backupExpertIds;
    private List<Long> applicationIds;
    private Integer numMainExperts;
    private Integer numBackupExperts;
    private String expertSelectionMode;
    
    // Legacy support for frontend transition (optional, but good for backward compatibility if needed)
    private List<String> experts; 
}
