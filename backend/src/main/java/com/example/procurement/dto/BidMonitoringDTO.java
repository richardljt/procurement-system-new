package com.example.procurement.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class BidMonitoringDTO {
    private Long bidId;
    private String title;
    private String status;
    private String countdown;
    private LocalDateTime deadline;
    private Stats stats;
    private List<SupplierMonitorDTO> suppliers;
    private List<LogDTO> logs;

    @Data
    public static class Stats {
        private int invited;
        private int submitted;
        private int inProgress;
        private int notSubmitted;
        private String completionRate;
    }

    @Data
    public static class SupplierMonitorDTO {
        private String name;
        private String contact;
        private String status; // 'Submitted', 'In Progress', 'Pending'
        private String businessPart; // 'uploaded', 'pending'
        private String pricePart;
        private String submitTime;
        private int completion;
    }

    @Data
    public static class LogDTO {
        private String type; // 'submit', 'warn', 'info'
        private String title;
        private String description;
        private String user;
        private String time;
    }
}
