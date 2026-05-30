package com.pricepilot.backend.competitor.dto;

public class CompetitorPriceScrapeResponse {

    private Long tenantId;
    private Long marketplaceProductId;
    private String marketplaceName;
    private String productUrl;
    private Double competitorPrice;
    private String status;
    private String message;

    public CompetitorPriceScrapeResponse() {
    }

    public CompetitorPriceScrapeResponse(Long tenantId, Long marketplaceProductId, String marketplaceName,
                                         String productUrl, Double competitorPrice, String status, String message) {
        this.tenantId = tenantId;
        this.marketplaceProductId = marketplaceProductId;
        this.marketplaceName = marketplaceName;
        this.productUrl = productUrl;
        this.competitorPrice = competitorPrice;
        this.status = status;
        this.message = message;
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

    public Double getCompetitorPrice() {
        return competitorPrice;
    }

    public void setCompetitorPrice(Double competitorPrice) {
        this.competitorPrice = competitorPrice;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}