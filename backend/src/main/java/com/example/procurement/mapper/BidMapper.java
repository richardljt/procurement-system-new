package com.example.procurement.mapper;

import com.example.procurement.entity.Bid;
import com.example.procurement.entity.BidAttachment;
import com.example.procurement.entity.BidSupplier;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface BidMapper {
    
    void insertBid(Bid bid);
    
    void updateBid(Bid bid);
    
    Bid getBidById(@Param("bidId") Long bidId);
    
    void insertBidSupplier(BidSupplier bidSupplier);
    
    void deleteBidSuppliers(@Param("bidId") Long bidId);
    
    List<BidSupplier> getBidSuppliers(@Param("bidId") Long bidId);
    
    void insertBidAttachment(BidAttachment bidAttachment);
    
    void deleteBidAttachments(@Param("bidId") Long bidId);
    
    List<BidAttachment> getBidAttachments(@Param("bidId") Long bidId);
    
    List<Bid> findByProcurementRequestId(@Param("procurementRequestId") Long procurementRequestId);

    List<Bid> getBidList(@Param("keyword") String keyword, @Param("status") String status);
}
