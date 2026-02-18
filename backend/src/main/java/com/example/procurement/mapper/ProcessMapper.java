package com.example.procurement.mapper;

import com.example.procurement.entity.ProcessInstance;
import com.example.procurement.entity.ProcessTask;
import org.apache.ibatis.annotations.*;
import java.util.List;

@Mapper
public interface ProcessMapper {
    @Insert("INSERT INTO process_instance (business_key, business_type, status, initiator_id, initiator_name, start_time) " +
            "VALUES (#{businessKey}, #{businessType}, #{status}, #{initiatorId}, #{initiatorName}, NOW())")
    @Options(useGeneratedKeys = true, keyProperty = "instanceId")
    void insertInstance(ProcessInstance instance);
    
    @Update("UPDATE process_instance SET status = #{status}, end_time = NOW() WHERE instance_id = #{instanceId}")
    void updateInstanceStatus(@Param("instanceId") Long instanceId, @Param("status") String status);

    @Insert("INSERT INTO process_task (instance_id, node_name, node_type, approver_id, approver_name, status, sequence, create_time, handle_time) " +
            "VALUES (#{instanceId}, #{nodeName}, #{nodeType}, #{approverId}, #{approverName}, #{status}, #{sequence}, NOW(), #{handleTime})")
    void insertTask(ProcessTask task);
    
    @Update("UPDATE process_task SET status = #{status}, comment = #{comment}, handle_time = NOW() WHERE task_id = #{taskId}")
    void updateTask(ProcessTask task);
    
    @Select("SELECT * FROM process_instance WHERE business_key = #{businessKey}")
    ProcessInstance findInstanceByBusinessKey(String businessKey);
    
    @Select("SELECT * FROM process_task WHERE instance_id = #{instanceId} ORDER BY sequence ASC")
    List<ProcessTask> findTasksByInstanceId(Long instanceId);
    
    @Select("SELECT * FROM process_task WHERE instance_id = #{instanceId} AND status = 'PENDING' ORDER BY sequence ASC LIMIT 1")
    ProcessTask findCurrentPendingTask(Long instanceId);

    @Select("SELECT t.task_id, t.node_name, t.node_type, t.status, t.create_time, t.instance_id, " +
            "i.business_key, i.business_type, pr.procurement_request_id as business_id, pr.title as business_title " +
            "FROM process_task t " +
            "JOIN process_instance i ON t.instance_id = i.instance_id " +
            "LEFT JOIN procurement_request pr ON i.business_key = pr.request_code " +
            "WHERE t.approver_id = #{approverId} " +
            "AND t.status = 'PENDING' " +
            "ORDER BY t.create_time DESC")
    @Results({
        @Result(property = "taskId", column = "task_id"),
        @Result(property = "nodeName", column = "node_name"),
        @Result(property = "nodeType", column = "node_type"),
        @Result(property = "status", column = "status"),
        @Result(property = "createTime", column = "create_time"),
        @Result(property = "instanceId", column = "instance_id"),
        @Result(property = "businessKey", column = "business_key"),
        @Result(property = "businessType", column = "business_type"),
        @Result(property = "businessId", column = "business_id"),
        @Result(property = "businessTitle", column = "business_title")
    })
    List<com.example.procurement.dto.TaskDTO> findPendingTasksByApproverId(String approverId);
}
