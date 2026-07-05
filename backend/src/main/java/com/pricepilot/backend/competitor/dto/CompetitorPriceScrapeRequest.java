package com.pricepilot.backend.competitor.dto;

public class CompetitorPriceScrapeRequest {

    private Long tenantId;
    private Long marketplaceProductId;
    private String marketplaceName;
    private String productUrl;

    public CompetitorPriceScrapeRequest() {
    }

    public CompetitorPriceScrapeRequest(Long tenantId, Long marketplaceProductId, String marketplaceName, String productUrl) {
        this.tenantId = tenantId;
        this.marketplaceProductId = marketplaceProductId;
        this.marketplaceName = marketplaceName;
        this.productUrl = productUrl;
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

    public String getMarketplaceName() {
        return marketplaceName;
    }

    public void setMarketplaceName(String marketplaceName) {
        this.marketplaceName = marketplaceName;
    }

    public String getProductUrl() {
        return productUrl;
    }

    public void setProductUrl(String productUrl) {
        this.productUrl = productUrl;
    }
}