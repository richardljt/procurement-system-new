package com.example.procurement.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class BidAttachment {
    private Long id;
    private Long bidId;
    
    @JsonProperty("name")
    private String fileName;
    
    @JsonProperty("url")
    private String fileUrl;
    
    @JsonProperty("size")
    private String fileSize;
    
    @JsonProperty("type")
    private String fileType;
    
    private LocalDateTime createTime;
}
