package com.example.procurement.controller;

import com.example.procurement.common.ApiResponse;
import com.example.procurement.dto.TaskDTO;
import com.example.procurement.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "*")
public class TaskController {

    @Autowired
    private TaskService taskService;

    @GetMapping("/my-tasks")
    public ApiResponse<List<TaskDTO>> getMyTasks(@RequestParam String userId) {
        // In a real application, userId should be extracted from the security context
        return ApiResponse.success(taskService.getMyPendingTasks(userId));
    }
}
