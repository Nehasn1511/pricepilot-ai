package com.pricepilot.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "marketplace_products")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(exclude = {"tenant", "masterProduct"})
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class MarketplaceProduct {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    @JsonIgnore
    private Tenant tenant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "master_product_id", nullable = false)
    @JsonIgnore
    private MasterProduct masterProduct;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private Platform platform;

    @Column(name = "platform_sku")
    private String platformSku;

    private String title;

    @Column(name = "current_price", precision = 10, scale = 2)
    private BigDecimal currentPrice;

    @Column(name = "stock_quantity")
    private Integer stockQuantity;

    private Double rating;

    @Column(name = "review_count")
    private Integer reviewCount;

    @Column(name = "product_url")
    private String productUrl;

    @Column(name = "views_last_7_days")
    private Integer viewsLast7Days;

    @Column(name = "orders_last_7_days")
    private Integer ordersLast7Days;

    @Column(name = "revenue_last_7_days", precision = 10, scale = 2)
    private BigDecimal revenueLast7Days;

    @Column(name = "conversion_rate", precision = 5, scale = 2)
    private BigDecimal conversionRate;

    @Column(name = "cart_additions_last_7_days")
    private Integer cartAdditionsLast7Days;

    @Column(name = "returns_last_7_days")
    private Integer returnsLast7Days;

    @Column(name = "last_synced_at")
    private LocalDateTime lastSyncedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        lastSyncedAt = LocalDateTime.now();
    }

    public enum Platform {
        AMAZON, FLIPKART, SHOPIFY, MEESHO, MYNTRA, WOOCOMMERCE, OTHER
    }
}