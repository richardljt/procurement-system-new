package com.example.procurement.controller;

import com.example.procurement.common.ApiResponse;
import com.example.procurement.dto.ProcessStatusDTO;
import com.example.procurement.entity.*;
import com.example.procurement.mapper.*;
import com.example.procurement.service.ContractService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/process")
public class ProcessController {

    @Autowired
    private ProcurementMapper procurementMapper;
    @Autowired
    private MeetingMapper meetingMapper;
    @Autowired
    private BidMapper bidMapper;
    @Autowired
    private EvaluationMapper evaluationMapper;
    @Autowired
    private ContractService contractService;

    @GetMapping("/{procurementId}/status")
    public ApiResponse<ProcessStatusDTO> getProcessStatus(@PathVariable Long procurementId) {
        ProcessStatusDTO dto = new ProcessStatusDTO();

        // Stage 1: Procurement Application
        ProcurementRequest request = procurementMapper.findById(procurementId);
        dto.setStage1(new ProcessStatusDTO.StageStatus());
        if (request != null) {
            // Populate suppliers
            request.setSupplierList(procurementMapper.findSuppliersByRequestId(procurementId));
            
            dto.getStage1().setData(request);
            String status = request.getStatus();
            if ("APPROVED".equals(status) || "REVIEW_PASSED".equals(status) || "REJECTED".equals(status)) {
                dto.getStage1().setStatus("COMPLETED");
            } else {
                dto.getStage1().setStatus("IN_PROGRESS");
            }
        } else {
             dto.getStage1().setStatus("PENDING");
        }

        // Stage 2: Requirement Review Meeting
        List<RequirementReviewMeeting> meetings = meetingMapper.findByProcurementRequestId(procurementId);
        dto.setStage2(new ProcessStatusDTO.StageStatus());
        if (meetings != null && !meetings.isEmpty()) {
            RequirementReviewMeeting meeting = meetings.get(0); // Assuming one meeting
            dto.getStage2().setData(meeting);
            if ("COMPLETED".equals(meeting.getStatus())) {
                dto.getStage2().setStatus("COMPLETED");
            } else if ("PENDING".equals(meeting.getStatus())) {
                dto.getStage2().setStatus("PENDING");
            } else {
                dto.getStage2().setStatus("IN_PROGRESS");
            }
        } else {
            dto.getStage2().setStatus("PENDING");
        }

        // Stage 3: Bidding
        List<Bid> bids = bidMapper.findByProcurementRequestId(procurementId);
        dto.setStage3(new ProcessStatusDTO.StageStatus());
        dto.setStage4(new ProcessStatusDTO.StageStatus());
        
        if (bids != null && !bids.isEmpty()) {
            Bid bid = bids.get(0);
            dto.getStage3().setData(bid);
            if ("ENDED".equals(bid.getStatus()) || "EVALUATION".equals(bid.getStatus())) {
                dto.getStage3().setStatus("COMPLETED");
            } else if ("PUBLISHED".equals(bid.getStatus())) {
                dto.getStage3().setStatus("IN_PROGRESS");
            } else {
                dto.getStage3().setStatus("PENDING");
            }
            
            // Stage 4: Evaluation Meeting
            EvaluationProject evaluation = evaluationMapper.findByBidId(bid.getBidId());
            if (evaluation != null) {
                dto.getStage4().setData(evaluation);
                if ("COMPLETED".equals(evaluation.getStatus())) {
                    dto.getStage4().setStatus("COMPLETED");
                } else if ("ONGOING".equals(evaluation.getStatus())) {
                     dto.getStage4().setStatus("IN_PROGRESS");
                } else {
                    dto.getStage4().setStatus("PENDING");
                }
            } else {
                dto.getStage4().setStatus("PENDING");
            }
        } else {
             dto.getStage3().setStatus("PENDING");
             dto.getStage4().setStatus("PENDING");
        }

        // Stage 5: Contract
        dto.setStage5(new ProcessStatusDTO.StageStatus());
        List<Contract> contracts = contractService.getContractsByProcurementId(procurementId);
        if (contracts != null && !contracts.isEmpty()) {
            dto.getStage5().setData(contracts.get(0));
            if ("SIGNED".equals(contracts.get(0).getStatus()) || "ARCHIVED".equals(contracts.get(0).getStatus())) {
                dto.getStage5().setStatus("COMPLETED");
            } else {
                dto.getStage5().setStatus("IN_PROGRESS");
            }
        } else {
             dto.getStage5().setStatus("PENDING");
        }

        return ApiResponse.success(dto);
    }
}
