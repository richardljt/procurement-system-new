package com.example.procurement.service;

import com.example.procurement.dto.ContractArchivingItemDTO;
import com.example.procurement.entity.Bid;
import com.example.procurement.entity.Contract;
import com.example.procurement.entity.ProcurementRequest;
import com.example.procurement.mapper.BidMapper;
import com.example.procurement.mapper.ContractMapper;
import com.example.procurement.mapper.ProcurementMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ContractService {
    @Autowired
    private ContractMapper contractMapper;
    
    @Autowired
    private ProcurementMapper procurementMapper;
    
    @Autowired
    private BidMapper bidMapper;

    public void createContract(Contract contract) {
        contract.setCreateTime(LocalDateTime.now());
        contract.setUpdateTime(LocalDateTime.now());
        if (contract.getStatus() == null) {
            contract.setStatus("DRAFT");
        }
        contractMapper.insert(contract);
    }

    public void updateContract(Contract contract) {
        contract.setUpdateTime(LocalDateTime.now());
        contractMapper.update(contract);
    }

    public Contract getContract(Long contractId) {
        return contractMapper.findById(contractId);
    }

    public List<Contract> getContractsByProcurementId(Long procurementRequestId) {
        return contractMapper.findByProcurementRequestId(procurementRequestId);
    }
    
    public void deleteContract(Long contractId) {
        contractMapper.deleteById(contractId);
    }
    
    public List<ContractArchivingItemDTO> getArchivingList(String keyword) {
        // Fetch all procurement requests
        // Note: Ideally we should filter by status 'APPROVED' or similar, but for now getting all
        List<ProcurementRequest> requests = procurementMapper.findAll(null, null, null, null, null, keyword, false);
        
        List<ContractArchivingItemDTO> result = new ArrayList<>();
        
        for (ProcurementRequest req : requests) {
            ContractArchivingItemDTO dto = new ContractArchivingItemDTO();
            dto.setProcurementRequestId(req.getProcurementRequestId());
            dto.setProcurementRequestCode(req.getRequestCode());
            dto.setProcurementTitle(req.getTitle());
            dto.setAmount(req.getAmount());
            dto.setApplicantName(req.getApplicantName());
            dto.setDepartment(req.getDepartment());
            dto.setCreateTime(req.getCreateTime());
            
            // Check Bid Status
            List<Bid> bids = bidMapper.findByProcurementRequestId(req.getProcurementRequestId());
            // Assume the latest bid is the relevant one, or check if ANY bid is evaluated
            boolean isEvaluated = false;
            Long bidId = null;
            if (bids != null && !bids.isEmpty()) {
                // Check if any bid is evaluated
                for (Bid bid : bids) {
                    if ("evaluated".equalsIgnoreCase(bid.getStatus())) {
                        isEvaluated = true;
                        bidId = bid.getBidId();
                        break;
                    }
                }
            }
            dto.setEvaluationCompleted(isEvaluated);
            dto.setBidId(bidId);
            
            // Check Contract Status
            List<Contract> contracts = contractMapper.findByProcurementRequestId(req.getProcurementRequestId());
            if (contracts != null && !contracts.isEmpty()) {
                // Assume one contract per request for now, or take the first one
                Contract c = contracts.get(0);
                dto.setContractId(c.getContractId());
                dto.setContractName(c.getContractName());
                dto.setSigningDate(c.getSigningDate());
                
                // If status is present, use it. If not, if fields are filled, it's ENTERED.
                if (c.getStatus() != null) {
                    dto.setContractStatus(c.getStatus());
                } else {
                    dto.setContractStatus("ENTERED");
                }
            } else {
                dto.setContractStatus("PENDING_ENTRY");
            }
            
            result.add(dto);
        }
        
        return result;
    }
    
    @Transactional
    public void saveContractArchiving(Contract contract) {
        if (contract.getContractId() != null) {
            Contract existing = contractMapper.findById(contract.getContractId());
            if (existing != null) {
                // Update fields
                existing.setContractName(contract.getContractName());
                existing.setContractCode(contract.getContractCode());
                existing.setSignerName(contract.getSignerName());
                existing.setSignerContact(contract.getSignerContact());
                existing.setVendorSignerName(contract.getVendorSignerName());
                existing.setVendorSignerContact(contract.getVendorSignerContact());
                existing.setSigningDate(contract.getSigningDate());
                existing.setAttachmentUrl(contract.getAttachmentUrl());
                existing.setStatus("ENTERED");
                existing.setUpdateTime(LocalDateTime.now());
                contractMapper.update(existing);
            }
        } else {
            // Create new
            contract.setStatus("ENTERED");
            contract.setCreateTime(LocalDateTime.now());
            contract.setUpdateTime(LocalDateTime.now());
            // Ensure procurementRequestId is set
            if (contract.getProcurementRequestId() == null) {
                throw new RuntimeException("Procurement Request ID is required");
            }
            contractMapper.insert(contract);
        }
    }
}
