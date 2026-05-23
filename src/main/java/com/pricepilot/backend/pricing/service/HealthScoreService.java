package com.pricepilot.backend.pricing.service;

import com.pricepilot.backend.pricing.dto.HealthScoreResponse;
import com.pricepilot.backend.recommendation.dto.GenerateRecommendationRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class HealthScoreService {

    public HealthScoreResponse calculateHealthScore(GenerateRecommendationRequest request) {

        int score = 100;

        int views = request.getViewsLast7Days() == null ? 0 : request.getViewsLast7Days();
        int orders = request.getOrdersLast7Days() == null ? 0 : request.getOrdersLast7Days();
        int stock = request.getStockQuantity() == null ? 0 : request.getStockQuantity();
        int returns = request.getReturnsLast7Days() == null ? 0 : request.getReturnsLast7Days();
        double rating = request.getRating() == null ? 0.0 : request.getRating();

        if (views > 300 && orders == 0) {
            score -= 35;
        }

        if (orders < 3) {
            score -= 20;
        }

        if (stock > 80 && orders < 5) {
            score -= 15;
        }

        if (returns > 5) {
            score -= 10;
        }

        if (rating > 0 && rating < 3.5) {
            score -= 10;
        }

        BigDecimal priceGap = request.getCurrentPrice().subtract(request.getCompetitorPrice());

        if (priceGap.compareTo(BigDecimal.ZERO) > 0) {
            score -= 10;
        }

        if (score < 0) {
            score = 0;
        }

        String status;
        String reason;

        if (score >= 80) {
            status = "HEALTHY";
            reason = "Product is performing well.";
        } else if (score >= 60) {
            status = "NEEDS_MONITORING";
            reason = "Product needs monitoring due to moderate sales or price gap.";
        } else if (score >= 40) {
            status = "SLOW_MOVING";
            reason = "Product is slow-moving and may need pricing action.";
        } else {
            status = "CRITICAL";
            reason = "Product has poor sales performance and needs immediate pricing action.";
        }

        return new HealthScoreResponse(score, status, reason);
    }
}