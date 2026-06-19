package com.quickbite;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class QuickBiteApplication {
    public static void main(String[] args) {
        SpringApplication.run(QuickBiteApplication.class, args);
        System.out.println("\n=========================================");
        System.out.println("  QuickBite Pune  →  http://localhost:8080");
        System.out.println("  H2 Console  →  http://localhost:8080/h2-console");
        System.out.println("=========================================\n");
    }
}
