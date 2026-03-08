package com.example.procurement.controller;

import com.example.procurement.common.ApiResponse;
import com.example.procurement.dto.MeetingDTO;
import com.example.procurement.dto.MeetingStatsDTO;
import com.example.procurement.service.MeetingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/meetings")
@CrossOrigin(origins = "*")
public class MeetingController {
    
    @Autowired
    private MeetingService meetingService;
    
    @GetMapping("/stats")
    public ApiResponse<MeetingStatsDTO> getMeetingStats() {
        return ApiResponse.success(meetingService.getMeetingStats());
    }
    
    @PostMapping("/create")
    public ApiResponse<Long> createMeeting(@RequestBody MeetingDTO meetingDTO) {
        meetingDTO.setCreateTime(LocalDateTime.now());
        Long meetingId = meetingService.createMeeting(meetingDTO);
        return ApiResponse.success(meetingId);
    }
    
    @GetMapping
    public ApiResponse<List<MeetingDTO>> getMeetings(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String keyword) {
        List<MeetingDTO> meetings = meetingService.getMeetings(status, department, startDate, endDate, keyword);
        return ApiResponse.success(meetings);
    }
    
    @GetMapping("/{id}")
    public ApiResponse<MeetingDTO> getMeetingById(@PathVariable Long id) {
        return ApiResponse.success(meetingService.getMeetingById(id));
    }
}
