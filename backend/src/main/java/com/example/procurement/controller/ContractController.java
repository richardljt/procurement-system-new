package com.example.procurement.controller;

import com.example.procurement.common.ApiResponse;
import com.example.procurement.dto.ContractArchivingItemDTO;
import com.example.procurement.entity.Contract;
import com.example.procurement.service.ContractService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contracts")
@CrossOrigin(origins = "*")
public class ContractController {

    @Autowired
    private ContractService contractService;

    @PostMapping
    public ApiResponse<Void> createContract(@RequestBody Contract contract) {
        contractService.createContract(contract);
        return ApiResponse.success(null);
    }

    @PutMapping
    public ApiResponse<Void> updateContract(@RequestBody Contract contract) {
        contractService.updateContract(contract);
        return ApiResponse.success(null);
    }

    @GetMapping("/{id}")
    public ApiResponse<Contract> getContract(@PathVariable Long id) {
        return ApiResponse.success(contractService.getContract(id));
    }
    
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteContract(@PathVariable Long id) {
        contractService.deleteContract(id);
        return ApiResponse.success(null);
    }

    @GetMapping("/archiving-list")
    public ApiResponse<List<ContractArchivingItemDTO>> getArchivingList(@RequestParam(required = false) String keyword) {
        return ApiResponse.success(contractService.getArchivingList(keyword));
    }

    @PostMapping("/archiving")
    public ApiResponse<Void> saveContractArchiving(@RequestBody Contract contract) {
        contractService.saveContractArchiving(contract);
        return ApiResponse.success(null);
    }
}
