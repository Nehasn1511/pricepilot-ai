package com.pricepilot.backend.pricing.dto;

public class HealthScoreResponse {

    private Integer healthScore;
    private String healthStatus;
    private String reason;

    public HealthScoreResponse() {
    }

    public HealthScoreResponse(Integer healthScore, String healthStatus, String reason) {
        this.healthScore = healthScore;
        this.healthStatus = healthStatus;
        this.reason = reason;
    }

    public Integer getHealthScore() {
        return healthScore;
    }

    public void setHealthScore(Integer healthScore) {
        this.healthScore = healthScore;
    }

    public String getHealthStatus() {
        return healthStatus;
    }

    public void setHealthStatus(String healthStatus) {
        this.healthStatus = healthStatus;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}