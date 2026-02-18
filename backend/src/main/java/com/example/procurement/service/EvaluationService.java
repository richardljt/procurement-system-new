package com.example.procurement.service;

import com.example.procurement.dto.*;
import com.example.procurement.entity.*;
import com.example.procurement.mapper.EvaluationMapper;
import com.example.procurement.mapper.BidMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Service
public class EvaluationService {

    @Autowired
    private EvaluationMapper evaluationMapper;

    @Autowired
    private BidMapper bidMapper;

    @Transactional
    public String launchEvaluation(LaunchEvaluationDTO dto) {
        // Validate Bid Exists
        Bid bid = bidMapper.getBidById(dto.getBidId());
        if (bid == null) {
            throw new RuntimeException("Bid not found: " + dto.getBidId());
        }

        // 1. Create Project
        EvaluationProject project = new EvaluationProject();
        String code = "EVAL-" + System.currentTimeMillis();
        project.setProjectCode(code);
        project.setTitle(dto.getTitle());
        project.setBidId(dto.getBidId());
        project.setStatus("ONGOING");
        project.setCurrentStage("BUSINESS"); // Default start stage
        project.setOrganizerName("Admin"); // Mock
        project.setStartTime(LocalDateTime.parse(dto.getStartTime()));
        
        evaluationMapper.insertProject(project);
        
        // 2. Add Experts
        if (dto.getMainExpertIds() != null) {
            for (Integer expertId : dto.getMainExpertIds()) {
                EvaluationExpert expert = new EvaluationExpert();
                expert.setEvaluationId(project.getId());
                expert.setExpertName("专家 " + expertId);
                expert.setRole("main");
                expert.setAvatar("https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-" + (expertId % 10 + 1) + ".jpg");
                expert.setIsOnline(false);
                expert.setHasConfirmed(false);
                evaluationMapper.insertExpert(expert);
            }
        }
        
        // 3. Add Suppliers from Bid
        List<BidSupplier> bidSuppliers = bidMapper.getBidSuppliers(dto.getBidId());
        if (bidSuppliers != null) {
            for (BidSupplier bs : bidSuppliers) {
                EvaluationSupplier s = new EvaluationSupplier();
                s.setEvaluationId(project.getId());
                s.setSupplierName(bs.getSupplierName());
                s.setSupplierCode("S" + bs.getSupplierId()); // Simple code
                s.setBusinessScore(BigDecimal.ZERO);
                s.setPriceScore(BigDecimal.ZERO);
                s.setTotalScore(BigDecimal.ZERO);
                s.setRankPosition(0);
                evaluationMapper.insertSupplier(s);
            }
        }
        
        // 4. Update Bid Status
        bid.setStatus("evaluating");
        bidMapper.updateBid(bid);

        // 5. Log
        logAction(project.getId(), "系统", "发起评标", "评标会议已发起");
        
        return code;
    }

    public List<EvaluationProject> getEvaluationList(String keyword, String status) {
        return evaluationMapper.getProjectList(keyword, status);
    }

    public EvaluationDetailDTO getEvaluationDetail(String code) {
        EvaluationProject project = evaluationMapper.getProjectByCode(code);
        if (project == null) return null;

        EvaluationDetailDTO dto = new EvaluationDetailDTO();
        dto.setId(project.getId());
        dto.setProjectCode(project.getProjectCode());
        dto.setTitle(project.getTitle());
        dto.setStatus(project.getStatus());
        dto.setCurrentStage(project.getCurrentStage());
        dto.setOrganizerName(project.getOrganizerName());

        // Suppliers
        List<EvaluationSupplier> suppliers = evaluationMapper.getSuppliers(project.getId());
        dto.setSuppliers(suppliers.stream().map(this::mapSupplier).collect(Collectors.toList()));

        // Experts
        List<EvaluationExpert> experts = evaluationMapper.getExperts(project.getId());
        dto.setExperts(experts.stream().map(this::mapExpert).collect(Collectors.toList()));

        // Scores
        List<EvaluationScore> scores = evaluationMapper.getScores(project.getId());
        dto.setScores(scores.stream().map(this::mapScore).collect(Collectors.toList()));

        // Logs
        List<EvaluationLog> logs = evaluationMapper.getLogs(project.getId());
        dto.setLogs(logs.stream().map(this::mapLog).collect(Collectors.toList()));

        // Feedbacks
        List<EvaluationFeedback> feedbacks = evaluationMapper.getFeedbacks(project.getId());
        dto.setFeedbacks(feedbacks.stream().map(this::mapFeedback).collect(Collectors.toList()));

        return dto;
    }

    @Transactional
    public void pauseEvaluation(String code) {
        EvaluationProject project = evaluationMapper.getProjectByCode(code);
        if (project != null) {
            evaluationMapper.updateProjectStatus(project.getId(), "PAUSED");
            logAction(project.getId(), "管理员", "暂停评标", "管理员暂停了评标流程");
        }
    }

    @Transactional
    public void resumeEvaluation(String code) {
        EvaluationProject project = evaluationMapper.getProjectByCode(code);
        if (project != null) {
            evaluationMapper.updateProjectStatus(project.getId(), "ONGOING");
            logAction(project.getId(), "管理员", "恢复评标", "管理员恢复了评标流程");
        }
    }
    
    @Transactional
    public void switchStage(String code) {
        EvaluationProject project = evaluationMapper.getProjectByCode(code);
        if (project != null) {
            String newStage = "PRICE".equals(project.getCurrentStage()) ? "BUSINESS" : "PRICE"; // Simple toggle for demo or logic
            if ("BUSINESS".equals(project.getCurrentStage())) newStage = "PRICE";
            
            evaluationMapper.updateProjectStage(project.getId(), newStage);
            logAction(project.getId(), "管理员", "切换阶段", "从 " + project.getCurrentStage() + " 切换到 " + newStage);
        }
    }

    @Transactional
    public void completeEvaluation(String code) {
        EvaluationProject project = evaluationMapper.getProjectByCode(code);
        if (project != null) {
            evaluationMapper.updateProjectStatus(project.getId(), "COMPLETED");
            
            // Also update the linked bid status to 'evaluated'
            Bid bid = bidMapper.getBidById(project.getBidId());
            if (bid != null) {
                bid.setStatus("evaluated");
                bidMapper.updateBid(bid);
            }
            
            logAction(project.getId(), "管理员", "完成评标", "评标会议结束，结果已生成");
        }
    }

    @Transactional
    public void submitScore(SubmitScoreDTO dto) {
        EvaluationProject project = evaluationMapper.getProjectByCode(dto.getProjectCode());
        if (project == null) throw new RuntimeException("Project not found");

        // If expertId is missing, try to find a default one or throw error. 
        // For demo simplicity, if missing, we pick the first expert.
        Long expertId = dto.getExpertId();
        String expertName = "未知专家";
        
        if (expertId == null) {
            List<EvaluationExpert> experts = evaluationMapper.getExperts(project.getId());
            if (!experts.isEmpty()) {
                expertId = experts.get(0).getId();
                expertName = experts.get(0).getExpertName();
            } else {
                 // Create a default expert if none exist (Auto-fix for missing experts scenario)
                 EvaluationExpert expert = new EvaluationExpert();
                 expert.setEvaluationId(project.getId());
                 expert.setExpertName("Admin"); // Default name
                 expert.setRole("organizer");
                 expert.setAvatar("https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg");
                 expert.setIsOnline(true);
                 expert.setHasConfirmed(true);
                 evaluationMapper.insertExpert(expert);
                 
                 expertId = expert.getId();
                 expertName = expert.getExpertName();
            }
        } else {
            // Validate expert exists
             List<EvaluationExpert> experts = evaluationMapper.getExperts(project.getId());
             for(EvaluationExpert e : experts) {
                 if(e.getId().equals(expertId)) {
                     expertName = e.getExpertName();
                     break;
                 }
             }
        }

        EvaluationScore existing = evaluationMapper.getScoreByExpertAndSupplier(project.getId(), expertId, dto.getSupplierId(), project.getCurrentStage());
        
        if (existing != null) {
            existing.setScore(dto.getScore());
            existing.setDetails(dto.getDetails());
            existing.setComment(dto.getComment());
            evaluationMapper.updateScore(existing);
            logAction(project.getId(), expertName, "更新评分", "更新了对供应商的评分: " + dto.getScore());
        } else {
            EvaluationScore score = new EvaluationScore();
            score.setEvaluationId(project.getId());
            score.setSupplierId(dto.getSupplierId());
            score.setExpertId(expertId);
            score.setScore(dto.getScore());
            score.setDetails(dto.getDetails());
            score.setComment(dto.getComment());
            score.setStage(project.getCurrentStage());
            evaluationMapper.insertScore(score);
             logAction(project.getId(), expertName, "提交评分", "提交了对供应商的评分: " + dto.getScore());
         }
     }

     @Transactional
     public void submitFeedback(SubmitFeedbackDTO dto) {
         EvaluationProject project = evaluationMapper.getProjectByCode(dto.getProjectCode());
         if (project == null) throw new RuntimeException("Project not found");

         EvaluationFeedback feedback = new EvaluationFeedback();
         feedback.setEvaluationId(project.getId());
         feedback.setSupplierId(dto.getSupplierId());
         feedback.setExpertName(dto.getExpertName() != null ? dto.getExpertName() : "当前专家");
         feedback.setQuestion(dto.getQuestion());
         feedback.setStatus("PENDING");
         feedback.setCreateTime(LocalDateTime.now());
         
         evaluationMapper.insertFeedback(feedback);
         logAction(project.getId(), feedback.getExpertName(), "发起提问", "提问: " + dto.getQuestion());
     }
 
     private void logAction(Long evalId, String user, String action, String details) {
        EvaluationLog log = new EvaluationLog();
        log.setEvaluationId(evalId);
        log.setUserName(user);
        log.setAction(action);
        log.setDetails(details);
        evaluationMapper.insertLog(log);
    }

    // Message System
    public List<EvaluationMessageDTO> getMessages(String projectCode, Long supplierId, String stage) {
        EvaluationProject project = evaluationMapper.getProjectByCode(projectCode);
        if (project == null) return new ArrayList<>();
        
        List<EvaluationMessage> messages = evaluationMapper.getMessages(project.getId(), supplierId, stage);
        return messages.stream().map(this::mapMessage).collect(Collectors.toList());
    }

    @Transactional
    public void sendMessage(SendMessageDTO dto) {
        EvaluationProject project = evaluationMapper.getProjectByCode(dto.getProjectCode());
        if (project == null) throw new RuntimeException("Project not found");

        EvaluationMessage msg = new EvaluationMessage();
        msg.setEvaluationId(project.getId());
        msg.setSupplierId(dto.getSupplierId());
        msg.setSenderId(1L); // Mock current user ID
        msg.setSenderName(dto.getSenderName() != null ? dto.getSenderName() : "当前专家"); // Mock
        msg.setSenderRole("expert"); // Mock role
        msg.setContent(dto.getContent());
        msg.setParentId(dto.getParentId()); // Can be null for root message
        msg.setAttachmentName(dto.getAttachmentName());
        msg.setAttachmentPath(dto.getAttachmentPath());
        msg.setStage(project.getCurrentStage()); // Set current stage
        
        evaluationMapper.insertMessage(msg);
        
        String action = dto.getParentId() == null ? "发送消息" : "回复消息";
        logAction(project.getId(), msg.getSenderName(), action, "内容: " + dto.getContent());
    }

    @Transactional
    public void deleteMessage(Long id) {
        // In real app, check permission and existence
        evaluationMapper.deleteMessage(id);
    }

    private EvaluationMessageDTO mapMessage(EvaluationMessage m) {
        EvaluationMessageDTO d = new EvaluationMessageDTO();
        d.setId(m.getId());
        d.setEvaluationId(m.getEvaluationId());
        d.setSupplierId(m.getSupplierId());
        d.setSenderId(m.getSenderId());
        d.setSenderName(m.getSenderName());
        d.setSenderRole(m.getSenderRole());
        d.setContent(m.getContent());
        d.setParentId(m.getParentId());
        d.setCreateTime(m.getCreateTime());
        d.setAttachmentName(m.getAttachmentName());
        d.setAttachmentPath(m.getAttachmentPath());
        d.setStage(m.getStage());
        return d;
    }

    // Mappers
    private EvaluationSupplierDTO mapSupplier(EvaluationSupplier s) {
        EvaluationSupplierDTO d = new EvaluationSupplierDTO();
        d.setId(s.getId());
        d.setSupplierName(s.getSupplierName());
        d.setSupplierCode(s.getSupplierCode());
        d.setBusinessScore(s.getBusinessScore());
        d.setPriceScore(s.getPriceScore());
        d.setTotalScore(s.getTotalScore());
        d.setRankPosition(s.getRankPosition());
        return d;
    }

    private EvaluationExpertDTO mapExpert(EvaluationExpert e) {
        EvaluationExpertDTO d = new EvaluationExpertDTO();
        d.setId(e.getId());
        d.setExpertName(e.getExpertName());
        d.setRole(e.getRole());
        d.setAvatar(e.getAvatar());
        d.setIsOnline(e.getIsOnline());
        d.setHasConfirmed(e.getHasConfirmed());
        return d;
    }

    private EvaluationScoreDTO mapScore(EvaluationScore s) {
        EvaluationScoreDTO d = new EvaluationScoreDTO();
        d.setId(s.getId());
        d.setSupplierId(s.getSupplierId());
        d.setExpertId(s.getExpertId());
        d.setScore(s.getScore());
        d.setDetails(s.getDetails());
        d.setComment(s.getComment());
        d.setStage(s.getStage());
        return d;
    }

    private EvaluationLogDTO mapLog(EvaluationLog l) {
        EvaluationLogDTO d = new EvaluationLogDTO();
        d.setId(l.getId());
        d.setUserName(l.getUserName());
        d.setAction(l.getAction());
        d.setDetails(l.getDetails());
        d.setTimestamp(l.getTimestamp());
        return d;
    }

    private EvaluationFeedbackDTO mapFeedback(EvaluationFeedback f) {
        EvaluationFeedbackDTO d = new EvaluationFeedbackDTO();
        d.setId(f.getId());
        d.setSupplierId(f.getSupplierId());
        d.setExpertName(f.getExpertName());
        d.setQuestion(f.getQuestion());
        d.setReply(f.getReply());
        d.setStatus(f.getStatus());
        d.setCreateTime(f.getCreateTime());
        return d;
    }
}
