package com.example.procurement.mapper;

import com.example.procurement.entity.MeetingExpertRel;
import com.example.procurement.entity.RequirementReviewMeeting;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface MeetingMapper {
    
    @Select("SELECT * FROM requirement_review_meeting ORDER BY create_time DESC")
    @Results({
        @Result(property = "meetingId", column = "meeting_id"),
        @Result(property = "projectName", column = "project_name"),
        @Result(property = "projectNo", column = "project_no"),
        @Result(property = "startTime", column = "start_time"),
        @Result(property = "endTime", column = "end_time"),
        @Result(property = "organizerName", column = "organizer_name"),
        @Result(property = "bidId", column = "bid_id"),
        @Result(property = "bidTitle", column = "bid_title"),
        @Result(property = "createTime", column = "create_time"),
        @Result(property = "createUserId", column = "create_user_id"),
        @Result(property = "createUserName", column = "create_user_name"),
        @Result(property = "updateTime", column = "update_time"),
        @Result(property = "updateUserId", column = "update_user_id"),
        @Result(property = "updateUserName", column = "update_user_name")
    })
    List<RequirementReviewMeeting> findAll();
    
    @Select("<script>" +
            "SELECT * FROM requirement_review_meeting " +
            "WHERE 1=1 " +
            "<if test='status != null and status != \"\"'> AND status = #{status} </if>" +
            "<if test='department != null and department != \"\"'> AND department = #{department} </if>" +
            "<if test='startDate != null'> AND start_time &gt;= #{startDate} </if>" +
            "<if test='endDate != null'> AND start_time &lt;= #{endDate} </if>" +
            "<if test='keyword != null and keyword != \"\"'> " +
            "  AND (title LIKE CONCAT('%', #{keyword}, '%') OR project_name LIKE CONCAT('%', #{keyword}, '%')) " +
            "</if>" +
            "ORDER BY create_time DESC" +
            "</script>")
    @Results({
        @Result(property = "meetingId", column = "meeting_id"),
        @Result(property = "title", column = "title"),
        @Result(property = "projectName", column = "project_name"),
        @Result(property = "projectNo", column = "project_no"),
        @Result(property = "department", column = "department"),
        @Result(property = "amount", column = "amount"),
        @Result(property = "startTime", column = "start_time"),
        @Result(property = "endTime", column = "end_time"),
        @Result(property = "organizerName", column = "organizer_name"),
        @Result(property = "createTime", column = "create_time"),
        @Result(property = "createUserId", column = "create_user_id"),
        @Result(property = "createUserName", column = "create_user_name"),
        @Result(property = "updateTime", column = "update_time"),
        @Result(property = "updateUserId", column = "update_user_id"),
        @Result(property = "updateUserName", column = "update_user_name")
    })
    List<RequirementReviewMeeting> findByFilters(@Param("status") String status, 
                                                 @Param("department") String department,
                                                 @Param("startDate") String startDate,
                                                 @Param("endDate") String endDate,
                                                 @Param("keyword") String keyword);
    
    @Select("SELECT * FROM meeting_expert_rel WHERE meeting_id = #{meetingId}")
    @Results({
        @Result(property = "relationId", column = "relation_id"),
        @Result(property = "meetingId", column = "meeting_id"),
        @Result(property = "expertId", column = "expert_id"),
        @Result(property = "expertName", column = "expert_name"),
        @Result(property = "expertAvatar", column = "expert_avatar"),
        @Result(property = "type", column = "type"),
        @Result(property = "createTime", column = "create_time"),
        @Result(property = "createUserId", column = "create_user_id"),
        @Result(property = "createUserName", column = "create_user_name")
    })
    List<MeetingExpertRel> findExpertsByMeetingId(Long meetingId);
    
    @Select("SELECT COUNT(*) FROM requirement_review_meeting WHERE status = #{status}")
    int countByStatus(String status);
    
    @Insert("INSERT INTO requirement_review_meeting (title, project_name, project_no, department, amount, start_time, end_time, location, organizer_name, status, bid_id, bid_title, create_time, create_user_name) " +
            "VALUES (#{title}, #{projectName}, #{projectNo}, #{department}, #{amount}, #{startTime}, #{endTime}, #{location}, #{organizerName}, #{status}, #{bidId}, #{bidTitle}, NOW(), #{createUserName})")
    @Options(useGeneratedKeys = true, keyProperty = "meetingId")
    void insert(RequirementReviewMeeting meeting);
    
    @Insert("INSERT INTO meeting_expert_rel (meeting_id, expert_id, expert_name, expert_avatar, type, create_time) VALUES (#{meetingId}, #{expertId}, #{expertName}, #{expertAvatar}, #{type}, NOW())")
    void insertExpertRelation(MeetingExpertRel relation);
    
    @Insert("INSERT INTO meeting_application_rel (meeting_id, procurement_request_id, create_time) VALUES (#{meetingId}, #{procurementRequestId}, NOW())")
    void insertApplicationRelation(@Param("meetingId") Long meetingId, @Param("procurementRequestId") Long procurementRequestId);

    @Select("SELECT procurement_request_id FROM meeting_application_rel WHERE meeting_id = #{meetingId}")
    List<Long> findApplicationIdsByMeetingId(Long meetingId);
    
    @Select("SELECT * FROM requirement_review_meeting WHERE meeting_id = #{id}")
    @Results({
        @Result(property = "meetingId", column = "meeting_id"),
        @Result(property = "projectName", column = "project_name"),
        @Result(property = "projectNo", column = "project_no"),
        @Result(property = "startTime", column = "start_time"),
        @Result(property = "endTime", column = "end_time"),
        @Result(property = "organizerName", column = "organizer_name"),
        @Result(property = "bidId", column = "bid_id"),
        @Result(property = "bidTitle", column = "bid_title"),
        @Result(property = "createTime", column = "create_time"),
        @Result(property = "createUserId", column = "create_user_id"),
        @Result(property = "createUserName", column = "create_user_name"),
        @Result(property = "updateTime", column = "update_time"),
        @Result(property = "updateUserId", column = "update_user_id"),
        @Result(property = "updateUserName", column = "update_user_name")
    })
    RequirementReviewMeeting findById(Long id);

    @Select("SELECT m.* FROM requirement_review_meeting m " +
            "JOIN meeting_application_rel r ON m.meeting_id = r.meeting_id " +
            "WHERE r.procurement_request_id = #{procurementRequestId}")
    @Results({
        @Result(property = "meetingId", column = "meeting_id"),
        @Result(property = "projectName", column = "project_name"),
        @Result(property = "projectNo", column = "project_no"),
        @Result(property = "startTime", column = "start_time"),
        @Result(property = "endTime", column = "end_time"),
        @Result(property = "organizerName", column = "organizer_name"),
        @Result(property = "bidId", column = "bid_id"),
        @Result(property = "bidTitle", column = "bid_title"),
        @Result(property = "createTime", column = "create_time"),
        @Result(property = "createUserId", column = "create_user_id"),
        @Result(property = "createUserName", column = "create_user_name"),
        @Result(property = "updateTime", column = "update_time"),
        @Result(property = "updateUserId", column = "update_user_id"),
        @Result(property = "updateUserName", column = "update_user_name")
    })
    List<RequirementReviewMeeting> findByProcurementRequestId(Long procurementRequestId);
}
