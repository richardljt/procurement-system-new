package com.example.procurement.controller;

import com.example.procurement.common.ApiResponse;
import com.example.procurement.dto.ProcurementStatsDTO;
import com.example.procurement.entity.PreApplication;
import com.example.procurement.entity.ProcurementRequest;
import com.example.procurement.entity.Supplier;
import com.example.procurement.entity.ExchangeRate;
import com.example.procurement.service.ProcurementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/procurement")
@CrossOrigin(origins = "*")
public class ProcurementController {

    @Autowired
    private ProcurementService procurementService;

    @GetMapping("/list")
    public ApiResponse<List<ProcurementRequest>> list(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String procurementType,
            @RequestParam(required = false) String urgencyLevel,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Boolean excludeScheduled) {
        System.out.println("Search params: status=" + status + ", type=" + procurementType + ", urgency=" + urgencyLevel + 
                         ", start=" + startDate + ", end=" + endDate + ", keyword=" + keyword + ", excludeScheduled=" + excludeScheduled);
        
        // Append time to endDate to include the entire day
        if (endDate != null && !endDate.isEmpty() && endDate.matches("\\d{4}-\\d{2}-\\d{2}")) {
            endDate = endDate + " 23:59:59";
        }
        
        return ApiResponse.success(procurementService.findAll(status, procurementType, urgencyLevel, startDate, endDate, keyword, excludeScheduled));
    }
    
    @GetMapping("/detail/{id}")
    public ApiResponse<ProcurementRequest> getDetail(@PathVariable Long id) {
        return ApiResponse.success(procurementService.findById(id));
    }
    
    @GetMapping("/pre-applications")
    public ApiResponse<List<PreApplication>> listPreApplications() {
        return ApiResponse.success(procurementService.getAllPreApplications());
    }
    
    @GetMapping("/pre-applications/{id}")
    public ApiResponse<PreApplication> getPreApplication(@PathVariable Long id) {
        return ApiResponse.success(procurementService.getPreApplicationById(id));
    }
    
    @GetMapping("/suppliers")
    public ApiResponse<List<Supplier>> listSuppliers() {
        return ApiResponse.success(procurementService.getAllSuppliers());
    }
    
    @GetMapping("/exchange-rates")
    public ApiResponse<List<ExchangeRate>> listExchangeRates() {
        return ApiResponse.success(procurementService.getAllExchangeRates());
    }

    @GetMapping("/stats")
    public ApiResponse<ProcurementStatsDTO> getStats(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String procurementType,
            @RequestParam(required = false) String urgencyLevel,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String keyword) {
        
        // Append time to endDate to include the entire day
        if (endDate != null && !endDate.isEmpty() && endDate.matches("\\d{4}-\\d{2}-\\d{2}")) {
            endDate = endDate + " 23:59:59";
        }
        return ApiResponse.success(procurementService.getStats(status, procurementType, urgencyLevel, startDate, endDate, keyword));
    }

    @PostMapping("/create")
    public ApiResponse<String> create(@RequestBody ProcurementRequest request) {
        procurementService.create(request);
        return ApiResponse.success("success");
    }

    @PostMapping("/approve/{id}")
    public ApiResponse<String> approve(@PathVariable Long id, @RequestBody(required = false) java.util.Map<String, String> body) {
        String comment = (body != null) ? body.get("comment") : null;
        procurementService.approve(id, comment);
        return ApiResponse.success("success");
    }

    @PostMapping("/reject/{id}")
    public ApiResponse<String> reject(@PathVariable Long id, @RequestBody java.util.Map<String, String> body) {
        procurementService.reject(id, body.get("reason"));
        return ApiResponse.success("success");
    }
}
