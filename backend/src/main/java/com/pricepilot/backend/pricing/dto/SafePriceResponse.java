package com.pricepilot.backend.pricing.dto;

import java.math.BigDecimal;

public class SafePriceResponse {

    private BigDecimal costPrice;
    private BigDecimal marketplaceCommission;
    private BigDecimal shippingCost;
    private BigDecimal packagingCost;
    private BigDecimal taxAmount;
    private BigDecimal minimumProfit;
    private BigDecimal minimumSafePrice;

    public SafePriceResponse() {
    }

    public SafePriceResponse(BigDecimal costPrice, BigDecimal marketplaceCommission, BigDecimal shippingCost,
                             BigDecimal packagingCost, BigDecimal taxAmount, BigDecimal minimumProfit,
                             BigDecimal minimumSafePrice) {
        this.costPrice = costPrice;
        this.marketplaceCommission = marketplaceCommission;
        this.shippingCost = shippingCost;
        this.packagingCost = packagingCost;
        this.taxAmount = taxAmount;
        this.minimumProfit = minimumProfit;
        this.minimumSafePrice = minimumSafePrice;
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

    public BigDecimal getMinimumSafePrice() {
        return minimumSafePrice;
    }

    public void setMinimumSafePrice(BigDecimal minimumSafePrice) {
        this.minimumSafePrice = minimumSafePrice;
    }
}