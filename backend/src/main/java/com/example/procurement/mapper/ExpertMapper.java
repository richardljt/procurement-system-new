package com.example.procurement.mapper;

import com.example.procurement.entity.Expert;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface ExpertMapper {
    
    @Select("<script>" +
            "SELECT * FROM expert " +
            "<where>" +
            "  <if test='keyword != null and keyword != \"\"'> AND (name LIKE CONCAT('%', #{keyword}, '%') OR department LIKE CONCAT('%', #{keyword}, '%')) </if>" +
            "</where>" +
            "ORDER BY create_time DESC" +
            "</script>")
    @Results(id = "expertMap", value = {
        @Result(property = "expertId", column = "expert_id", id = true),
        @Result(property = "entryDate", column = "entry_date"),
        @Result(property = "createTime", column = "create_time"),
        @Result(property = "updateTime", column = "update_time"),
        @Result(property = "createUserId", column = "create_user_id"),
        @Result(property = "createUserName", column = "create_user_name"),
        @Result(property = "userId", column = "user_id")
    })
    List<Expert> findAll(@Param("keyword") String keyword);
    
    @Select("SELECT * FROM expert WHERE expert_id = #{id}")
    @ResultMap("expertMap")
    Expert findById(Long id);

    @Insert("INSERT INTO expert (name, department, entry_date, industries, level, avatar, user_id, create_user_id, create_user_name, create_time, update_time) " +
            "VALUES (#{name}, #{department}, #{entryDate}, #{industries}, #{level}, #{avatar}, #{userId}, #{createUserId}, #{createUserName}, NOW(), NOW())")
    @Options(useGeneratedKeys = true, keyProperty = "expertId")
    void insert(Expert expert);

    @Update("UPDATE expert SET name=#{name}, department=#{department}, entry_date=#{entryDate}, industries=#{industries}, " +
            "level=#{level}, avatar=#{avatar}, user_id=#{userId}, update_time=NOW() WHERE expert_id=#{expertId}")
    void update(Expert expert);

    @Delete("DELETE FROM expert WHERE expert_id = #{id}")
    void deleteById(Long id);
}
