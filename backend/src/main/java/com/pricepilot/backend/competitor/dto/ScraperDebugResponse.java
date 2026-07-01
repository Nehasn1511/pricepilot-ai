package com.pricepilot.backend.competitor.dto;

public class ScraperDebugResponse {

    private String productUrl;
    private String title;
    private String bodyPreview;
    private String status;
    private String message;

    public ScraperDebugResponse() {
    }

    public ScraperDebugResponse(String productUrl, String title, String bodyPreview, String status, String message) {
        this.productUrl = productUrl;
        this.title = title;
        this.bodyPreview = bodyPreview;
        this.status = status;
        this.message = message;
    }

    public String getProductUrl() {
        return productUrl;
    }

    public void setProductUrl(String productUrl) {
        this.productUrl = productUrl;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getBodyPreview() {
        return bodyPreview;
    }

    public void setBodyPreview(String bodyPreview) {
        this.bodyPreview = bodyPreview;
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