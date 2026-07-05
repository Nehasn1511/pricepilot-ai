package com.pricepilot.backend.pricing.dto;

import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class PriceSnapshotRequest {

    @NotNull
    private Long tenantId;

    @NotNull
    private Long masterProductId;

    @NotNull
    private Long marketplaceProductId;

    private String platform;

    @NotNull
    private BigDecimal price;

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

    public String getPlatform() {
        return platform;
    }

    public void setPlatform(String platform) {
        this.platform = platform;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }
}