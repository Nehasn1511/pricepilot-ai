package com.pricepilot.backend.pricing.service;

import com.pricepilot.backend.recommendation.dto.GenerateRecommendationRequest;
import com.pricepilot.backend.recommendation.enums.RecommendationType;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class PricingEngineService {

    public RecommendationType decideRecommendationType(
            GenerateRecommendationRequest request,
            BigDecimal minimumSafePrice,
            Integer healthScore
    ) {

        BigDecimal competitorPrice = request.getCompetitorPrice();
        BigDecimal currentPrice = request.getCurrentPrice();

        int views = request.getViewsLast7Days() == null ? 0 : request.getViewsLast7Days();
        int orders = request.getOrdersLast7Days() == null ? 0 : request.getOrdersLast7Days();
        int stock = request.getStockQuantity() == null ? 0 : request.getStockQuantity();

        if (competitorPrice.compareTo(minimumSafePrice) < 0) {
            return RecommendationType.MARGIN_PROTECTION;
        }

        if (stock > 100 && orders < 5) {
            return RecommendationType.STOCK_CLEARANCE;
        }

        if (views > 300 && orders == 0) {
            return RecommendationType.TEMPORARY_DISCOUNT;
        }

        if (currentPrice.compareTo(competitorPrice) > 0) {
            return RecommendationType.PRICE_MATCH;
        }

        if (healthScore >= 80 && orders > 20) {
            return RecommendationType.PRICE_INCREASE;
        }

        return RecommendationType.BUNDLE_RECOMMENDATION;
    }

    public BigDecimal decideRecommendedPrice(
            GenerateRecommendationRequest request,
            RecommendationType recommendationType,
            BigDecimal minimumSafePrice
    ) {

        switch (recommendationType) {
            case PRICE_MATCH:
            case TEMPORARY_DISCOUNT:
            case STOCK_CLEARANCE:
                return request.getCompetitorPrice().max(minimumSafePrice);

            case PRICE_INCREASE:
                return request.getCurrentPrice().multiply(BigDecimal.valueOf(1.05));

            case MARGIN_PROTECTION:
            case BUNDLE_RECOMMENDATION:
            default:
                return request.getCurrentPrice();
        }
    }

    public Double calculateDiscountPercent(BigDecimal currentPrice, BigDecimal recommendedPrice) {

        if (currentPrice == null || recommendedPrice == null) {
            return 0.0;
        }

        if (recommendedPrice.compareTo(currentPrice) >= 0) {
            return 0.0;
        }

        BigDecimal difference = currentPrice.subtract(recommendedPrice);

        return difference
                .multiply(BigDecimal.valueOf(100))
                .divide(currentPrice, 2, RoundingMode.HALF_UP)
                .doubleValue();
    }
}