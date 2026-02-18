package com.example.procurement.service;

import com.example.procurement.dto.BidMonitoringDTO;
import com.example.procurement.entity.Bid;
import com.example.procurement.entity.BidAttachment;
import com.example.procurement.entity.BidSupplier;
import com.example.procurement.mapper.BidMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
public class BidService {

    @Autowired
    private BidMapper bidMapper;

    @Transactional
    public void createBid(Bid bid) {
        if (bid.getStatus() == null) {
            bid.setStatus("draft");
        }
        
        // Set mock user info if not present
        if (bid.getCreateUserId() == null) {
            bid.setCreateUserId("U001");
            bid.setCreateUserName("Admin");
            bid.setUpdateUserId("U001");
            bid.setUpdateUserName("Admin");
        }

        // Insert Bid
        bidMapper.insertBid(bid);
        
        // Insert Suppliers
        if (bid.getSuppliers() != null) {
            for (BidSupplier supplier : bid.getSuppliers()) {
                supplier.setBidId(bid.getBidId());
                // Ensure isSelected is set
                if (supplier.getIsSelected() == null) {
                    supplier.setIsSelected(true);
                }
                bidMapper.insertBidSupplier(supplier);
            }
        }
        
        // Insert Attachments
        if (bid.getAttachments() != null) {
            for (BidAttachment attachment : bid.getAttachments()) {
                attachment.setBidId(bid.getBidId());
                bidMapper.insertBidAttachment(attachment);
            }
        }
    }

    @Transactional
    public void updateBid(Bid bid) {
        // Update basic info
        bidMapper.updateBid(bid);
        
        // Update Suppliers (Delete and Re-insert)
        bidMapper.deleteBidSuppliers(bid.getBidId());
        if (bid.getSuppliers() != null) {
            for (BidSupplier supplier : bid.getSuppliers()) {
                supplier.setBidId(bid.getBidId());
                if (supplier.getIsSelected() == null) supplier.setIsSelected(true);
                bidMapper.insertBidSupplier(supplier);
            }
        }
        
        // Update Attachments (Delete and Re-insert)
        bidMapper.deleteBidAttachments(bid.getBidId());
        if (bid.getAttachments() != null) {
            for (BidAttachment attachment : bid.getAttachments()) {
                attachment.setBidId(bid.getBidId());
                bidMapper.insertBidAttachment(attachment);
            }
        }
    }

    public Bid getBidById(Long id) {
        Bid bid = bidMapper.getBidById(id);
        if (bid != null) {
            bid.setSuppliers(bidMapper.getBidSuppliers(id));
            bid.setAttachments(bidMapper.getBidAttachments(id));
        }
        return bid;
    }
    
    public List<Bid> getBidList(String keyword, String status) {
        return bidMapper.getBidList(keyword, status);
    }
    
    @Transactional
    public void initiateBid(Bid bid) {
        bid.setStatus("evaluating"); // Use 'evaluating' as 'ongoing' is deprecated for display
        if (bid.getBidId() != null) {
            updateBid(bid);
        } else {
            createBid(bid);
        }
        // TODO: Send emails to suppliers
    }

    public BidMonitoringDTO getBidMonitoring(Long id) {
        Bid bid = getBidById(id);
        if (bid == null) return null;

        BidMonitoringDTO dto = new BidMonitoringDTO();
        dto.setBidId(bid.getBidId());
        dto.setTitle(bid.getTitle());
        dto.setStatus(bid.getStatus());
        dto.setDeadline(bid.getDeadline());
        
        // Calculate countdown
        if (bid.getDeadline() != null && LocalDateTime.now().isBefore(bid.getDeadline())) {
            long days = ChronoUnit.DAYS.between(LocalDateTime.now(), bid.getDeadline());
            long hours = ChronoUnit.HOURS.between(LocalDateTime.now(), bid.getDeadline()) % 24;
            long minutes = ChronoUnit.MINUTES.between(LocalDateTime.now(), bid.getDeadline()) % 60;
            dto.setCountdown(days + "天 " + hours + "小时 " + minutes + "分");
        } else {
            dto.setCountdown("已结束");
        }

        // Mock Suppliers Status
        List<BidMonitoringDTO.SupplierMonitorDTO> supplierMonitors = new ArrayList<>();
        List<BidSupplier> suppliers = bid.getSuppliers();
        int submitted = 0;
        int inProgress = 0;
        int notSubmitted = 0;

        if (suppliers != null) {
            for (BidSupplier bs : suppliers) {
                BidMonitoringDTO.SupplierMonitorDTO sm = new BidMonitoringDTO.SupplierMonitorDTO();
                sm.setName(bs.getSupplierName());
                sm.setContact(bs.getSupplierEmail()); // Use email as contact for now
                
                // Mock status randomly based on ID if evaluating
                if ("evaluating".equals(bid.getStatus()) || "ongoing".equals(bid.getStatus())) {
                    int rand = new Random(bs.getSupplierId() + System.currentTimeMillis()).nextInt(3);
                    if (rand == 0) {
                        sm.setStatus("Submitted");
                        sm.setBusinessPart("uploaded");
                        sm.setPricePart("uploaded");
                        sm.setCompletion(100);
                        sm.setSubmitTime(LocalDateTime.now().minusHours(rand).format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")));
                        submitted++;
                    } else if (rand == 1) {
                        sm.setStatus("In Progress");
                        sm.setBusinessPart("uploaded");
                        sm.setPricePart("pending");
                        sm.setCompletion(50);
                        inProgress++;
                    } else {
                        sm.setStatus("Pending");
                        sm.setBusinessPart("pending");
                        sm.setPricePart("pending");
                        sm.setCompletion(0);
                        notSubmitted++;
                    }
                } else {
                    sm.setStatus("Pending");
                    notSubmitted++;
                }
                supplierMonitors.add(sm);
            }
        }
        dto.setSuppliers(supplierMonitors);

        // Stats
        BidMonitoringDTO.Stats stats = new BidMonitoringDTO.Stats();
        stats.setInvited(suppliers != null ? suppliers.size() : 0);
        stats.setSubmitted(submitted);
        stats.setInProgress(inProgress);
        stats.setNotSubmitted(notSubmitted);
        stats.setCompletionRate(stats.getInvited() > 0 ? (int)((double)submitted / stats.getInvited() * 100) + "%" : "0%");
        dto.setStats(stats);

        // Mock Logs
        List<BidMonitoringDTO.LogDTO> logs = new ArrayList<>();
        BidMonitoringDTO.LogDTO log1 = new BidMonitoringDTO.LogDTO();
        log1.setType("info");
        log1.setTitle("投标发起");
        log1.setDescription("项目已发布，邮件通知已发送");
        log1.setUser(bid.getCreateUserName());
        log1.setTime(bid.getCreateTime().toString());
        logs.add(log1);
        
        if (submitted > 0) {
            BidMonitoringDTO.LogDTO log2 = new BidMonitoringDTO.LogDTO();
            log2.setType("submit");
            log2.setTitle("供应商投标");
            log2.setDescription("供应商已提交投标文件");
            log2.setUser("System");
            log2.setTime(LocalDateTime.now().minusHours(1).toString());
            logs.add(log2);
        }
        dto.setLogs(logs);

        return dto;
    }

    @Transactional
    public void terminateBid(Long id, String reason) {
        Bid bid = getBidById(id);
        if (bid != null) {
            bid.setStatus("terminated");
            bid.setDescription(bid.getDescription() + "\n[TERMINATED]: " + reason); // Append reason
            bidMapper.updateBid(bid);
        }
    }
}
