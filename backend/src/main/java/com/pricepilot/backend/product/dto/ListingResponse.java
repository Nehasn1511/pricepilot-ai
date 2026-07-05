package com.pricepilot.backend.product.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ListingResponse {

    private Long id;
    private Long productId;
    private String platform;
    private BigDecimal price;
    private String url;
    private String externalSku;
    private LocalDateTime createdAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    public String getPlatform() { return platform; }
    public void setPlatform(String platform) { this.platform = platform; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }
    public String getExternalSku() { return externalSku; }
    public void setExternalSku(String externalSku) { this.externalSku = externalSku; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
