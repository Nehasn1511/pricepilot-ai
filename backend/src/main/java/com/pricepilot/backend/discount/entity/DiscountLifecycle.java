package com.pricepilot.backend.discount.entity;

import com.pricepilot.backend.discount.enums.DiscountStatus;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "discount_lifecycle")
public class DiscountLifecycle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long tenantId;
    private Long recommendationId;
    private Long masterProductId;
    private Long marketplaceProductId;

    @Column(precision = 12, scale = 2)
    private BigDecimal oldPrice;

    @Column(precision = 12, scale = 2)
    private BigDecimal newPrice;

    private Integer durationDays;
    private LocalDateTime startedAt;
    private LocalDateTime expiresAt;

    @Enumerated(EnumType.STRING)
    private DiscountStatus status;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Long getId() {
        return id;
    }

    public Long getTenantId() {
        return tenantId;
    }

    public void setTenantId(Long tenantId) {
        this.tenantId = tenantId;
    }

    public Long getRecommendationId() {
        return recommendationId;
    }

    public void setRecommendationId(Long recommendationId) {
        this.recommendationId = recommendationId;
    }

    public Long getMasterProductId() {
        return masterProductId;
    }

    public void setMasterProductId(Long masterProductId) {
        this.masterProductId = masterProductId;
    }

    public Long getMarketplaceProductId() {
        return marketplaceProductId;
    }

    public void setMarketplaceProductId(Long marketplaceProductId) {
        this.marketplaceProductId = marketplaceProductId;
    }

    public BigDecimal getOldPrice() {
        return oldPrice;
    }

    public void setOldPrice(BigDecimal oldPrice) {
        this.oldPrice = oldPrice;
    }

    public BigDecimal getNewPrice() {
        return newPrice;
    }

    public void setNewPrice(BigDecimal newPrice) {
        this.newPrice = newPrice;
    }

    public Integer getDurationDays() {
        return durationDays;
    }

    public void setDurationDays(Integer durationDays) {
        this.durationDays = durationDays;
    }

    public LocalDateTime getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(LocalDateTime startedAt) {
        this.startedAt = startedAt;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }

    public DiscountStatus getStatus() {
        return status;
    }

    public void setStatus(DiscountStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}