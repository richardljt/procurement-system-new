package com.example.procurement.service;

import com.example.procurement.entity.Supplier;
import com.example.procurement.entity.SupplierHistory;
import com.example.procurement.mapper.SupplierHistoryMapper;
import com.example.procurement.mapper.SupplierMapper;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.BeanWrapper;
import org.springframework.beans.BeanWrapperImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class SupplierService {

    @Autowired
    private SupplierMapper supplierMapper;

    @Autowired
    private SupplierHistoryMapper supplierHistoryMapper;

    public List<Supplier> findAll() {
        return supplierMapper.findAll();
    }
    
    public List<Supplier> findAllApproved() {
        return supplierMapper.findAllApproved();
    }
    
    public List<Supplier> findByCreateUserId(String userId) {
        return supplierMapper.findByCreateUserId(userId);
    }

    public Supplier findById(Long id) {
        return supplierMapper.findById(id);
    }

    public List<Supplier> findByStatus(String status) {
        return supplierMapper.findByStatus(status);
    }

    public void create(Supplier supplier) {
        supplier.setCreateTime(LocalDateTime.now());
        supplier.setUpdateTime(LocalDateTime.now());
        if (supplier.getStatus() == null) {
            supplier.setStatus("DRAFT");
        }
        // Initially not qualified until approved? Or maybe qualified status is separate.
        if (supplier.getIsQualified() == null) {
            supplier.setIsQualified(false);
        }
        supplierMapper.insert(supplier);
    }

    public void update(Supplier supplier) {
        supplier.setUpdateTime(LocalDateTime.now());
        supplierMapper.update(supplier);
    }

    public void updateWithHistory(Supplier supplier, String changeReason) {
        Supplier existing = supplierMapper.findById(supplier.getSupplierId());
        if (existing == null) {
            throw new RuntimeException("Supplier not found");
        }

        // Copy non-null properties from input to existing
        copyPropertiesIgnoreNull(supplier, existing);
        
        existing.setUpdateTime(LocalDateTime.now());
        // Ensure audit fields are updated if provided, otherwise keep existing or set from context
        if (supplier.getUpdateUserId() != null) existing.setUpdateUserId(supplier.getUpdateUserId());
        if (supplier.getUpdateUserName() != null) existing.setUpdateUserName(supplier.getUpdateUserName());

        supplierMapper.update(existing);

        SupplierHistory history = new SupplierHistory();
        BeanUtils.copyProperties(existing, history);
        history.setChangeType("UPDATE");
        history.setChangeReason(changeReason);
        history.setOperatorId(existing.getUpdateUserId());
        history.setOperatorName(existing.getUpdateUserName());
        history.setOperateTime(LocalDateTime.now());
        
        supplierHistoryMapper.insert(history);
    }

    public List<SupplierHistory> getHistory(Long supplierId) {
        return supplierHistoryMapper.findBySupplierId(supplierId);
    }

    private static void copyPropertiesIgnoreNull(Object src, Object target) {
        BeanUtils.copyProperties(src, target, getNullPropertyNames(src));
    }

    private static String[] getNullPropertyNames(Object source) {
        final BeanWrapper src = new BeanWrapperImpl(source);
        java.beans.PropertyDescriptor[] pds = src.getPropertyDescriptors();

        Set<String> emptyNames = new HashSet<>();
        for (java.beans.PropertyDescriptor pd : pds) {
            Object srcValue = src.getPropertyValue(pd.getName());
            if (srcValue == null) emptyNames.add(pd.getName());
        }
        String[] result = new String[emptyNames.size()];
        return emptyNames.toArray(result);
    }
}