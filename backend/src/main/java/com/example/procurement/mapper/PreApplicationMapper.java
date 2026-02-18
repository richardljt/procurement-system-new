package com.example.procurement.mapper;

import com.example.procurement.entity.PreApplication;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import java.util.List;

@Mapper
public interface PreApplicationMapper {
    @Select("SELECT * FROM pre_application")
    List<PreApplication> findAll();
    
    @Select("SELECT * FROM pre_application WHERE pre_application_id = #{id}")
    PreApplication findById(Long id);
}
