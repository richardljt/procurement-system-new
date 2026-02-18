package com.example.procurement.dto;

import lombok.Data;

@Data
public class ProcessStatusDTO {
    private StageStatus stage1; // Application
    private StageStatus stage2; // Review Meeting
    private StageStatus stage3; // Bidding
    private StageStatus stage4; // Evaluation Meeting
    private StageStatus stage5; // Contract

    @Data
    public static class StageStatus {
        private String status; // PENDING, IN_PROGRESS, COMPLETED
        private Object data;
    }
}
