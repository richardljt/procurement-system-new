package com.example.procurement.entity;

import lombok.Data;

@Data
public class User {
    private String userId;
    private String username;
    private String password;
    private String realName;
    private String avatar;
    private String role;
    private String department;
}
