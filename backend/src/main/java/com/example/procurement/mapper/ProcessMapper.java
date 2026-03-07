package com.example.procurement.mapper;

import com.example.procurement.entity.ProcessInstance;
import com.example.procurement.entity.ProcessTask;
import org.apache.ibatis.annotations.*;
import java.util.List;

@Mapper
public interface ProcessMapper {
    void insertInstance(ProcessInstance instance);
    
    @Update("UPDATE process_instance SET status = #{status}, end_time = NOW() WHERE instance_id = #{instanceId}")
    void updateInstanceStatus(@Param("instanceId") Long instanceId, @Param("status") String status);

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

    @Select("SELECT b.bid_id as business_id, b.title as business_title, b.status as status, b.deadline as create_time, '投标' as node_name, 'BID' as business_type " +
            "FROM bid b " +
            "JOIN bid_supplier bs ON b.bid_id = bs.bid_id " +
            "WHERE bs.supplier_id = #{supplierId} AND b.status = 'PUBLISHED' " +
            "ORDER BY b.create_time DESC")
    @Results({
        @Result(property = "businessId", column = "business_id"),
        @Result(property = "businessTitle", column = "business_title"),
        @Result(property = "status", column = "status"),
        @Result(property = "createTime", column = "create_time"),
        @Result(property = "nodeName", column = "node_name"),
        @Result(property = "businessType", column = "business_type")
    })
    List<com.example.procurement.dto.TaskDTO> findPendingBidsBySupplierId(Long supplierId);
}
