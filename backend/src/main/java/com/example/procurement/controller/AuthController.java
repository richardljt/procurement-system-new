package com.example.procurement.controller;

import com.example.procurement.common.ApiResponse;
import com.example.procurement.dto.LoginRequest;
import com.example.procurement.entity.Resource;
import com.example.procurement.entity.User;
import com.example.procurement.mapper.AuthMapper;
import com.example.procurement.mapper.ProcessMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthMapper authMapper;
    
    @Autowired
    private ProcessMapper processMapper;

    @PostMapping("/login")
    public ApiResponse<Map<String, Object>> login(@RequestBody LoginRequest request) {
        User user = authMapper.findUserByUsername(request.getUsername());
        
        if (user != null && user.getPassword().equals(request.getPassword())) { // Plain text for demo
            return ApiResponse.success(buildUserInfo(user));
        }
        
        return ApiResponse.error("Invalid credentials");
    }

    @GetMapping("/user-info")
    public ApiResponse<Map<String, Object>> getUserInfo(@RequestParam String userId) {
        User user = authMapper.findUserByUserId(userId);
        if (user != null) {
            return ApiResponse.success(buildUserInfo(user));
        }
        return ApiResponse.error("User not found");
    }

    private Map<String, Object> buildUserInfo(User user) {
        Map<String, Object> data = new HashMap<>();
        String token = UUID.randomUUID().toString();
        data.put("token", token);
        data.put("username", user.getUsername());
        data.put("userId", user.getUserId());
        data.put("realName", user.getRealName());
        data.put("role", user.getRole());
        data.put("department", user.getDepartment());
        
        // Fetch menus
        List<Resource> resources = authMapper.findResourcesByUserId(user.getUserId());
        data.put("menus", groupResources(resources, user.getUserId()));
        
        return data;
    }
    
    private List<Map<String, Object>> groupResources(List<Resource> resources, String userId) {
        // Group by groupName
        Map<String, List<Resource>> grouped = resources.stream()
            .collect(Collectors.groupingBy(Resource::getGroupName, LinkedHashMap::new, Collectors.toList()));
            
        List<Map<String, Object>> result = new ArrayList<>();
        
        // Define standard order of groups
        List<String> order = Arrays.asList("待办任务", "采购申请管理", "集采办管理", "合同管理");
        
        for (String groupName : order) {
            if (grouped.containsKey(groupName)) {
                Map<String, Object> group = new HashMap<>();
                group.put("title", groupName);
                
                List<Map<String, Object>> items = grouped.get(groupName).stream()
                    .filter(r -> !Arrays.asList("抄送我的", "我的收藏", "历史申请").contains(r.getResourceName()))
                    .map(r -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("label", r.getResourceName());
                    item.put("path", r.getPath());
                    item.put("icon", r.getIcon());
                    
                    // Add badge/count logic here
                    if ("待我处理".equals(r.getResourceName())) {
                         List<?> tasks = processMapper.findPendingTasksByApproverId(userId);
                         if (tasks != null && !tasks.isEmpty()) {
                             item.put("badge", String.valueOf(tasks.size()));
                             item.put("badgeColor", "bg-red-500");
                         }
                    }
                    
                    return item;
                }).collect(Collectors.toList());
                
                group.put("items", items);
                result.add(group);
            }
        }
        
        return result;
    }
}
