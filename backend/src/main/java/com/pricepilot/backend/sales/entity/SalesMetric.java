package com.pricepilot.backend.sales.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "sales_metrics")
public class SalesMetric {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long tenantId;

    private Long masterProductId;

    private Long marketplaceProductId;

    private LocalDate metricDate;

    private Integer views;

    private Integer orders;

    @Column(precision = 12, scale = 2)
    private BigDecimal revenue;

    private Integer stockQuantity;

    private Integer returnsCount;

    private Integer cartAdditions;

    private Double conversionRate;

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

    public LocalDate getMetricDate() {
        return metricDate;
    }

    public void setMetricDate(LocalDate metricDate) {
        this.metricDate = metricDate;
    }

    public Integer getViews() {
        return views;
    }

    public void setViews(Integer views) {
        this.views = views;
    }

    public Integer getOrders() {
        return orders;
    }

    public void setOrders(Integer orders) {
        this.orders = orders;
    }

    public BigDecimal getRevenue() {
        return revenue;
    }

    public void setRevenue(BigDecimal revenue) {
        this.revenue = revenue;
    }

    public Integer getStockQuantity() {
        return stockQuantity;
    }

    public void setStockQuantity(Integer stockQuantity) {
        this.stockQuantity = stockQuantity;
    }

    public Integer getReturnsCount() {
        return returnsCount;
    }

    public void setReturnsCount(Integer returnsCount) {
        this.returnsCount = returnsCount;
    }

    public Integer getCartAdditions() {
        return cartAdditions;
    }

    public void setCartAdditions(Integer cartAdditions) {
        this.cartAdditions = cartAdditions;
    }

    public Double getConversionRate() {
        return conversionRate;
    }

    public void setConversionRate(Double conversionRate) {
        this.conversionRate = conversionRate;
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