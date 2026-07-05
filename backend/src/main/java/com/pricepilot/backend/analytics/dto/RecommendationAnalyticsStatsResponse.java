package com.pricepilot.backend.analytics.dto;

import java.math.BigDecimal;

public class RecommendationAnalyticsStatsResponse {

    private Long tenantId;

    private Long totalRecommendations;
    private Long pendingRecommendations;
    private Long approvedRecommendations;
    private Long rejectedRecommendations;
    private Long appliedRecommendations;

    private BigDecimal averageDiscountPercent;
    private Double averageHealthScore;

    private Long lowRiskCount;
    private Long mediumRiskCount;
    private Long highRiskCount;

    public RecommendationAnalyticsStatsResponse() {
    }

    public Long getTenantId() {
        return tenantId;
    }

    public void setTenantId(Long tenantId) {
        this.tenantId = tenantId;
    }

    public Long getTotalRecommendations() {
        return totalRecommendations;
    }

    public void setTotalRecommendations(Long totalRecommendations) {
        this.totalRecommendations = totalRecommendations;
    }

    public Long getPendingRecommendations() {
        return pendingRecommendations;
    }

    public void setPendingRecommendations(Long pendingRecommendations) {
        this.pendingRecommendations = pendingRecommendations;
    }

    public Long getApprovedRecommendations() {
        return approvedRecommendations;
    }

    public void setApprovedRecommendations(Long approvedRecommendations) {
        this.approvedRecommendations = approvedRecommendations;
    }

    public Long getRejectedRecommendations() {
        return rejectedRecommendations;
    }

    public void setRejectedRecommendations(Long rejectedRecommendations) {
        this.rejectedRecommendations = rejectedRecommendations;
    }

    public Long getAppliedRecommendations() {
        return appliedRecommendations;
    }

    public void setAppliedRecommendations(Long appliedRecommendations) {
        this.appliedRecommendations = appliedRecommendations;
    }

    public BigDecimal getAverageDiscountPercent() {
        return averageDiscountPercent;
    }

    public void setAverageDiscountPercent(BigDecimal averageDiscountPercent) {
        this.averageDiscountPercent = averageDiscountPercent;
    }

    public Double getAverageHealthScore() {
        return averageHealthScore;
    }

    public void setAverageHealthScore(Double averageHealthScore) {
        this.averageHealthScore = averageHealthScore;
    }

    public Long getLowRiskCount() {
        return lowRiskCount;
    }

    public void setLowRiskCount(Long lowRiskCount) {
        this.lowRiskCount = lowRiskCount;
    }

    public Long getMediumRiskCount() {
        return mediumRiskCount;
    }

    public void setMediumRiskCount(Long mediumRiskCount) {
        this.mediumRiskCount = mediumRiskCount;
    }

    public Long getHighRiskCount() {
        return highRiskCount;
    }

    public void setHighRiskCount(Long highRiskCount) {
        this.highRiskCount = highRiskCount;
    }
}