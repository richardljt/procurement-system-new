package com.example.procurement;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.mybatis.spring.annotation.MapperScan;

@SpringBootApplication
@MapperScan("com.example.procurement.mapper")
public class ProcurementApplication {
    public static void main(String[] args) {
        SpringApplication.run(ProcurementApplication.class, args);
    }
}
