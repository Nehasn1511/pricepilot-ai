package com.pricepilot.backend.product.dto;

import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;

public class ListingRequest {

    @NotBlank
    private String platform;

    private BigDecimal price;
    private String url;
    private String externalSku;

    public String getPlatform() { return platform; }
    public void setPlatform(String platform) { this.platform = platform; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }
    public String getExternalSku() { return externalSku; }
    public void setExternalSku(String externalSku) { this.externalSku = externalSku; }
}
