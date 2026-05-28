package com.pricepilot.backend.analytics.dto;

import java.math.BigDecimal;

public class BeforeAfterPerformanceResponse {

    private Long recommendationId;
    private Long tenantId;
    private Long marketplaceProductId;

    private Integer beforeViews;
    private Integer beforeOrders;
    private BigDecimal beforeRevenue;

    private Integer afterViews;
    private Integer afterOrders;
    private BigDecimal afterRevenue;

    private Integer orderImprovement;
    private BigDecimal revenueImprovement;

    private String result;

    public Long getRecommendationId() {
        return recommendationId;
    }

    public void setRecommendationId(Long recommendationId) {
        this.recommendationId = recommendationId;
    }

    public Long getTenantId() {
        return tenantId;
    }

    public void setTenantId(Long tenantId) {
        this.tenantId = tenantId;
    }

    public Long getMarketplaceProductId() {
        return marketplaceProductId;
    }

    public void setMarketplaceProductId(Long marketplaceProductId) {
        this.marketplaceProductId = marketplaceProductId;
    }

    public Integer getBeforeViews() {
        return beforeViews;
    }

    public void setBeforeViews(Integer beforeViews) {
        this.beforeViews = beforeViews;
    }

    public Integer getBeforeOrders() {
        return beforeOrders;
    }

    public void setBeforeOrders(Integer beforeOrders) {
        this.beforeOrders = beforeOrders;
    }

    public BigDecimal getBeforeRevenue() {
        return beforeRevenue;
    }

    public void setBeforeRevenue(BigDecimal beforeRevenue) {
        this.beforeRevenue = beforeRevenue;
    }

    public Integer getAfterViews() {
        return afterViews;
    }

    public void setAfterViews(Integer afterViews) {
        this.afterViews = afterViews;
    }

    public Integer getAfterOrders() {
        return afterOrders;
    }

    public void setAfterOrders(Integer afterOrders) {
        this.afterOrders = afterOrders;
    }

    public BigDecimal getAfterRevenue() {
        return afterRevenue;
    }

    public void setAfterRevenue(BigDecimal afterRevenue) {
        this.afterRevenue = afterRevenue;
    }

    public Integer getOrderImprovement() {
        return orderImprovement;
    }

    public void setOrderImprovement(Integer orderImprovement) {
        this.orderImprovement = orderImprovement;
    }

    public BigDecimal getRevenueImprovement() {
        return revenueImprovement;
    }

    public void setRevenueImprovement(BigDecimal revenueImprovement) {
        this.revenueImprovement = revenueImprovement;
    }

    public String getResult() {
        return result;
    }

    public void setResult(String result) {
        this.result = result;
    }
}