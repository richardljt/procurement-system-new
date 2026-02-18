package com.example.procurement.controller;

import com.example.procurement.common.ApiResponse;
import com.example.procurement.dto.BidMonitoringDTO;
import com.example.procurement.entity.Bid;
import com.example.procurement.service.BidService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bid")
@CrossOrigin(origins = "*")
public class BidController {

    @Autowired
    private BidService bidService;

    @GetMapping("/list")
    public ApiResponse<List<Bid>> list(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status) {
        return ApiResponse.success(bidService.getBidList(keyword, status));
    }

    @GetMapping("/{id}")
    public ApiResponse<Bid> getDetail(@PathVariable Long id) {
        return ApiResponse.success(bidService.getBidById(id));
    }

    // Used for editing draft
    @GetMapping("/draft/{id}")
    public ApiResponse<Bid> getDraft(@PathVariable Long id) {
        return ApiResponse.success(bidService.getBidById(id));
    }

    @PostMapping("/create")
    public ApiResponse<String> create(@RequestBody Bid bid) {
        bidService.createBid(bid);
        return ApiResponse.success("success");
    }

    @PostMapping("/save-draft")
    public ApiResponse<String> saveDraft(@RequestBody Bid bid) {
        if (bid.getBidId() != null) {
            bidService.updateBid(bid);
        } else {
            bid.setStatus("draft");
            bidService.createBid(bid);
        }
        return ApiResponse.success("success");
    }

    @PostMapping("/initiate")
    public ApiResponse<String> initiate(@RequestBody Bid bid) {
        // Delegate to service to handle status and logic consistently
        bidService.initiateBid(bid);
        return ApiResponse.success("success");
    }
    
    @PutMapping("/{id}")
    public ApiResponse<String> update(@PathVariable Long id, @RequestBody Bid bid) {
        bid.setBidId(id);
        bidService.updateBid(bid);
        return ApiResponse.success("success");
    }
    
    @DeleteMapping("/{id}")
    public ApiResponse<String> delete(@PathVariable Long id) {
        // Implement soft delete or hard delete if needed
        return ApiResponse.success("success");
    }

    // Monitoring Endpoints

    @GetMapping("/{id}/monitor")
    public ApiResponse<BidMonitoringDTO> getBidMonitoring(@PathVariable Long id) {
        return ApiResponse.success(bidService.getBidMonitoring(id));
    }

    @PostMapping("/{id}/refresh")
    public ApiResponse<BidMonitoringDTO> refreshBidMonitoring(@PathVariable Long id) {
        return ApiResponse.success(bidService.getBidMonitoring(id));
    }

    @PostMapping("/{id}/terminate")
    public ApiResponse<String> terminateBid(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        bidService.terminateBid(id, payload.get("reason"));
        return ApiResponse.success("Terminated");
    }

    @PostMapping("/{id}/remind")
    public ApiResponse<String> remindSuppliers(@PathVariable Long id, @RequestBody(required = false) Map<String, List<String>> payload) {
        // Mock remind logic
        return ApiResponse.success("Reminders sent");
    }

    @GetMapping("/{id}/export")
    public ResponseEntity<ByteArrayResource> exportBidMonitoring(@PathVariable Long id) {
        String data = "Bid Monitoring Data Export for ID " + id + "\nTimestamp: " + java.time.LocalDateTime.now();
        ByteArrayResource resource = new ByteArrayResource(data.getBytes(StandardCharsets.UTF_8));

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment;filename=bid_monitor_" + id + ".txt")
                .contentType(MediaType.TEXT_PLAIN)
                .contentLength(data.length())
                .body(resource);
    }
}
