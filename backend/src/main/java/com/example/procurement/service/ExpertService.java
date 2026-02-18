package com.example.procurement.service;

import com.example.procurement.entity.Expert;
import com.example.procurement.mapper.ExpertMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ExpertService {
    
    @Autowired
    private ExpertMapper expertMapper;
    
    public List<Expert> findAll(String keyword) {
        return expertMapper.findAll(keyword);
    }
    
    public Expert findById(Long id) {
        return expertMapper.findById(id);
    }
    
    public void create(Expert expert) {
        expertMapper.insert(expert);
    }
    
    public void update(Expert expert) {
        expertMapper.update(expert);
    }
    
    public void delete(Long id) {
        expertMapper.deleteById(id);
    }
}
