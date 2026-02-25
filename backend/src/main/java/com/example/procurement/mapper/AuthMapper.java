package com.example.procurement.mapper;

import com.example.procurement.entity.Resource;
import com.example.procurement.entity.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Insert;

import java.util.List;

@Mapper
public interface AuthMapper {
    @Select("SELECT * FROM sys_user WHERE username = #{username}")
    User findUserByUsername(String username);

    @Select("SELECT * FROM sys_user WHERE user_id = #{userId}")
    User findUserByUserId(String userId);

    @Select("SELECT r.* FROM sys_resource r " +
            "JOIN sys_user_resource_rel rel ON r.resource_id = rel.resource_id " +
            "WHERE rel.user_id = #{userId} ORDER BY r.group_name, r.sort_order")
    List<Resource> findResourcesByUserId(String userId);

    @Insert("INSERT INTO sys_user(user_id, username, password, real_name, role, supplier_id) VALUES(#{userId}, #{username}, #{password}, #{realName}, #{role}, #{supplierId})")
    void insertUser(User user);
}
