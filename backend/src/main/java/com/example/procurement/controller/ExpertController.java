package com.example.procurement.controller;

import com.example.procurement.common.ApiResponse;
import com.example.procurement.entity.Expert;
import com.example.procurement.service.ExpertService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/experts")
@CrossOrigin(origins = "*")
public class ExpertController {
    
    @Autowired
    private ExpertService expertService;
    
    @GetMapping
    public ApiResponse<List<Expert>> list(@RequestParam(required = false) String keyword) {
        return ApiResponse.success(expertService.findAll(keyword));
    }
    
    @GetMapping("/{id}")
    public ApiResponse<Expert> get(@PathVariable Long id) {
        return ApiResponse.success(expertService.findById(id));
    }
    
    @PostMapping
    public ApiResponse<Expert> create(@RequestBody Expert expert) {
        // Mock user for now
        if (expert.getCreateUserId() == null) {
            expert.setCreateUserId("1");
            expert.setCreateUserName("Admin");
        }
        expertService.create(expert);
        return ApiResponse.success(expert);
    }
    
    @PutMapping("/{id}")
    public ApiResponse<Expert> update(@PathVariable Long id, @RequestBody Expert expert) {
        expert.setExpertId(id);
        expertService.update(expert);
        return ApiResponse.success(expert);
    }
    
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        expertService.delete(id);
        return ApiResponse.success(null);
    }
}
