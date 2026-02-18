package com.example.procurement.controller;

import com.example.procurement.common.ApiResponse;
import com.example.procurement.dto.SupplierUpdateDTO;
import com.example.procurement.entity.Supplier;
import com.example.procurement.entity.SupplierHistory;
import com.example.procurement.service.SupplierService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/supplier")
@CrossOrigin(origins = "*")
public class SupplierController {

    @Autowired
    private SupplierService supplierService;

    // Public list for Procurement (only approved)
    @GetMapping("/list")
    public ApiResponse<List<Supplier>> list(@RequestParam(required = false) String status) {
        if ("APPROVED".equals(status)) {
            return ApiResponse.success(supplierService.findAllApproved());
        }
        return ApiResponse.success(supplierService.findAll());
    }
    
    // My applications (for supplier user)
    @GetMapping("/my-applications")
    public ApiResponse<List<Supplier>> myApplications(@RequestParam String userId) {
        return ApiResponse.success(supplierService.findByCreateUserId(userId));
    }

    @GetMapping("/{id}")
    public ApiResponse<Supplier> get(@PathVariable Long id) {
        return ApiResponse.success(supplierService.findById(id));
    }

    @PostMapping("/apply")
    public ApiResponse<Supplier> apply(@RequestBody Supplier supplier) {
        // Simple mock for current user if not provided
        if (supplier.getCreateUserId() == null) {
            supplier.setCreateUserId("U004"); // Default to U004 for testing
            supplier.setCreateUserName("Supplier User");
        }
        
        if (supplier.getSupplierId() != null) {
            supplierService.update(supplier);
        } else {
            supplierService.create(supplier);
        }
        return ApiResponse.success(supplier);
    }

    @PostMapping("/update")
    public ApiResponse<String> updateSupplier(@RequestBody SupplierUpdateDTO supplierDto) {
        if (supplierDto.getUpdateUserId() == null) {
            supplierDto.setUpdateUserId("U004"); // Default mock user
            supplierDto.setUpdateUserName("System Admin");
        }
        supplierService.updateWithHistory(supplierDto, supplierDto.getChangeReason());
        return ApiResponse.success("success");
    }

    @GetMapping("/{id}/history")
    public ApiResponse<List<SupplierHistory>> getHistory(@PathVariable Long id) {
        return ApiResponse.success(supplierService.getHistory(id));
    }

    @GetMapping("/reviews")
    public ApiResponse<List<Supplier>> reviews(@RequestParam String status) {
        // Status: PENDING, PROCESSED (APPROVED or REJECTED)
        if ("PENDING".equals(status)) {
             return ApiResponse.success(supplierService.findByStatus("PENDING_APPROVAL"));
        } else {
             // For simplicity, processed includes approved and rejected. 
             // Ideally we should support multiple statuses in query
             List<Supplier> approved = supplierService.findByStatus("APPROVED");
             List<Supplier> rejected = supplierService.findByStatus("REJECTED");
             approved.addAll(rejected);
             // Sort by update time desc
             approved.sort((a, b) -> b.getUpdateTime().compareTo(a.getUpdateTime()));
             return ApiResponse.success(approved);
        }
    }
    
    @PostMapping("/approve/{id}")
    public ApiResponse<String> approve(@PathVariable Long id) {
        Supplier supplier = supplierService.findById(id);
        if (supplier != null) {
            supplier.setStatus("APPROVED");
            supplier.setIsQualified(true);
            supplierService.update(supplier);
        }
        return ApiResponse.success("success");
    }

    @PostMapping("/reject/{id}")
    public ApiResponse<String> reject(@PathVariable Long id) {
        Supplier supplier = supplierService.findById(id);
        if (supplier != null) {
            supplier.setStatus("REJECTED");
            supplier.setIsQualified(false);
            supplierService.update(supplier);
        }
        return ApiResponse.success("success");
    }
}