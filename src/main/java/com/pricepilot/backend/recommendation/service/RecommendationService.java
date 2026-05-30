package com.pricepilot.backend.recommendation.service;

import com.pricepilot.backend.ai.service.GeminiExplanationService;
import com.pricepilot.backend.pricing.dto.HealthScoreResponse;
import com.pricepilot.backend.pricing.dto.SafePriceResponse;
import com.pricepilot.backend.pricing.service.HealthScoreService;
import com.pricepilot.backend.pricing.service.PricingEngineService;
import com.pricepilot.backend.pricing.service.ProfitGuardService;
import com.pricepilot.backend.recommendation.dto.GenerateRecommendationFromSalesRequest;
import com.pricepilot.backend.recommendation.dto.GenerateRecommendationRequest;
import com.pricepilot.backend.recommendation.dto.RecommendationResponse;
import com.pricepilot.backend.recommendation.entity.Recommendation;
import com.pricepilot.backend.recommendation.enums.RecommendationStatus;
import com.pricepilot.backend.recommendation.enums.RecommendationType;
import com.pricepilot.backend.recommendation.enums.RiskLevel;
import com.pricepilot.backend.recommendation.repository.RecommendationRepository;
import com.pricepilot.backend.sales.dto.SalesSummaryResponse;
import com.pricepilot.backend.sales.service.SalesMetricService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class RecommendationService {

    private final RecommendationRepository recommendationRepository;
    private final ProfitGuardService profitGuardService;
    private final HealthScoreService healthScoreService;
    private final PricingEngineService pricingEngineService;
    private final SalesMetricService salesMetricService;
    private final GeminiExplanationService geminiExplanationService;

    public RecommendationService(
            RecommendationRepository recommendationRepository,
            ProfitGuardService profitGuardService,
            HealthScoreService healthScoreService,
            PricingEngineService pricingEngineService,
            SalesMetricService salesMetricService,
            GeminiExplanationService geminiExplanationService
    ) {
        this.recommendationRepository = recommendationRepository;
        this.profitGuardService = profitGuardService;
        this.healthScoreService = healthScoreService;
        this.pricingEngineService = pricingEngineService;
        this.salesMetricService = salesMetricService;
        this.geminiExplanationService = geminiExplanationService;
    }

    public RecommendationResponse generateRecommendation(GenerateRecommendationRequest request) {

        SafePriceResponse safePriceResponse = profitGuardService.calculateMinimumSafePrice(request);

        HealthScoreResponse healthScoreResponse = healthScoreService.calculateHealthScore(request);

        RecommendationType type = pricingEngineService.decideRecommendationType(
                request,
                safePriceResponse.getMinimumSafePrice(),
                healthScoreResponse.getHealthScore()
        );

        BigDecimal recommendedPrice = pricingEngineService.decideRecommendedPrice(
                request,
                type,
                safePriceResponse.getMinimumSafePrice()
        );

        Double discountPercent = pricingEngineService.calculateDiscountPercent(
                request.getCurrentPrice(),
                recommendedPrice
        );

        RiskLevel riskLevel = decideRiskLevel(
                type,
                recommendedPrice,
                safePriceResponse.getMinimumSafePrice()
        );

        String expectedImpact = decideExpectedImpact(type);

        /*
         * Java backend has already decided:
         * - recommendation type
         * - recommended price
         * - minimum safe price
         * - health score
         * - risk level
         *
         * Gemini is used only to polish the explanation text.
         */
        String reason = geminiExplanationService.generateReason(
                type,
                request.getCurrentPrice(),
                request.getCompetitorPrice(),
                recommendedPrice,
                safePriceResponse.getMinimumSafePrice(),
                healthScoreResponse.getHealthScore(),
                riskLevel
        );

        Recommendation recommendation = new Recommendation();

        recommendation.setTenantId(request.getTenantId());
        recommendation.setMasterProductId(request.getMasterProductId());
        recommendation.setMarketplaceProductId(request.getMarketplaceProductId());
        recommendation.setRecommendationType(type);
        recommendation.setStatus(RecommendationStatus.PENDING);
        recommendation.setCurrentPrice(request.getCurrentPrice());
        recommendation.setRecommendedPrice(recommendedPrice);
        recommendation.setMinimumSafePrice(safePriceResponse.getMinimumSafePrice());
        recommendation.setDiscountPercent(discountPercent);
        recommendation.setHealthScore(healthScoreResponse.getHealthScore());
        recommendation.setRiskLevel(riskLevel);
        recommendation.setExpectedImpact(expectedImpact);
        recommendation.setReason(reason);
        recommendation.setDurationDays(5);
        recommendation.setExpiresAt(LocalDateTime.now().plusDays(5));
        recommendation.setCreatedAt(LocalDateTime.now());
        recommendation.setUpdatedAt(LocalDateTime.now());

        Recommendation saved = recommendationRepository.save(recommendation);

        return mapToResponse(saved);
    }

    public RecommendationResponse generateRecommendationFromSales(GenerateRecommendationFromSalesRequest request) {

        SalesSummaryResponse salesSummary = salesMetricService.getLast7DaysSummary(
                request.getTenantId(),
                request.getMarketplaceProductId()
        );

        GenerateRecommendationRequest generatedRequest = new GenerateRecommendationRequest();

        generatedRequest.setTenantId(request.getTenantId());
        generatedRequest.setMasterProductId(request.getMasterProductId());
        generatedRequest.setMarketplaceProductId(request.getMarketplaceProductId());

        generatedRequest.setCurrentPrice(request.getCurrentPrice());
        generatedRequest.setCompetitorPrice(request.getCompetitorPrice());
        generatedRequest.setCostPrice(request.getCostPrice());

        generatedRequest.setMarketplaceCommission(request.getMarketplaceCommission());
        generatedRequest.setShippingCost(request.getShippingCost());
        generatedRequest.setPackagingCost(request.getPackagingCost());
        generatedRequest.setTaxAmount(request.getTaxAmount());
        generatedRequest.setMinimumProfit(request.getMinimumProfit());

        generatedRequest.setViewsLast7Days(salesSummary.getTotalViews());
        generatedRequest.setOrdersLast7Days(salesSummary.getTotalOrders());
        generatedRequest.setReturnsLast7Days(salesSummary.getTotalReturns());
        generatedRequest.setRating(request.getRating());

        // For now, stock is taken as default because SalesSummaryResponse does not include stock.
        generatedRequest.setStockQuantity(100);

        return generateRecommendation(generatedRequest);
    }

    public List<RecommendationResponse> getRecommendationsByTenant(Long tenantId) {
        return recommendationRepository.findByTenantId(tenantId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public RecommendationResponse getRecommendationById(Long id) {
        Recommendation recommendation = recommendationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Recommendation not found with id: " + id));

        return mapToResponse(recommendation);
    }

    public RecommendationResponse approveRecommendation(Long id) {
        Recommendation recommendation = recommendationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Recommendation not found with id: " + id));

        recommendation.setStatus(RecommendationStatus.APPROVED);
        recommendation.setUpdatedAt(LocalDateTime.now());

        Recommendation saved = recommendationRepository.save(recommendation);
        return mapToResponse(saved);
    }

    public RecommendationResponse rejectRecommendation(Long id) {
        Recommendation recommendation = recommendationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Recommendation not found with id: " + id));

        recommendation.setStatus(RecommendationStatus.REJECTED);
        recommendation.setUpdatedAt(LocalDateTime.now());

        Recommendation saved = recommendationRepository.save(recommendation);
        return mapToResponse(saved);
    }
    public RecommendationResponse applyRecommendation(Long id) {
        Recommendation recommendation = recommendationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Recommendation not found with id: " + id));

        if (recommendation.getStatus() != RecommendationStatus.APPROVED) {
            throw new RuntimeException("Only APPROVED recommendations can be applied.");
        }

        recommendation.setStatus(RecommendationStatus.APPLIED);
        recommendation.setUpdatedAt(LocalDateTime.now());

        Recommendation saved = recommendationRepository.save(recommendation);
        return mapToResponse(saved);
    }

    private RiskLevel decideRiskLevel(
            RecommendationType type,
            BigDecimal recommendedPrice,
            BigDecimal minimumSafePrice
    ) {
        if (type == RecommendationType.MARGIN_PROTECTION) {
            return RiskLevel.HIGH;
        }

        if (recommendedPrice.compareTo(minimumSafePrice) == 0) {
            return RiskLevel.MEDIUM;
        }

        return RiskLevel.LOW;
    }

    private String decideExpectedImpact(RecommendationType type) {

        if (type == RecommendationType.TEMPORARY_DISCOUNT || type == RecommendationType.PRICE_MATCH) {
            return "Medium to High sales improvement expected.";
        }

        if (type == RecommendationType.STOCK_CLEARANCE) {
            return "High chance of stock movement improvement.";
        }

        if (type == RecommendationType.MARGIN_PROTECTION) {
            return "Profit loss prevented. Direct discount is not recommended.";
        }

        if (type == RecommendationType.PRICE_INCREASE) {
            return "Potential profit increase because product is already performing well.";
        }

        return "Moderate improvement expected through alternative selling strategy.";
    }

    /*
     * Keeping this method as backup.
     * Currently GeminiExplanationService is used for the final reason.
     */
    private String buildReason(
            GenerateRecommendationRequest request,
            RecommendationType type,
            BigDecimal minimumSafePrice,
            BigDecimal recommendedPrice
    ) {

        switch (type) {
            case MARGIN_PROTECTION:
                return "Competitor price is below the minimum safe price. Matching the competitor price may cause loss. "
                        + "Minimum safe price is ₹" + minimumSafePrice
                        + ", while competitor price is ₹" + request.getCompetitorPrice()
                        + ". Recommended action is to avoid direct discount and use bundle, coupon, free shipping, or visibility improvement.";

            case TEMPORARY_DISCOUNT:
                return "Product has high views but low or zero sales. Current price is ₹"
                        + request.getCurrentPrice()
                        + " and competitor price is ₹" + request.getCompetitorPrice()
                        + ". Since recommended price ₹" + recommendedPrice
                        + " is above minimum safe price ₹" + minimumSafePrice
                        + ", a temporary discount is safe.";

            case PRICE_MATCH:
                return "Current price is higher than competitor price. Competitor price is still above the minimum safe price, so price matching is recommended.";

            case STOCK_CLEARANCE:
                return "Product has high stock and low sales. A safe discount can help clear inventory without going below minimum safe price.";

            case PRICE_INCREASE:
                return "Product health score is strong and sales are good. A small price increase can improve profit margin.";

            case BUNDLE_RECOMMENDATION:
            default:
                return "Direct price cut may not be the best option. Consider bundle offer, coupon, or free shipping to improve conversion.";
        }
    }

    private RecommendationResponse mapToResponse(Recommendation recommendation) {

        RecommendationResponse response = new RecommendationResponse();

        response.setId(recommendation.getId());
        response.setTenantId(recommendation.getTenantId());
        response.setMasterProductId(recommendation.getMasterProductId());
        response.setMarketplaceProductId(recommendation.getMarketplaceProductId());
        response.setRecommendationType(recommendation.getRecommendationType().name());
        response.setStatus(recommendation.getStatus().name());
        response.setCurrentPrice(recommendation.getCurrentPrice());
        response.setRecommendedPrice(recommendation.getRecommendedPrice());
        response.setMinimumSafePrice(recommendation.getMinimumSafePrice());
        response.setDiscountPercent(recommendation.getDiscountPercent());
        response.setHealthScore(recommendation.getHealthScore());
        response.setRiskLevel(recommendation.getRiskLevel().name());
        response.setExpectedImpact(recommendation.getExpectedImpact());
        response.setReason(recommendation.getReason());
        response.setDurationDays(recommendation.getDurationDays());
        response.setExpiresAt(recommendation.getExpiresAt());
        response.setCreatedAt(recommendation.getCreatedAt());

        return response;
    }
}