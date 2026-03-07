package com.example.procurement.service;

import com.example.procurement.dto.ProcurementStatsDTO;
import com.example.procurement.entity.PreApplication;
import com.example.procurement.entity.ProcurementRequest;
import com.example.procurement.entity.ProcurementRequestItem;
import com.example.procurement.entity.ExchangeRate;
import com.example.procurement.entity.Supplier;
import com.example.procurement.mapper.ExchangeRateMapper;
import com.example.procurement.mapper.PreApplicationMapper;
import com.example.procurement.mapper.ProcurementMapper;
import com.example.procurement.mapper.ProcurementRequestItemMapper;
import com.example.procurement.mapper.SupplierMapper;
import com.example.procurement.mapper.ProcessMapper;
import com.example.procurement.entity.ProcessInstance;
import com.example.procurement.entity.ProcessTask;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
public class ProcurementService {

    @Autowired
    private ProcurementMapper procurementMapper;
    
    @Autowired
    private PreApplicationMapper preApplicationMapper;
    
    @Autowired
    private SupplierMapper supplierMapper;
    
    @Autowired
    private ExchangeRateMapper exchangeRateMapper;
    
    @Autowired
    private ProcurementRequestItemMapper procurementRequestItemMapper;

    @Autowired
    private com.example.procurement.mapper.FileRecordMapper fileRecordMapper;

    @Autowired
    private ProcessMapper processMapper;

    public List<ProcurementRequest> findAll(String status, String procurementType, String urgencyLevel, String startDate, String endDate, String keyword, Boolean excludeScheduled) {
        return procurementMapper.findAll(status, procurementType, urgencyLevel, startDate, endDate, keyword, excludeScheduled);
    }
    
    public List<ProcurementRequest> findAll(String status, String procurementType, String urgencyLevel, String startDate, String endDate, String keyword) {
        return findAll(status, procurementType, urgencyLevel, startDate, endDate, keyword, false);
    }
    
    public List<PreApplication> getAllPreApplications() {
        List<PreApplication> preApplications = preApplicationMapper.findAll();
        
        // Calculate dynamic remaining budget for each pre-application
        for (PreApplication preApp : preApplications) {
            calculateDynamicRemainingBudget(preApp);
        }
        
        return preApplications;
    }
    
    public PreApplication getPreApplicationById(Long id) {
        PreApplication preApplication = preApplicationMapper.findById(id);
        if (preApplication != null) {
            calculateDynamicRemainingBudget(preApplication);
        }
        return preApplication;
    }
    
    private void calculateDynamicRemainingBudget(PreApplication preApplication) {
        List<ProcurementRequest> requests = procurementMapper.findByPreApplicationId(preApplication.getPreApplicationId());
        
        BigDecimal usedBudget = BigDecimal.ZERO;
        String targetCurrency = preApplication.getCurrency();
        if (targetCurrency == null) targetCurrency = "HKD";

        for (ProcurementRequest req : requests) {
            List<ProcurementRequestItem> items = procurementRequestItemMapper.findByRequestId(req.getProcurementRequestId());
            
            if (items != null && !items.isEmpty()) {
                for (ProcurementRequestItem item : items) {
                    BigDecimal converted = convert(item.getAmount(), item.getCurrency(), targetCurrency);
                    usedBudget = usedBudget.add(converted);
                }
            } else {
                BigDecimal converted = convert(req.getAmount(), req.getCurrency(), targetCurrency);
                usedBudget = usedBudget.add(converted);
            }
        }
        
        BigDecimal dynamicRemainingBudget = preApplication.getTotalBudget().subtract(usedBudget);
        preApplication.setRemainingBudget(dynamicRemainingBudget);
        preApplication.setUsedBudget(usedBudget);
    }
    
    private BigDecimal convert(BigDecimal amount, String from, String to) {
        if (amount == null) return BigDecimal.ZERO;
        if (from == null) from = "CNY"; 
        if (to == null) to = "HKD"; 
        if (from.equals(to)) return amount;
        
        BigDecimal rate = exchangeRateMapper.findLatestRate(from, to);
        if (rate == null) {
            BigDecimal inverse = exchangeRateMapper.findLatestRate(to, from);
            if (inverse != null && inverse.compareTo(BigDecimal.ZERO) != 0) {
                 return amount.divide(inverse, 2, java.math.RoundingMode.HALF_UP);
            }
            return amount; 
        }
        return amount.multiply(rate);
    }
    
    public List<Supplier> getAllSuppliers() {
        return supplierMapper.findAllApproved();
    }

    public List<ExchangeRate> getAllExchangeRates() {
        return exchangeRateMapper.findAll();
    }

    public ProcurementStatsDTO getStats(String status, String procurementType, String urgencyLevel, String startDate, String endDate, String keyword) {
        ProcurementStatsDTO stats = new ProcurementStatsDTO();
        
        // Optimized: Single query for status counts
        java.util.List<java.util.Map<String, Object>> groups = procurementMapper.countStatusGroup(status, procurementType, urgencyLevel, startDate, endDate, keyword);
        
        long total = 0;
        for (java.util.Map<String, Object> group : groups) {
            String statusKey = (String) group.get("status");
            Long count = ((Number) group.get("cnt")).longValue();
            total += count;
            
            if ("APPROVING".equals(statusKey)) {
                stats.setApproving(count);
            } else if ("APPROVED".equals(statusKey)) {
                stats.setApproved(count);
            } else if ("REJECTED".equals(statusKey)) {
                stats.setRejected(count);
            }
        }
        
        // Set total from aggregation
        stats.setTotal(total); 
        
        return stats;
    }

    @Autowired
    private FileStorageService fileStorageService;

    @Transactional
    public void create(ProcurementRequest request, List<org.springframework.web.multipart.MultipartFile> files, List<org.springframework.web.multipart.MultipartFile> singleSourceFiles) {
        // Check if updating existing draft
        if (request.getProcurementRequestId() != null) {
            updateDraft(request, files, singleSourceFiles);
            return;
        }

        // Generate Request Code if not present
        if (request.getRequestCode() == null) {
            request.setRequestCode("PR-" + System.currentTimeMillis());
        }
        
        // Set Default Status if not provided
        if (request.getStatus() == null || request.getStatus().isEmpty()) {
            request.setStatus("APPROVING");
        }
        request.setCreateUserName("Zhang Ming"); // Mock user
        
        // Set Supplier Count
        request.setSupplierCount(request.getSupplierIds() == null ? 0 : request.getSupplierIds().size());
        
        // Save Files
        List<Long> attachmentFileIds = new java.util.ArrayList<>();
        if (files != null) {
            for (org.springframework.web.multipart.MultipartFile file : files) {
                try {
                    com.example.procurement.entity.FileRecord fileRecord = fileStorageService.storeFile(file, "attachment");
                    attachmentFileIds.add(fileRecord.getFileId());
                } catch (java.io.IOException e) {
                    // Handle exception
                }
            }
        }
        request.setAttachmentIds(org.springframework.util.StringUtils.collectionToCommaDelimitedString(attachmentFileIds));

        List<Long> singleSourceFileIds = new java.util.ArrayList<>();
        if (singleSourceFiles != null) {
            for (org.springframework.web.multipart.MultipartFile file : singleSourceFiles) {
                try {
                    com.example.procurement.entity.FileRecord fileRecord = fileStorageService.storeFile(file, "single_source");
                    singleSourceFileIds.add(fileRecord.getFileId());
                } catch (java.io.IOException e) {
                    // Handle exception
                }
            }
        }
        request.setSingleSourceAttachmentIds(org.springframework.util.StringUtils.collectionToCommaDelimitedString(singleSourceFileIds));

        // Save Request
        procurementMapper.insert(request);
        
        // Save Supplier Relations
        if (request.getSupplierIds() != null) {
            for (Long supplierId : request.getSupplierIds()) {
                procurementMapper.insertSupplierRelation(request.getProcurementRequestId(), supplierId, false);
            }
        }
        
        // Save Items
        if (request.getItems() != null) {
            for (ProcurementRequestItem item : request.getItems()) {
                item.setProcurementRequestId(request.getProcurementRequestId());
                procurementRequestItemMapper.insert(item);
            }
        }

        
        // Start Process only if not DRAFT
        if (!"DRAFT".equals(request.getStatus())) {
            startProcess(request);
        }
    }
    
    private void updateDraft(ProcurementRequest request, List<org.springframework.web.multipart.MultipartFile> files, List<org.springframework.web.multipart.MultipartFile> singleSourceFiles) {
        // Set Supplier Count
        request.setSupplierCount(request.getSupplierIds() == null ? 0 : request.getSupplierIds().size());

        // Save Files
        List<Long> attachmentFileIds = new java.util.ArrayList<>();
        if (files != null) {
            for (org.springframework.web.multipart.MultipartFile file : files) {
                try {
                    com.example.procurement.entity.FileRecord fileRecord = fileStorageService.storeFile(file, "attachment");
                    attachmentFileIds.add(fileRecord.getFileId());
                } catch (java.io.IOException e) {
                    // Handle exception
                }
            }
        }
        request.setAttachmentIds(org.springframework.util.StringUtils.collectionToCommaDelimitedString(attachmentFileIds));

        List<Long> singleSourceFileIds = new java.util.ArrayList<>();
        if (singleSourceFiles != null) {
            for (org.springframework.web.multipart.MultipartFile file : singleSourceFiles) {
                try {
                    com.example.procurement.entity.FileRecord fileRecord = fileStorageService.storeFile(file, "single_source");
                    singleSourceFileIds.add(fileRecord.getFileId());
                } catch (java.io.IOException e) {
                    // Handle exception
                }
            }
        }
        request.setSingleSourceAttachmentIds(org.springframework.util.StringUtils.collectionToCommaDelimitedString(singleSourceFileIds));
        
        // Update Request
        procurementMapper.update(request);
        
        // Clear and Re-insert relations/items/files
        procurementMapper.deleteSupplierRelations(request.getProcurementRequestId());
        procurementMapper.deleteItems(request.getProcurementRequestId());
        
        // Save Supplier Relations
        if (request.getSupplierIds() != null) {
            for (Long supplierId : request.getSupplierIds()) {
                procurementMapper.insertSupplierRelation(request.getProcurementRequestId(), supplierId, false);
            }
        }
        
        // Save Items
        if (request.getItems() != null) {
            for (ProcurementRequestItem item : request.getItems()) {
                item.setProcurementRequestId(request.getProcurementRequestId());
                procurementRequestItemMapper.insert(item);
            }
        }
        
        // Start Process if status changed from DRAFT to APPROVING (or other non-draft status)
        if (!"DRAFT".equals(request.getStatus())) {
            // Check if process already exists just in case
            ProcessInstance existing = processMapper.findInstanceByBusinessKey(request.getRequestCode());
            if (existing == null) {
                // Fetch request code if not in input object (it might be null in update payload if not passed)
                // However, for safety we should ensure requestCode is present. 
                // Assuming frontend passes full object or we fetch it. 
                // But `request` object here is from Controller @RequestBody.
                // If requestCode is missing, we need to fetch it.
                if (request.getRequestCode() == null) {
                    ProcurementRequest existingRequest = procurementMapper.findById(request.getProcurementRequestId());
                    request.setRequestCode(existingRequest.getRequestCode());
                }
                startProcess(request);
            }
        }
    }
    
    private void startProcess(ProcurementRequest request) {
        ProcessInstance instance = new ProcessInstance();
        instance.setBusinessKey(request.getRequestCode());
        instance.setBusinessType("PROCUREMENT");
        instance.setStatus("RUNNING");
        instance.setInitiatorId("U001");
        instance.setInitiatorName(request.getApplicantName());
        processMapper.insertInstance(instance);
        
        // 1. Submit Node
        ProcessTask submitTask = new ProcessTask();
        submitTask.setInstanceId(instance.getInstanceId());
        submitTask.setNodeName("Submit Request");
        submitTask.setNodeType("START");
        submitTask.setApproverId("U001");
        submitTask.setApproverName(request.getApplicantName());
        submitTask.setStatus("APPROVED");
        submitTask.setSequence(1);
        submitTask.setHandleTime(LocalDateTime.now());
        processMapper.insertTask(submitTask);
        
        // 2. Dept Manager
        ProcessTask managerTask = new ProcessTask();
        managerTask.setInstanceId(instance.getInstanceId());
        managerTask.setNodeName("Department Manager Approval");
        managerTask.setNodeType("APPROVAL");
        managerTask.setApproverId("U002");
        managerTask.setApproverName("Li Manager");
        managerTask.setStatus("PENDING");
        managerTask.setSequence(2);
        processMapper.insertTask(managerTask);
        
        // 3. VP (Conditional)
        if ("SINGLE".equals(request.getSupplierSelectionType())) {
            ProcessTask vpTask = new ProcessTask();
            vpTask.setInstanceId(instance.getInstanceId());
            vpTask.setNodeName("VP Approval");
            vpTask.setNodeType("APPROVAL");
            vpTask.setApproverId("U003");
            vpTask.setApproverName("VP Wang");
            vpTask.setStatus("PENDING");
            vpTask.setSequence(3);
            processMapper.insertTask(vpTask);
        }
    }

    public ProcurementRequest findById(Long id) {
        ProcurementRequest request = procurementMapper.findById(id);
        if (request != null) {
            List<Long> supplierIds = procurementMapper.findSupplierIdsByRequestId(id);
            request.setSupplierIds(supplierIds);
            
            // Populate Supplier details
            if (supplierIds != null && !supplierIds.isEmpty()) {
                java.util.List<Supplier> suppliers = new java.util.ArrayList<>();
                for (Long supplierId : supplierIds) {
                    Supplier s = supplierMapper.findById(supplierId);
                    if (s != null) {
                        suppliers.add(s);
                    }
                }
                request.setSupplierList(suppliers);
            }
            
            List<ProcurementRequestItem> items = procurementRequestItemMapper.findByRequestId(id);
            request.setItems(items);

            if (request.getAttachmentIds() != null && !request.getAttachmentIds().isEmpty()) {
                List<Long> fileIds = java.util.Arrays.stream(request.getAttachmentIds().split(","))
                    .filter(s -> !s.isEmpty())
                    .map(Long::parseLong)
                    .collect(java.util.stream.Collectors.toList());
                if (!fileIds.isEmpty()) {
                    request.setAttachments(fileRecordMapper.findByIds(fileIds));
                }
            }
            if (request.getSingleSourceAttachmentIds() != null && !request.getSingleSourceAttachmentIds().isEmpty()) {
                List<Long> fileIds = java.util.Arrays.stream(request.getSingleSourceAttachmentIds().split(","))
                    .filter(s -> !s.isEmpty())
                    .map(Long::parseLong)
                    .collect(java.util.stream.Collectors.toList());
                if (!fileIds.isEmpty()) {
                    request.setSingleSourceAttachments(fileRecordMapper.findByIds(fileIds));
                }
            }
            
            // Populate Process Tasks
            ProcessInstance instance = processMapper.findInstanceByBusinessKey(request.getRequestCode());
            if (instance != null) {
                request.setProcessTasks(processMapper.findTasksByInstanceId(instance.getInstanceId()));
            }
        }
        return request;
    }

    public void approve(Long id, String comment) {
        ProcurementRequest request = procurementMapper.findById(id);
        if (request == null) return;
        
        ProcessInstance instance = processMapper.findInstanceByBusinessKey(request.getRequestCode());
        if (instance != null) {
            ProcessTask currentTask = processMapper.findCurrentPendingTask(instance.getInstanceId());
            if (currentTask != null) {
                currentTask.setStatus("APPROVED");
                currentTask.setComment(comment != null && !comment.isEmpty() ? comment : "Approved by " + currentTask.getApproverName());
                processMapper.updateTask(currentTask);
                
                // Check if there are more tasks
                ProcessTask nextTask = processMapper.findCurrentPendingTask(instance.getInstanceId());
                if (nextTask == null) {
                    // All done
                    processMapper.updateInstanceStatus(instance.getInstanceId(), "COMPLETED");
                    procurementMapper.updateStatus(id, "APPROVED", null);
                }
            }
        } else {
             // Fallback
             procurementMapper.updateStatus(id, "APPROVED", null);
        }
    }

    public void reject(Long id, String reason) {
        ProcurementRequest request = procurementMapper.findById(id);
        if (request == null) return;
        
        ProcessInstance instance = processMapper.findInstanceByBusinessKey(request.getRequestCode());
        if (instance != null) {
             processMapper.updateInstanceStatus(instance.getInstanceId(), "REJECTED");
             
             ProcessTask currentTask = processMapper.findCurrentPendingTask(instance.getInstanceId());
             if (currentTask != null) {
                 currentTask.setStatus("REJECTED");
                 currentTask.setComment(reason);
                 processMapper.updateTask(currentTask);
             }
        }
        procurementMapper.updateStatus(id, "REJECTED", reason);
    }
}
