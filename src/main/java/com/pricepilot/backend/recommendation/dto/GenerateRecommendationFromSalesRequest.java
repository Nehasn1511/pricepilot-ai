package com.pricepilot.backend.recommendation.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public class GenerateRecommendationFromSalesRequest {

    @NotNull
    private Long tenantId;

    @NotNull
    private Long masterProductId;

    @NotNull
    private Long marketplaceProductId;

    @NotNull
    @Positive
    private BigDecimal currentPrice;

    @NotNull
    @Positive
    private BigDecimal competitorPrice;

    @NotNull
    @Positive
    private BigDecimal costPrice;

    private BigDecimal marketplaceCommission = BigDecimal.ZERO;
    private BigDecimal shippingCost = BigDecimal.ZERO;
    private BigDecimal packagingCost = BigDecimal.ZERO;
    private BigDecimal taxAmount = BigDecimal.ZERO;
    private BigDecimal minimumProfit = BigDecimal.valueOf(100);

    private Double rating = 0.0;

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

    public BigDecimal getCurrentPrice() {
        return currentPrice;
    }

    public void setCurrentPrice(BigDecimal currentPrice) {
        this.currentPrice = currentPrice;
    }

    public BigDecimal getCompetitorPrice() {
        return competitorPrice;
    }

    public void setCompetitorPrice(BigDecimal competitorPrice) {
        this.competitorPrice = competitorPrice;
    }

    public BigDecimal getCostPrice() {
        return costPrice;
    }

    public void setCostPrice(BigDecimal costPrice) {
        this.costPrice = costPrice;
    }

    public BigDecimal getMarketplaceCommission() {
        return marketplaceCommission;
    }

    public void setMarketplaceCommission(BigDecimal marketplaceCommission) {
        this.marketplaceCommission = marketplaceCommission;
    }

    public BigDecimal getShippingCost() {
        return shippingCost;
    }

    public void setShippingCost(BigDecimal shippingCost) {
        this.shippingCost = shippingCost;
    }

    public BigDecimal getPackagingCost() {
        return packagingCost;
    }

    public void setPackagingCost(BigDecimal packagingCost) {
        this.packagingCost = packagingCost;
    }

    public BigDecimal getTaxAmount() {
        return taxAmount;
    }

    public void setTaxAmount(BigDecimal taxAmount) {
        this.taxAmount = taxAmount;
    }

    public BigDecimal getMinimumProfit() {
        return minimumProfit;
    }

    public void setMinimumProfit(BigDecimal minimumProfit) {
        this.minimumProfit = minimumProfit;
    }

    public Double getRating() {
        return rating;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }
}