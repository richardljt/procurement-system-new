package com.example.procurement.entity;

import lombok.Data;

@Data
public class Resource {
    private Long resourceId;
    private String resourceName;
    private String resourceType;
    private String path;
    private String icon;
    private String groupName;
    private Integer sortOrder;
}
