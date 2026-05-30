package com.pricepilot.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "marketplace_accounts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MarketplaceAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Platform platform;

    @Column(name = "account_name", nullable = false)
    private String accountName;

    @Column(name = "seller_id")
    private String sellerId;

    @Column(name = "api_key")
    private String apiKey;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public enum Platform {
        AMAZON, FLIPKART, SHOPIFY, MEESHO, OTHER
    }
}