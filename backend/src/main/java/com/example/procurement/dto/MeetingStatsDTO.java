package com.example.procurement.dto;

import lombok.Data;

@Data
public class MeetingStatsDTO {
    private int pending;
    private int inProgress;
    private int completed;
}
