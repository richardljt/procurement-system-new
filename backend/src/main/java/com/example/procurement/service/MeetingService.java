package com.example.procurement.service;

import com.example.procurement.dto.MeetingDTO;
import com.example.procurement.dto.MeetingStatsDTO;
import com.example.procurement.entity.Expert;
import com.example.procurement.entity.MeetingExpertRel;
import com.example.procurement.entity.RequirementReviewMeeting;
import com.example.procurement.mapper.ExpertMapper;
import com.example.procurement.mapper.MeetingMapper;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MeetingService {
    
    @Autowired
    private MeetingMapper meetingMapper;
    
    @Autowired
    private ExpertMapper expertMapper;
    
    public MeetingStatsDTO getMeetingStats() {
        MeetingStatsDTO stats = new MeetingStatsDTO();
        stats.setPending(meetingMapper.countByStatus("PENDING"));
        stats.setInProgress(meetingMapper.countByStatus("IN_PROGRESS"));
        stats.setCompleted(meetingMapper.countByStatus("COMPLETED"));
        return stats;
    }
    
    @Transactional
    public Long createMeeting(MeetingDTO meetingDTO) {
        RequirementReviewMeeting meeting = new RequirementReviewMeeting();
        BeanUtils.copyProperties(meetingDTO, meeting);
        
        // Default values
        if (meeting.getStatus() == null) {
            meeting.setStatus("PENDING");
        }
        
        meetingMapper.insert(meeting);
        
        // Insert main experts
        if (meetingDTO.getMainExpertIds() != null) {
            for (Long expertId : meetingDTO.getMainExpertIds()) {
                Expert expert = expertMapper.findById(expertId);
                if (expert != null) {
                    MeetingExpertRel rel = new MeetingExpertRel();
                    rel.setMeetingId(meeting.getMeetingId());
                    rel.setExpertId(expertId);
                    rel.setExpertName(expert.getName());
                    rel.setExpertAvatar(expert.getAvatar());
                    rel.setType("MAIN");
                    meetingMapper.insertExpertRelation(rel);
                }
            }
        }
        
        // Insert backup experts
        if (meetingDTO.getBackupExpertIds() != null) {
            for (Long expertId : meetingDTO.getBackupExpertIds()) {
                Expert expert = expertMapper.findById(expertId);
                if (expert != null) {
                    MeetingExpertRel rel = new MeetingExpertRel();
                    rel.setMeetingId(meeting.getMeetingId());
                    rel.setExpertId(expertId);
                    rel.setExpertName(expert.getName());
                    rel.setExpertAvatar(expert.getAvatar());
                    rel.setType("BACKUP");
                    meetingMapper.insertExpertRelation(rel);
                }
            }
        }
        
        // Backward compatibility for existing mocked experts (List<String>)
        // We only do this if no ID-based experts are provided, to support legacy calls if any
        if ((meetingDTO.getMainExpertIds() == null || meetingDTO.getMainExpertIds().isEmpty()) && 
            (meetingDTO.getBackupExpertIds() == null || meetingDTO.getBackupExpertIds().isEmpty()) &&
             meetingDTO.getExperts() != null) {
             
            for (String expertUrl : meetingDTO.getExperts()) {
                MeetingExpertRel rel = new MeetingExpertRel();
                rel.setMeetingId(meeting.getMeetingId());
                rel.setExpertAvatar(expertUrl);
                rel.setExpertName("Expert"); 
                rel.setType("MAIN"); // Default to MAIN
                meetingMapper.insertExpertRelation(rel);
            }
        }
        
        // Insert applications
        if (meetingDTO.getApplicationIds() != null) {
            for (Long appId : meetingDTO.getApplicationIds()) {
                meetingMapper.insertApplicationRelation(meeting.getMeetingId(), appId);
            }
        }
        
        return meeting.getMeetingId();
    }
    
    public List<MeetingDTO> getMeetings(String status, String department, String startDate, String endDate, String keyword) {
        if ("all".equalsIgnoreCase(status)) {
            status = null;
        }
        List<RequirementReviewMeeting> meetings = meetingMapper.findByFilters(status, department, startDate, endDate, keyword);
        
        List<MeetingDTO> result = new ArrayList<>();
        for (RequirementReviewMeeting meeting : meetings) {
            MeetingDTO dto = new MeetingDTO();
            BeanUtils.copyProperties(meeting, dto);
            
            // Get experts
            List<MeetingExpertRel> experts = meetingMapper.findExpertsByMeetingId(meeting.getMeetingId());
            
            // Legacy support
            List<String> expertAvatars = experts.stream()
                .map(MeetingExpertRel::getExpertAvatar)
                .collect(Collectors.toList());
            dto.setExperts(expertAvatars);
            
            // New ID support
            List<Long> mainIds = experts.stream()
                .filter(e -> "MAIN".equals(e.getType()) || e.getType() == null) // Default null to MAIN for legacy
                .map(MeetingExpertRel::getExpertId)
                .collect(Collectors.toList());
            dto.setMainExpertIds(mainIds);
            
            List<Long> backupIds = experts.stream()
                .filter(e -> "BACKUP".equals(e.getType()))
                .map(MeetingExpertRel::getExpertId)
                .collect(Collectors.toList());
            dto.setBackupExpertIds(backupIds);
            
            result.add(dto);
        }
        
        return result;
    }
    
    public MeetingDTO getMeetingById(Long id) {
        RequirementReviewMeeting meeting = meetingMapper.findById(id);
        if (meeting == null) return null;
        
        MeetingDTO dto = new MeetingDTO();
        BeanUtils.copyProperties(meeting, dto);
        
        // Get experts
        List<MeetingExpertRel> experts = meetingMapper.findExpertsByMeetingId(meeting.getMeetingId());
        
        List<String> expertAvatars = experts.stream()
            .map(MeetingExpertRel::getExpertAvatar)
            .collect(Collectors.toList());
        dto.setExperts(expertAvatars);
        
        List<Long> mainIds = experts.stream()
            .filter(e -> "MAIN".equals(e.getType()) || e.getType() == null)
            .map(MeetingExpertRel::getExpertId)
            .collect(Collectors.toList());
        dto.setMainExpertIds(mainIds);
        
        List<Long> backupIds = experts.stream()
            .filter(e -> "BACKUP".equals(e.getType()))
            .map(MeetingExpertRel::getExpertId)
            .collect(Collectors.toList());
        dto.setBackupExpertIds(backupIds);
        
        // Get applications
        List<Long> applicationIds = meetingMapper.findApplicationIdsByMeetingId(meeting.getMeetingId());
        dto.setApplicationIds(applicationIds);
        
        return dto;
    }
}
