package com.example.procurement.service;

import com.example.procurement.entity.*;
import com.example.procurement.mapper.ReviewMapper;
import com.example.procurement.mapper.MeetingMapper;
import com.example.procurement.mapper.ProcurementMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ReviewService {

    @Autowired
    private ReviewMapper reviewMapper;

    @Autowired
    private MeetingMapper meetingMapper;

    @Autowired
    private ProcurementMapper procurementMapper;

    // Materials
    public List<MeetingMaterial> getMaterials(Long meetingId) {
        return reviewMapper.findMaterialsByMeetingId(meetingId);
    }

    public void uploadMaterial(MeetingMaterial material) {
        reviewMapper.insertMaterial(material);
        logAction(material.getMeetingId(), material.getUploaderId(), material.getUploaderName(), "UPLOAD_MATERIAL", "Uploaded: " + material.getFileName());
    }

    public void deleteMaterial(Long materialId) {
        reviewMapper.deleteMaterial(materialId);
    }

    // Questions
    public List<MeetingQuestion> getQuestions(Long meetingId) {
        return reviewMapper.findQuestionsByMeetingId(meetingId);
    }

    public void askQuestion(MeetingQuestion question) {
        reviewMapper.insertQuestion(question);
        String detail = "Asked: " + question.getContent();
        if (question.getAttachmentName() != null) {
            detail += " (Attach: " + question.getAttachmentName() + ")";
        }
        logAction(question.getMeetingId(), question.getAskerId(), question.getAskerName(), "ASK_QUESTION", detail);
    }

    public void replyQuestion(MeetingReply reply) {
        reviewMapper.insertReply(reply);
        // We might want to update question status to ANSWERED here
        reviewMapper.updateQuestionStatus(reply.getQuestionId(), "ANSWERED");
        
        // Find meetingId for logging
        Long meetingId = reviewMapper.findMeetingIdByQuestionId(reply.getQuestionId());
        if (meetingId != null) {
            String detail = "Replied to question #" + reply.getQuestionId() + ": " + reply.getContent();
            if (reply.getAttachmentName() != null) {
                detail += " (Attach: " + reply.getAttachmentName() + ")";
            }
            logAction(meetingId, reply.getReplierId(), reply.getReplierName(), "REPLY_QUESTION", detail);
        }
    }

    public void deleteQuestion(Long questionId) {
        reviewMapper.deleteQuestion(questionId);
    }

    public void deleteReply(Long replyId) {
        reviewMapper.deleteReply(replyId);
    }

    // Votes
    public List<MeetingVote> getVotes(Long meetingId, Integer round) {
        return reviewMapper.findVotesByMeetingIdAndRound(meetingId, round);
    }

    public void submitVote(MeetingVote vote) {
        // Validate vote status
        RequirementReviewMeeting meeting = reviewMapper.findMeetingById(vote.getMeetingId());
        if (meeting != null && !"OPEN".equals(meeting.getVoteStatus())) {
             throw new RuntimeException("投票已关闭，无法提交评价结果");
        }

        reviewMapper.insertVote(vote);
        logAction(vote.getMeetingId(), vote.getVoterId(), vote.getVoterName(), "SUBMIT_VOTE", "Voted in round " + vote.getRound());
    }
    
    // Admin Vote Controls
    @Transactional
    public void resetVote(Long meetingId, Integer round, String opId, String opName) {
        reviewMapper.deleteVotesByRound(meetingId, round);
        logAction(meetingId, opId, opName, "RESET_VOTE", "Reset votes for round " + round);
    }
    
    @Transactional
    public void endVote(Long meetingId, String opId, String opName) {
        reviewMapper.closeVoting(meetingId);
        logAction(meetingId, opId, opName, "END_VOTE", "Closed voting session");
    }

    @Transactional
    public void startVote(Long meetingId, String opId, String opName) {
        reviewMapper.openVoting(meetingId);
        logAction(meetingId, opId, opName, "START_VOTE", "Opened voting session");
    }

    // Logs
    public List<ReviewLog> getLogs(Long meetingId) {
        return reviewMapper.findLogsByMeetingId(meetingId);
    }

    public void logAction(Long meetingId, String opId, String opName, String action, String detail) {
        ReviewLog log = new ReviewLog();
        log.setMeetingId(meetingId);
        log.setOperatorId(opId);
        log.setOperatorName(opName);
        log.setActionType(action);
        log.setDetail(detail);
        reviewMapper.insertLog(log);
    }

    // Meeting Status
    public RequirementReviewMeeting getMeetingInfo(Long meetingId) {
        return reviewMapper.findMeetingById(meetingId);
    }

    @Transactional
    public void endMeeting(Long meetingId, String conclusion, String opId, String opName) {
        reviewMapper.completeMeeting(meetingId, conclusion);
        reviewMapper.closeVoting(meetingId); // Auto close voting
        
        // Update procurement request status if meeting passed
        if (conclusion != null && (
            conclusion.contains("通过") || 
            "PASS".equalsIgnoreCase(conclusion) || 
            "APPROVED".equalsIgnoreCase(conclusion))) {
            List<Long> appIds = meetingMapper.findApplicationIdsByMeetingId(meetingId);
            if (appIds != null) {
                for (Long appId : appIds) {
                    procurementMapper.updateStatus(appId, "REVIEW_PASSED", null);
                }
            }
        }
        
        logAction(meetingId, opId, opName, "END_MEETING", "Ended meeting with conclusion: " + conclusion);
    }

    public void startMeeting(Long meetingId) {
        reviewMapper.startMeeting(meetingId);
        
        // Add random experts to meeting for demo if not exists
        // In real app, this should be done when scheduling the meeting
        // We will mock adding 'Li Ming' (E001) and 'Wang Qiang' (E002) as participants for demo
        try {
            reviewMapper.addParticipant(meetingId, "E001", "李明", "EXPERT");
            reviewMapper.addParticipant(meetingId, "E002", "王强", "EXPERT");
        } catch (Exception e) {
            // Ignore if already exists (duplicate key)
        }
    }
    
    public List<RequirementReviewMeeting> getMyMeetings(String userId) {
        // Filter by userId participation
        return reviewMapper.findMyMeetings(userId);
    }
    
    public List<MeetingParticipant> getParticipants(Long meetingId) {
        return reviewMapper.findParticipantsByMeetingId(meetingId);
    }
}
