package com.pricepilot.service;

import com.pricepilot.ai.GeminiAIService;
import com.pricepilot.entity.*;
import com.pricepilot.entity.Recommendation.*;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PricingEngineService {

    private final GeminiAIService geminiAIService;

    public Recommendation generateRecommendation(MasterProduct product, MarketplaceProduct targetListing) {
        List<MarketplaceProduct> allListings = product.getListings();
        BigDecimal minimumSafePrice = product.getMinimumSafePrice();
        BigDecimal currentPrice = targetListing.getCurrentPrice();

        // Find lowest price across all marketplaces
        BigDecimal lowestMarketPrice = allListings.stream()
                .map(MarketplaceProduct::getCurrentPrice)
                .filter(p -> p != null && p.compareTo(BigDecimal.ZERO) > 0)
                .min(Comparator.naturalOrder())
                .orElse(currentPrice);

        int views = targetListing.getViewsLast7Days() != null ? targetListing.getViewsLast7Days() : 0;
        int orders = targetListing.getOrdersLast7Days() != null ? targetListing.getOrdersLast7Days() : 0;
        int stock = targetListing.getStockQuantity() != null ? targetListing.getStockQuantity() : 0;

        // Determine recommendation type
        RecommendationType type = determineRecommendationType(
                currentPrice, lowestMarketPrice, minimumSafePrice, views, orders, stock
        );

        // Calculate recommended price
        BigDecimal recommendedPrice = calculateRecommendedPrice(
                type, currentPrice, lowestMarketPrice, minimumSafePrice
        );

        // Calculate discount percent
        BigDecimal discountPercent = BigDecimal.ZERO;
        if (recommendedPrice.compareTo(currentPrice) < 0) {
            discountPercent = currentPrice.subtract(recommendedPrice)
                    .divide(currentPrice, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .setScale(1, RoundingMode.HALF_UP);
        }

        // Determine risk level
        RiskLevel riskLevel = determineRiskLevel(recommendedPrice, minimumSafePrice, type);

        // Determine expected impact
        String expectedImpact = determineExpectedImpact(views, orders, type);

        // Generate AI explanation
        String aiExplanation = geminiAIService.generateRecommendationExplanation(
                product.getName(),
                targetListing.getPlatform().name(),
                currentPrice,
                lowestMarketPrice,
                minimumSafePrice,
                recommendedPrice,
                views, orders, stock,
                type.name()
        );

        return Recommendation.builder()
                .tenant(product.getTenant())
                .masterProduct(product)
                .marketplaceProduct(targetListing)
                .recommendationType(type)
                .currentPrice(currentPrice)
                .recommendedPrice(recommendedPrice)
                .minimumSafePrice(minimumSafePrice)
                .lowestMarketPrice(lowestMarketPrice)
                .discountPercent(discountPercent)
                .reason(generateRuleBasedReason(type, currentPrice, lowestMarketPrice, minimumSafePrice, views, orders))
                .aiExplanation(aiExplanation)
                .riskLevel(riskLevel)
                .expectedImpact(expectedImpact)
                .durationDays(type == RecommendationType.PRICE_INCREASE ? null : 5)
                .status(Status.PENDING)
                .build();
    }

    private RecommendationType determineRecommendationType(
            BigDecimal currentPrice, BigDecimal lowestMarketPrice,
            BigDecimal minimumSafePrice, int views, int orders, int stock
    ) {
        boolean isOverpriced = currentPrice.compareTo(lowestMarketPrice) > 0;
        boolean canMatchPrice = lowestMarketPrice.compareTo(minimumSafePrice) >= 0;
        boolean highViewsNoSales = views > 100 && orders == 0;
        boolean highStockLowSales = stock > 50 && orders < 5;
        boolean strongSales = orders > 20;

        // Price increase if selling well
        if (strongSales && !isOverpriced) {
            return RecommendationType.PRICE_INCREASE;
        }

        // Cannot safely match competitor
        if (isOverpriced && !canMatchPrice) {
            return RecommendationType.MARGIN_PROTECTION;
        }

        // Stock clearance needed
        if (highStockLowSales && canMatchPrice) {
            return RecommendationType.STOCK_CLEARANCE;
        }

        // Price match if competitor is cheaper and it's safe
        if (isOverpriced && canMatchPrice) {
            return RecommendationType.PRICE_MATCH;
        }

        // Temporary discount for low sales
        if (highViewsNoSales) {
            return RecommendationType.TEMPORARY_DISCOUNT;
        }

        return RecommendationType.TEMPORARY_DISCOUNT;
    }

    private BigDecimal calculateRecommendedPrice(
            RecommendationType type, BigDecimal currentPrice,
            BigDecimal lowestMarketPrice, BigDecimal minimumSafePrice
    ) {
        return switch (type) {
            case PRICE_MATCH -> lowestMarketPrice;
            case TEMPORARY_DISCOUNT -> {
                // 10% discount but not below safe price
                BigDecimal discounted = currentPrice.multiply(BigDecimal.valueOf(0.90));
                yield discounted.compareTo(minimumSafePrice) >= 0 ? discounted : minimumSafePrice;
            }
            case STOCK_CLEARANCE -> {
                // 15% discount but not below safe price
                BigDecimal discounted = currentPrice.multiply(BigDecimal.valueOf(0.85));
                yield discounted.compareTo(minimumSafePrice) >= 0 ? discounted : minimumSafePrice;
            }
            case PRICE_INCREASE -> currentPrice.multiply(BigDecimal.valueOf(1.05))
                    .setScale(0, RoundingMode.CEILING);
            case MARGIN_PROTECTION -> currentPrice; // Don't change price
            case BUNDLE_OFFER -> currentPrice; // Price stays, offer bundle instead
        };
    }

    private RiskLevel determineRiskLevel(BigDecimal recommendedPrice, BigDecimal minimumSafePrice, RecommendationType type) {
        if (type == RecommendationType.MARGIN_PROTECTION) return RiskLevel.HIGH;
        if (type == RecommendationType.PRICE_INCREASE) return RiskLevel.LOW;

        BigDecimal buffer = recommendedPrice.subtract(minimumSafePrice);
        BigDecimal bufferPercent = buffer.divide(minimumSafePrice, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100));

        if (bufferPercent.compareTo(BigDecimal.valueOf(15)) > 0) return RiskLevel.LOW;
        if (bufferPercent.compareTo(BigDecimal.valueOf(5)) > 0) return RiskLevel.MEDIUM;
        return RiskLevel.HIGH;
    }

    private String determineExpectedImpact(int views, int orders, RecommendationType type) {
        if (type == RecommendationType.PRICE_INCREASE) return "Increased profit per unit";
        if (views > 500 && orders == 0) return "High - strong demand signals with pricing gap";
        if (views > 200) return "Medium to High - good visibility, price adjustment likely to convert";
        return "Medium - moderate improvement expected";
    }

    private String generateRuleBasedReason(
            RecommendationType type, BigDecimal current, BigDecimal lowest,
            BigDecimal safe, int views, int orders
    ) {
        return switch (type) {
            case PRICE_MATCH -> String.format(
                    "Product is priced ₹%.0f higher than the lowest marketplace price (₹%.0f). " +
                    "The recommended price is above the minimum safe price (₹%.0f), so profit is protected.",
                    current.subtract(lowest), lowest, safe);
            case TEMPORARY_DISCOUNT -> String.format(
                    "Product has %d views but only %d orders in the last 7 days. " +
                    "A temporary discount may improve conversion rate.",
                    views, orders);
            case STOCK_CLEARANCE -> String.format(
                    "High inventory with low sales velocity. A clearance discount will help " +
                    "free up capital. Recommended price remains above safe price (₹%.0f).", safe);
            case MARGIN_PROTECTION -> String.format(
                    "Competitor price (₹%.0f) is below your minimum safe price (₹%.0f). " +
                    "Matching this price would cause a loss. Consider alternative strategies.",
                    lowest, safe);
            case PRICE_INCREASE -> "Sales are strong at current price. Market demand supports a price increase.";
            case BUNDLE_OFFER -> "Direct price reduction is risky. Consider bundling with a complementary product.";
        };
    }

    public int calculateHealthScore(MarketplaceProduct listing, BigDecimal lowestMarketPrice) {
        int score = 50; // Base score

        int views = listing.getViewsLast7Days() != null ? listing.getViewsLast7Days() : 0;
        int orders = listing.getOrdersLast7Days() != null ? listing.getOrdersLast7Days() : 0;
        int stock = listing.getStockQuantity() != null ? listing.getStockQuantity() : 0;
        BigDecimal price = listing.getCurrentPrice() != null ? listing.getCurrentPrice() : BigDecimal.ZERO;
        Double rating = listing.getRating();

        // Sales score (+/- 20)
        if (orders > 20) score += 20;
        else if (orders > 10) score += 15;
        else if (orders > 5) score += 10;
        else if (orders > 0) score += 5;
        else score -= 15;

        // Conversion score (+/- 10)
        if (views > 0) {
            double convRate = (double) orders / views * 100;
            if (convRate > 5) score += 10;
            else if (convRate > 2) score += 5;
            else if (convRate < 0.5 && views > 100) score -= 10;
        }

        // Price competitiveness (+/- 10)
        if (lowestMarketPrice != null && price.compareTo(BigDecimal.ZERO) > 0) {
            double priceDiff = price.subtract(lowestMarketPrice)
                    .divide(price, 4, RoundingMode.HALF_UP).doubleValue() * 100;
            if (priceDiff <= 0) score += 10;
            else if (priceDiff < 10) score += 5;
            else if (priceDiff > 20) score -= 10;
        }

        // Rating score (+/- 5)
        if (rating != null) {
            if (rating >= 4.0) score += 5;
            else if (rating < 3.0) score -= 5;
        }

        // Stock risk (-5)
        if (stock > 100 && orders < 5) score -= 5;

        return Math.max(0, Math.min(100, score));
    }
}
