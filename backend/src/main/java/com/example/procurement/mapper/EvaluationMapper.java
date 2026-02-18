package com.example.procurement.mapper;

import com.example.procurement.entity.*;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface EvaluationMapper {
    EvaluationProject getProjectByCode(String projectCode);
    
    List<EvaluationSupplier> getSuppliers(Long evaluationId);
    List<EvaluationExpert> getExperts(Long evaluationId);
    List<EvaluationScore> getScores(Long evaluationId);
    List<EvaluationLog> getLogs(Long evaluationId);
    List<EvaluationFeedback> getFeedbacks(Long evaluationId);
    
    void updateProjectStatus(@Param("id") Long id, @Param("status") String status);
    void updateProjectStage(@Param("id") Long id, @Param("stage") String stage);
    
    void insertLog(EvaluationLog log);
    void insertFeedback(EvaluationFeedback feedback);
    void updateFeedbackStatus(@Param("id") Long id, @Param("reply") String reply, @Param("status") String status);
    
    EvaluationScore getScoreByExpertAndSupplier(@Param("evaluationId") Long evaluationId, @Param("expertId") Long expertId, @Param("supplierId") Long supplierId, @Param("stage") String stage);
    void insertScore(EvaluationScore score);
    void updateScore(EvaluationScore score); // If scores can be updated

    void insertProject(EvaluationProject project);
    void insertSupplier(EvaluationSupplier supplier);
    void insertExpert(EvaluationExpert expert);
    
    List<EvaluationProject> getProjectList(@Param("keyword") String keyword, @Param("status") String status);

    EvaluationProject findByBidId(@Param("bidId") Long bidId);

    // Message
    List<EvaluationMessage> getMessages(@Param("evaluationId") Long evaluationId, @Param("supplierId") Long supplierId, @Param("stage") String stage);
    void insertMessage(EvaluationMessage message);
    void deleteMessage(@Param("id") Long id);
}
