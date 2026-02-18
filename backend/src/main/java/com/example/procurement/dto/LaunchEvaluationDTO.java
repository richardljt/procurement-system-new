package com.example.procurement.dto;

import lombok.Data;
import java.util.List;

@Data
public class LaunchEvaluationDTO {
    private Long bidId;
    private String title;
    private String bidTitle;
    private String startTime;
    private String endTime;
    private List<Integer> mainExpertIds;
    private List<Integer> backupExpertIds;
}
