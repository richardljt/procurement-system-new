package com.example.procurement.controller;

import com.example.procurement.common.ApiResponse;
import com.example.procurement.entity.*;
import com.example.procurement.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/review")
@CrossOrigin(origins = "*")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    // --- Materials ---
    @GetMapping("/materials/list")
    public ApiResponse<List<MeetingMaterial>> listMaterials(@RequestParam Long meetingId) {
        return ApiResponse.success(reviewService.getMaterials(meetingId));
    }

    @PostMapping("/materials/upload")
    public ApiResponse<Void> uploadMaterial(@RequestBody MeetingMaterial material) {
        reviewService.uploadMaterial(material);
        return ApiResponse.success(null);
    }

    @PostMapping("/materials/delete/{materialId}")
    public ApiResponse<Void> deleteMaterial(@PathVariable Long materialId) {
        reviewService.deleteMaterial(materialId);
        return ApiResponse.success(null);
    }

    // --- Questions ---
    @GetMapping("/questions/list")
    public ApiResponse<List<MeetingQuestion>> listQuestions(@RequestParam Long meetingId) {
        return ApiResponse.success(reviewService.getQuestions(meetingId));
    }

    @PostMapping("/questions/ask")
    public ApiResponse<Void> askQuestion(@RequestBody MeetingQuestion question) {
        reviewService.askQuestion(question);
        return ApiResponse.success(null);
    }

    @PostMapping("/questions/reply")
    public ApiResponse<Void> replyQuestion(@RequestBody MeetingReply reply) {
        reviewService.replyQuestion(reply);
        return ApiResponse.success(null);
    }

    @PostMapping("/questions/delete/{questionId}")
    public ApiResponse<Void> deleteQuestion(@PathVariable Long questionId) {
        reviewService.deleteQuestion(questionId);
        return ApiResponse.success(null);
    }

    @PostMapping("/replies/delete/{replyId}")
    public ApiResponse<Void> deleteReply(@PathVariable Long replyId) {
        reviewService.deleteReply(replyId);
        return ApiResponse.success(null);
    }

    // --- Votes ---
    @GetMapping("/votes/list")
    public ApiResponse<List<MeetingVote>> listVotes(@RequestParam Long meetingId, @RequestParam(defaultValue = "1") Integer round) {
        return ApiResponse.success(reviewService.getVotes(meetingId, round));
    }

    @PostMapping("/votes/submit")
    public ApiResponse<Void> submitVote(@RequestBody MeetingVote vote) {
        try {
            reviewService.submitVote(vote);
            return ApiResponse.success(null);
        } catch (RuntimeException e) {
            return ApiResponse.error("ERR_VOTE_CLOSED", e.getMessage());
        }
    }
    
    @PostMapping("/votes/reset")
    public ApiResponse<Void> resetVote(@RequestBody Map<String, Object> payload) {
        Long meetingId = Long.valueOf(payload.get("meetingId").toString());
        Integer round = Integer.valueOf(payload.get("round").toString());
        String opId = payload.get("opId").toString();
        String opName = payload.get("opName").toString();
        
        reviewService.resetVote(meetingId, round, opId, opName);
        return ApiResponse.success(null);
    }

    @PostMapping("/votes/end")
    public ApiResponse<Void> endVote(@RequestBody Map<String, Object> payload) {
        Long meetingId = Long.valueOf(payload.get("meetingId").toString());
        String opId = payload.get("opId").toString();
        String opName = payload.get("opName").toString();
        
        reviewService.endVote(meetingId, opId, opName);
        return ApiResponse.success(null);
    }

    @PostMapping("/votes/start")
    public ApiResponse<Void> startVote(@RequestBody Map<String, Object> payload) {
        Long meetingId = Long.valueOf(payload.get("meetingId").toString());
        String opId = payload.get("opId").toString();
        String opName = payload.get("opName").toString();
        
        reviewService.startVote(meetingId, opId, opName);
        return ApiResponse.success(null);
    }

    // --- Logs ---
    @GetMapping("/logs/list")
    public ApiResponse<List<ReviewLog>> listLogs(@RequestParam Long meetingId) {
        return ApiResponse.success(reviewService.getLogs(meetingId));
    }

    // --- Meeting Status ---
    @GetMapping("/info")
    public ApiResponse<RequirementReviewMeeting> getMeetingInfo(@RequestParam Long meetingId) {
        return ApiResponse.success(reviewService.getMeetingInfo(meetingId));
    }

    @PostMapping("/end")
    public ApiResponse<Void> endMeeting(@RequestBody Map<String, Object> payload) {
        Long meetingId = Long.valueOf(payload.get("meetingId").toString());
        String conclusion = payload.get("conclusion").toString();
        String opId = payload.get("opId").toString();
        String opName = payload.get("opName").toString();
        
        reviewService.endMeeting(meetingId, conclusion, opId, opName);
        return ApiResponse.success(null);
    }

    @PostMapping("/start")
    public ApiResponse<Void> startMeeting(@RequestBody Map<String, Object> payload) {
        Long meetingId = Long.valueOf(payload.get("meetingId").toString());
        reviewService.startMeeting(meetingId);
        return ApiResponse.success(null);
    }
    
    @GetMapping("/my-meetings")
    public ApiResponse<List<RequirementReviewMeeting>> getMyMeetings(@RequestParam String userId) {
        return ApiResponse.success(reviewService.getMyMeetings(userId));
    }

    @GetMapping("/participants/list")
    public ApiResponse<List<MeetingParticipant>> listParticipants(@RequestParam Long meetingId) {
        return ApiResponse.success(reviewService.getParticipants(meetingId));
    }
}
