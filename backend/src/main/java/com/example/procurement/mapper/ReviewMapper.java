package com.example.procurement.mapper;

import com.example.procurement.entity.*;
import org.apache.ibatis.annotations.*;
import java.util.List;

@Mapper
public interface ReviewMapper {

    // --- Materials ---
    @Insert("INSERT INTO meeting_material (meeting_id, file_name, file_path, file_size, uploader_id, uploader_name, upload_time) " +
            "VALUES (#{meetingId}, #{fileName}, #{filePath}, #{fileSize}, #{uploaderId}, #{uploaderName}, NOW())")
    @Options(useGeneratedKeys = true, keyProperty = "materialId")
    void insertMaterial(MeetingMaterial material);

    @Select("SELECT * FROM meeting_material WHERE meeting_id = #{meetingId} ORDER BY upload_time DESC")
    List<MeetingMaterial> findMaterialsByMeetingId(Long meetingId);

    @Delete("DELETE FROM meeting_material WHERE material_id = #{materialId}")
    void deleteMaterial(Long materialId);

    // --- Questions ---
    @Insert("INSERT INTO meeting_question (meeting_id, content, asker_id, asker_name, is_anonymous, status, attachment_name, attachment_path, create_time) " +
            "VALUES (#{meetingId}, #{content}, #{askerId}, #{askerName}, #{isAnonymous}, 'PENDING', #{attachmentName}, #{attachmentPath}, NOW())")
    @Options(useGeneratedKeys = true, keyProperty = "questionId")
    void insertQuestion(MeetingQuestion question);

    @Update("UPDATE meeting_question SET status = #{status} WHERE question_id = #{questionId}")
    void updateQuestionStatus(@Param("questionId") Long questionId, @Param("status") String status);

    @Select("SELECT * FROM meeting_question WHERE meeting_id = #{meetingId} ORDER BY create_time ASC")
    @Results({
        @Result(property = "questionId", column = "question_id"),
        @Result(property = "attachmentName", column = "attachment_name"),
        @Result(property = "attachmentPath", column = "attachment_path"),
        @Result(property = "replies", column = "question_id", 
                many = @Many(select = "findRepliesByQuestionId"))
    })
    List<MeetingQuestion> findQuestionsByMeetingId(Long meetingId);

    @Select("SELECT meeting_id FROM meeting_question WHERE question_id = #{questionId}")
    Long findMeetingIdByQuestionId(Long questionId);

    @Delete("DELETE FROM meeting_question WHERE question_id = #{questionId}")
    void deleteQuestion(Long questionId);

    // --- Replies ---
    @Insert("INSERT INTO meeting_reply (question_id, content, replier_id, replier_name, attachment_name, attachment_path, create_time) " +
            "VALUES (#{questionId}, #{content}, #{replierId}, #{replierName}, #{attachmentName}, #{attachmentPath}, NOW())")
    @Options(useGeneratedKeys = true, keyProperty = "replyId")
    void insertReply(MeetingReply reply);

    @Select("SELECT * FROM meeting_reply WHERE question_id = #{questionId} ORDER BY create_time ASC")
    @Results({
        @Result(property = "attachmentName", column = "attachment_name"),
        @Result(property = "attachmentPath", column = "attachment_path")
    })
    List<MeetingReply> findRepliesByQuestionId(Long questionId);

    @Delete("DELETE FROM meeting_reply WHERE reply_id = #{replyId}")
    void deleteReply(Long replyId);

    // --- Votes ---
    @Insert("INSERT INTO meeting_vote (meeting_id, round, voter_id, voter_name, score, comment, create_time) " +
            "VALUES (#{meetingId}, #{round}, #{voterId}, #{voterName}, #{score}, #{comment}, NOW())")
    @Options(useGeneratedKeys = true, keyProperty = "voteId")
    void insertVote(MeetingVote vote);

    @Select("SELECT * FROM meeting_vote WHERE meeting_id = #{meetingId} AND round = #{round}")
    List<MeetingVote> findVotesByMeetingIdAndRound(@Param("meetingId") Long meetingId, @Param("round") Integer round);
    
    // --- Vote Admin ---
    @Delete("DELETE FROM meeting_vote WHERE meeting_id = #{meetingId} AND round = #{round}")
    void deleteVotesByRound(@Param("meetingId") Long meetingId, @Param("round") Integer round);
    
    @Update("UPDATE requirement_review_meeting SET vote_status = 'CLOSED' WHERE meeting_id = #{meetingId}")
    void closeVoting(Long meetingId);
    
    @Update("UPDATE requirement_review_meeting SET vote_status = 'OPEN' WHERE meeting_id = #{meetingId}")
    void openVoting(Long meetingId);

    // --- Logs ---
    @Insert("INSERT INTO review_log (meeting_id, operator_id, operator_name, action_type, detail, create_time) " +
            "VALUES (#{meetingId}, #{operatorId}, #{operatorName}, #{actionType}, #{detail}, NOW())")
    @Options(useGeneratedKeys = true, keyProperty = "logId")
    void insertLog(ReviewLog log);

    @Select("SELECT * FROM review_log WHERE meeting_id = #{meetingId} ORDER BY create_time DESC")
    List<ReviewLog> findLogsByMeetingId(Long meetingId);

    // --- Meeting Info ---
    @Select("SELECT * FROM requirement_review_meeting WHERE meeting_id = #{meetingId}")
    RequirementReviewMeeting findMeetingById(Long meetingId);

    @Update("UPDATE requirement_review_meeting SET status = 'COMPLETED', conclusion = #{conclusion}, end_time = NOW() WHERE meeting_id = #{meetingId}")
    void completeMeeting(@Param("meetingId") Long meetingId, @Param("conclusion") String conclusion);

    @Update("UPDATE requirement_review_meeting SET status = 'IN_PROGRESS', start_time = NOW(), end_time = DATE_ADD(NOW(), INTERVAL 3 HOUR) WHERE meeting_id = #{meetingId}")
    void startMeeting(Long meetingId);
    
    @Select("<script>" +
            "SELECT m.*, p.request_code as projectNo, p.department, p.amount " +
            "FROM requirement_review_meeting m " +
            "JOIN meeting_participant mp ON m.meeting_id = mp.meeting_id " +
            "LEFT JOIN procurement_request p ON m.project_no = p.request_code " +
            "WHERE mp.user_id = #{userId} AND m.status != 'CANCELLED' " +
            "ORDER BY m.start_time ASC" +
            "</script>")
    List<RequirementReviewMeeting> findMyMeetings(String userId);

    @Insert("INSERT INTO meeting_participant (meeting_id, user_id, user_name, role) VALUES (#{meetingId}, #{userId}, #{userName}, #{role})")
    void addParticipant(@Param("meetingId") Long meetingId, @Param("userId") String userId, @Param("userName") String userName, @Param("role") String role);

    @Select("SELECT * FROM meeting_participant WHERE meeting_id = #{meetingId}")
    List<MeetingParticipant> findParticipantsByMeetingId(Long meetingId);
}
