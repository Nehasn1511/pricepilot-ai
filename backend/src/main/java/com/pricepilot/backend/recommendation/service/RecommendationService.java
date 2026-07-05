package com.pricepilot.backend.recommendation.service;

import com.pricepilot.backend.ai.service.GeminiExplanationService;
import com.pricepilot.backend.pricing.dto.HealthScoreResponse;
import com.pricepilot.backend.pricing.dto.SafePriceResponse;
import com.pricepilot.backend.pricing.service.HealthScoreService;
import com.pricepilot.backend.pricing.service.PricingEngineService;
import com.pricepilot.backend.pricing.service.ProfitGuardService;
import com.pricepilot.backend.product.entity.Listing;
import com.pricepilot.backend.product.entity.Product;
import com.pricepilot.backend.product.repository.ListingRepository;
import com.pricepilot.backend.product.repository.ProductRepository;
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
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Service
public class RecommendationService {

    private final RecommendationRepository recommendationRepository;
    private final ProfitGuardService profitGuardService;
    private final HealthScoreService healthScoreService;
    private final PricingEngineService pricingEngineService;
    private final SalesMetricService salesMetricService;
    private final GeminiExplanationService geminiExplanationService;

    private final ProductRepository productRepository;
    private final ListingRepository listingRepository;

    public RecommendationService(
            RecommendationRepository recommendationRepository,
            ProfitGuardService profitGuardService,
            HealthScoreService healthScoreService,
            PricingEngineService pricingEngineService,
            SalesMetricService salesMetricService,
            GeminiExplanationService geminiExplanationService,
            ProductRepository productRepository,
            ListingRepository listingRepository
    ) {
        this.recommendationRepository = recommendationRepository;
        this.profitGuardService = profitGuardService;
        this.healthScoreService = healthScoreService;
        this.pricingEngineService = pricingEngineService;
        this.salesMetricService = salesMetricService;
        this.geminiExplanationService = geminiExplanationService;
        this.productRepository = productRepository;
        this.listingRepository = listingRepository;
    }

    public RecommendationResponse generateRecommendation(GenerateRecommendationRequest request) {

        SafePriceResponse safePriceResponse =
                profitGuardService.calculateMinimumSafePrice(request);

        HealthScoreResponse healthScoreResponse =
                healthScoreService.calculateHealthScore(request);

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

        if (recommendedPrice == null) {
            recommendedPrice = safePriceResponse.getMinimumSafePrice();
        }

        /*
         * IMPORTANT FIX:
         * If the recommendation is MARGIN_PROTECTION,
         * recommended price must never be below minimum safe price.
         */
        if (
                type == RecommendationType.MARGIN_PROTECTION &&
                recommendedPrice.compareTo(safePriceResponse.getMinimumSafePrice()) < 0
        ) {
            recommendedPrice = safePriceResponse.getMinimumSafePrice();
        }

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

    public RecommendationResponse generateRecommendationFromSales(
            GenerateRecommendationFromSalesRequest request
    ) {

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

        generatedRequest.setStockQuantity(100);

        return generateRecommendation(generatedRequest);
    }

    @Transactional
    public List<RecommendationResponse> generateAllRecommendations(Long tenantId) {

        System.out.println("========== GENERATE ALL RECOMMENDATIONS START ==========");
        System.out.println("Tenant ID: " + tenantId);

        List<Product> products = productRepository.findAll()
                .stream()
                .filter(product -> Objects.equals(product.getTenantId(), tenantId))
                .toList();

        System.out.println("Products found: " + products.size());

        for (Product product : products) {

            System.out.println("Product ID: " + product.getId());
            System.out.println("Product Name: " + product.getName());
            System.out.println("Product Cost Price: " + product.getCostPrice());

            List<Listing> listings = listingRepository.findByProductId(product.getId());

            System.out.println("Listings found for product " + product.getId() + ": " + listings.size());

            for (Listing listing : listings) {

                try {
                    System.out.println("----- Listing -----");
                    System.out.println("Listing ID: " + listing.getId());
                    System.out.println("Platform: " + listing.getPlatform());
                    System.out.println("Price: " + listing.getPrice());

                    if (listing.getId() == null) {
                        System.out.println("SKIPPED: Listing ID is null.");
                        continue;
                    }

                    /*
                     * Remove old pending recommendation for same product + listing.
                     * This prevents duplicate cards and regenerates with latest safe-price logic.
                     */
                    List<Recommendation> existingPending = recommendationRepository.findByTenantId(tenantId)
                            .stream()
                            .filter(rec ->
                                    Objects.equals(rec.getTenantId(), tenantId)
                                            && Objects.equals(rec.getMasterProductId(), product.getId())
                                            && Objects.equals(rec.getMarketplaceProductId(), listing.getId())
                                            && rec.getStatus() == RecommendationStatus.PENDING
                            )
                            .toList();

                    for (Recommendation oldRecommendation : existingPending) {
                        recommendationRepository.delete(oldRecommendation);
                        System.out.println("Deleted old pending recommendation ID: " + oldRecommendation.getId());
                    }

                    BigDecimal costPrice = product.getCostPrice() != null
                            ? product.getCostPrice()
                            : BigDecimal.ZERO;

                    BigDecimal currentPrice = listing.getPrice();

                    if (currentPrice == null || currentPrice.compareTo(BigDecimal.ZERO) <= 0) {
                        currentPrice = costPrice.multiply(BigDecimal.valueOf(1.10))
                                .setScale(2, RoundingMode.HALF_UP);

                        System.out.println("Listing price missing. Using fallback price: " + currentPrice);
                    }

                    if (currentPrice.compareTo(BigDecimal.ZERO) <= 0) {
                        System.out.println("SKIPPED: Current price is invalid.");
                        continue;
                    }

                    BigDecimal competitorPrice = calculateCompetitorPrice(
                            listing,
                            listings,
                            currentPrice
                    );

                    GenerateRecommendationRequest request = new GenerateRecommendationRequest();

                    request.setTenantId(tenantId);
                    request.setMasterProductId(product.getId());
                    request.setMarketplaceProductId(listing.getId());

                    request.setCurrentPrice(currentPrice);
                    request.setCompetitorPrice(competitorPrice);
                    request.setCostPrice(costPrice);

                    request.setMarketplaceCommission(percent(currentPrice, 10));
                    request.setShippingCost(BigDecimal.ZERO);
                    request.setPackagingCost(BigDecimal.ZERO);
                    request.setTaxAmount(BigDecimal.ZERO);
                    request.setMinimumProfit(percent(costPrice, 5));

                    /*
                     * Demo values because Listing table does not store these fields yet.
                     * Later you can add stockQuantity, viewsLast7Days, ordersLast7Days in Listing entity.
                     */
                    request.setViewsLast7Days(800);
                    request.setOrdersLast7Days(3);
                    request.setReturnsLast7Days(0);
                    request.setStockQuantity(50);
                    request.setRating(4.2);

                    RecommendationResponse generated = generateRecommendation(request);

                    System.out.println("GENERATED RECOMMENDATION ID: " + generated.getId());
                    System.out.println("Linked Product ID: " + generated.getMasterProductId());
                    System.out.println("Linked Listing ID: " + generated.getMarketplaceProductId());
                    System.out.println("Current Price: " + generated.getCurrentPrice());
                    System.out.println("Recommended Price: " + generated.getRecommendedPrice());
                    System.out.println("Minimum Safe Price: " + generated.getMinimumSafePrice());

                } catch (Exception e) {
                    System.out.println("FAILED TO GENERATE FOR LISTING ID: " + listing.getId());
                    e.printStackTrace();
                }
            }
        }

        List<RecommendationResponse> result = getRecommendationsByTenant(tenantId);

        System.out.println("Total recommendations after generation: " + result.size());
        System.out.println("========== GENERATE ALL RECOMMENDATIONS END ==========");

        return result;
    }

    private BigDecimal calculateCompetitorPrice(
            Listing currentListing,
            List<Listing> allListings,
            BigDecimal fallbackCurrentPrice
    ) {

        BigDecimal lowestOtherPrice = allListings
                .stream()
                .filter(listing -> listing.getPrice() != null)
                .filter(listing -> !Objects.equals(listing.getId(), currentListing.getId()))
                .map(Listing::getPrice)
                .min(BigDecimal::compareTo)
                .orElse(null);

        if (lowestOtherPrice != null) {
            return lowestOtherPrice;
        }

        return fallbackCurrentPrice
                .multiply(BigDecimal.valueOf(0.95))
                .setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal percent(BigDecimal value, int percentage) {
        if (value == null) return BigDecimal.ZERO;

        return value
                .multiply(BigDecimal.valueOf(percentage))
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
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
        recommendation.setAppliedAt(LocalDateTime.now());
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

        response.setRecommendationType(
                recommendation.getRecommendationType() != null
                        ? recommendation.getRecommendationType().name()
                        : null
        );

        response.setStatus(
                recommendation.getStatus() != null
                        ? recommendation.getStatus().name()
                        : null
        );

        response.setCurrentPrice(recommendation.getCurrentPrice());
        response.setRecommendedPrice(recommendation.getRecommendedPrice());
        response.setMinimumSafePrice(recommendation.getMinimumSafePrice());
        response.setDiscountPercent(recommendation.getDiscountPercent());
        response.setHealthScore(recommendation.getHealthScore());

        response.setRiskLevel(
                recommendation.getRiskLevel() != null
                        ? recommendation.getRiskLevel().name()
                        : null
        );

        response.setExpectedImpact(recommendation.getExpectedImpact());
        response.setReason(recommendation.getReason());
        response.setDurationDays(recommendation.getDurationDays());
        response.setExpiresAt(recommendation.getExpiresAt());
        response.setCreatedAt(recommendation.getCreatedAt());

        return response;
    }
}