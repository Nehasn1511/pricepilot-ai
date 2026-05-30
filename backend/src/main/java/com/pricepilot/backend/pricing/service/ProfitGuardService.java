package com.pricepilot.backend.pricing.service;

import com.pricepilot.backend.pricing.dto.SafePriceResponse;
import com.pricepilot.backend.recommendation.dto.GenerateRecommendationRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class ProfitGuardService {

    public SafePriceResponse calculateMinimumSafePrice(GenerateRecommendationRequest request) {

        BigDecimal minimumSafePrice = request.getCostPrice()
                .add(request.getMarketplaceCommission())
                .add(request.getShippingCost())
                .add(request.getPackagingCost())
                .add(request.getTaxAmount())
                .add(request.getMinimumProfit());

        return new SafePriceResponse(
                request.getCostPrice(),
                request.getMarketplaceCommission(),
                request.getShippingCost(),
                request.getPackagingCost(),
                request.getTaxAmount(),
                request.getMinimumProfit(),
                minimumSafePrice
        );
    }

    public boolean isPriceSafe(BigDecimal recommendedPrice, BigDecimal minimumSafePrice) {
        return recommendedPrice.compareTo(minimumSafePrice) >= 0;
    }
}