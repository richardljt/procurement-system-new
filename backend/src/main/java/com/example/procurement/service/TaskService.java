package com.example.procurement.service;

import com.example.procurement.dto.TaskDTO;
import com.example.procurement.mapper.ProcessMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TaskService {

    @Autowired
    private ProcessMapper processMapper;

    public List<TaskDTO> getMyPendingTasks(String userId) {
        return processMapper.findPendingTasksByApproverId(userId);
    }
}
