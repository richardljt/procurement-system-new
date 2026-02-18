package com.example.procurement.controller;

import com.example.procurement.common.ApiResponse;
import com.example.procurement.dto.EvaluationDetailDTO;
import com.example.procurement.dto.LaunchEvaluationDTO;
import com.example.procurement.dto.EvaluationMessageDTO;
import com.example.procurement.dto.SendMessageDTO;
import com.example.procurement.entity.EvaluationProject;
import com.example.procurement.service.EvaluationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/evaluation")
@CrossOrigin(origins = "*")
public class EvaluationController {

    @Autowired
    private EvaluationService evaluationService;

    @PostMapping("/launch")
    public ApiResponse<String> launch(@RequestBody LaunchEvaluationDTO dto) {
        String code = evaluationService.launchEvaluation(dto);
        return ApiResponse.success(code);
    }

    @GetMapping("/list")
    public ApiResponse<List<EvaluationProject>> getList(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status) {
        return ApiResponse.success(evaluationService.getEvaluationList(keyword, status));
    }

    @GetMapping("/{code}")
    public ApiResponse<EvaluationDetailDTO> getDetail(@PathVariable String code) {
        return ApiResponse.success(evaluationService.getEvaluationDetail(code));
    }

    @PostMapping("/{code}/pause")
    public ApiResponse<String> pause(@PathVariable String code) {
        evaluationService.pauseEvaluation(code);
        return ApiResponse.success("已暂停");
    }

    @PostMapping("/{code}/resume")
    public ApiResponse<String> resume(@PathVariable String code) {
        evaluationService.resumeEvaluation(code);
        return ApiResponse.success("已恢复");
    }

    @PostMapping("/{code}/switch-stage")
    public ApiResponse<String> switchStage(@PathVariable String code) {
        evaluationService.switchStage(code);
        return ApiResponse.success("已切换阶段");
    }

    @PostMapping("/{code}/complete")
    public ApiResponse<String> complete(@PathVariable String code) {
        evaluationService.completeEvaluation(code);
        return ApiResponse.success("评标已完成");
    }

    @PostMapping("/{code}/score")
    public ApiResponse<String> submitScore(@PathVariable String code, @RequestBody com.example.procurement.dto.SubmitScoreDTO dto) {
        dto.setProjectCode(code);
        evaluationService.submitScore(dto);
        return ApiResponse.success("评分已提交");
    }

    @PostMapping("/{code}/feedback")
    public ApiResponse<String> submitFeedback(@PathVariable String code, @RequestBody com.example.procurement.dto.SubmitFeedbackDTO dto) {
        dto.setProjectCode(code);
        evaluationService.submitFeedback(dto);
        return ApiResponse.success("提问已发送");
    }

    // Message System
    @GetMapping("/{code}/messages")
    public ApiResponse<List<EvaluationMessageDTO>> getMessages(@PathVariable String code, @RequestParam(required = false) Long supplierId, @RequestParam(required = false) String stage) {
        return ApiResponse.success(evaluationService.getMessages(code, supplierId, stage));
    }

    @PostMapping("/{code}/message/send")
    public ApiResponse<String> sendMessage(@PathVariable String code, @RequestBody SendMessageDTO dto) {
        dto.setProjectCode(code);
        evaluationService.sendMessage(dto);
        return ApiResponse.success("消息已发送");
    }

    @PostMapping("/{code}/message/reply")
    public ApiResponse<String> replyMessage(@PathVariable String code, @RequestBody SendMessageDTO dto) {
        dto.setProjectCode(code);
        if (dto.getParentId() == null) {
            return ApiResponse.error("ERR400", "Parent ID is required for reply");
        }
        evaluationService.sendMessage(dto);
        return ApiResponse.success("回复已发送");
    }

    @DeleteMapping("/{code}/message/{id}")
    public ApiResponse<String> deleteMessage(@PathVariable String code, @PathVariable Long id) {
        evaluationService.deleteMessage(id);
        return ApiResponse.success("消息已删除");
    }
}
