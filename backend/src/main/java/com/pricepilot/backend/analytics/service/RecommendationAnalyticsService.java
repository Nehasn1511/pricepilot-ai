package com.pricepilot.backend.analytics.service;

import com.pricepilot.backend.analytics.dto.BeforeAfterPerformanceResponse;
import com.pricepilot.backend.analytics.dto.RecommendationAnalyticsStatsResponse;

import com.pricepilot.backend.discount.entity.DiscountLifecycle;
import com.pricepilot.backend.discount.repository.DiscountLifecycleRepository;

import com.pricepilot.backend.recommendation.entity.Recommendation;
import com.pricepilot.backend.recommendation.enums.RecommendationStatus;
import com.pricepilot.backend.recommendation.enums.RiskLevel;
import com.pricepilot.backend.recommendation.repository.RecommendationRepository;

import com.pricepilot.backend.sales.entity.SalesMetric;
import com.pricepilot.backend.sales.repository.SalesMetricRepository;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Service
public class RecommendationAnalyticsService {

    private final DiscountLifecycleRepository discountLifecycleRepository;
    private final SalesMetricRepository salesMetricRepository;
    private final RecommendationRepository recommendationRepository;

    public RecommendationAnalyticsService(
            DiscountLifecycleRepository discountLifecycleRepository,
            SalesMetricRepository salesMetricRepository,
            RecommendationRepository recommendationRepository
    ) {
        this.discountLifecycleRepository = discountLifecycleRepository;
        this.salesMetricRepository = salesMetricRepository;
        this.recommendationRepository = recommendationRepository;
    }

    public RecommendationAnalyticsStatsResponse getRecommendationStats(Long tenantId) {

        List<Recommendation> recommendations =
                recommendationRepository.findByTenantId(tenantId);

        RecommendationAnalyticsStatsResponse response =
                new RecommendationAnalyticsStatsResponse();

        response.setTenantId(tenantId);

        response.setTotalRecommendations(
                recommendationRepository.countByTenantId(tenantId)
        );

        response.setPendingRecommendations(
                recommendationRepository.countByTenantIdAndStatus(
                        tenantId,
                        RecommendationStatus.PENDING
                )
        );

        response.setApprovedRecommendations(
                recommendationRepository.countByTenantIdAndStatus(
                        tenantId,
                        RecommendationStatus.APPROVED
                )
        );

        response.setRejectedRecommendations(
                recommendationRepository.countByTenantIdAndStatus(
                        tenantId,
                        RecommendationStatus.REJECTED
                )
        );

        response.setAppliedRecommendations(
                recommendationRepository.countByTenantIdAndStatus(
                        tenantId,
                        RecommendationStatus.APPLIED
                )
        );

        response.setLowRiskCount(
                recommendationRepository.countByTenantIdAndRiskLevel(
                        tenantId,
                        RiskLevel.LOW
                )
        );

        response.setMediumRiskCount(
                recommendationRepository.countByTenantIdAndRiskLevel(
                        tenantId,
                        RiskLevel.MEDIUM
                )
        );

        response.setHighRiskCount(
                recommendationRepository.countByTenantIdAndRiskLevel(
                        tenantId,
                        RiskLevel.HIGH
                )
        );

        BigDecimal totalDiscountPercent = BigDecimal.ZERO;
        int discountCount = 0;

        int totalHealthScore = 0;
        int healthScoreCount = 0;

        for (Recommendation recommendation : recommendations) {

            if (recommendation.getDiscountPercent() != null) {
                totalDiscountPercent = totalDiscountPercent.add(
                        BigDecimal.valueOf(recommendation.getDiscountPercent())
                );
                discountCount++;
            }

            if (recommendation.getHealthScore() != null) {
                totalHealthScore += recommendation.getHealthScore();
                healthScoreCount++;
            }
        }

        if (discountCount > 0) {
            response.setAverageDiscountPercent(
                    totalDiscountPercent.divide(
                            BigDecimal.valueOf(discountCount),
                            2,
                            RoundingMode.HALF_UP
                    )
            );
        } else {
            response.setAverageDiscountPercent(BigDecimal.ZERO);
        }

        if (healthScoreCount > 0) {
            response.setAverageHealthScore(
                    (double) totalHealthScore / healthScoreCount
            );
        } else {
            response.setAverageHealthScore(0.0);
        }

        return response;
    }

    public BeforeAfterPerformanceResponse getBeforeAfterPerformance(Long recommendationId) {

        DiscountLifecycle discount =
                discountLifecycleRepository.findByRecommendationId(recommendationId);

        if (discount == null) {
            throw new RuntimeException(
                    "No discount lifecycle found for recommendation id: " + recommendationId
            );
        }

        LocalDate startedDate = discount.getStartedAt().toLocalDate();

        LocalDate beforeStart = startedDate.minusDays(7);
        LocalDate beforeEnd = startedDate.minusDays(1);

        LocalDate afterStart = startedDate;
        LocalDate afterEnd = startedDate.plusDays(7);

        List<SalesMetric> beforeMetrics = salesMetricRepository
                .findByTenantIdAndMarketplaceProductIdAndMetricDateBetween(
                        discount.getTenantId(),
                        discount.getMarketplaceProductId(),
                        beforeStart,
                        beforeEnd
                );

        List<SalesMetric> afterMetrics = salesMetricRepository
                .findByTenantIdAndMarketplaceProductIdAndMetricDateBetween(
                        discount.getTenantId(),
                        discount.getMarketplaceProductId(),
                        afterStart,
                        afterEnd
                );

        int beforeViews = totalViews(beforeMetrics);
        int beforeOrders = totalOrders(beforeMetrics);
        BigDecimal beforeRevenue = totalRevenue(beforeMetrics);

        int afterViews = totalViews(afterMetrics);
        int afterOrders = totalOrders(afterMetrics);
        BigDecimal afterRevenue = totalRevenue(afterMetrics);

        BeforeAfterPerformanceResponse response =
                new BeforeAfterPerformanceResponse();

        response.setRecommendationId(recommendationId);
        response.setTenantId(discount.getTenantId());
        response.setMarketplaceProductId(discount.getMarketplaceProductId());

        response.setBeforeViews(beforeViews);
        response.setBeforeOrders(beforeOrders);
        response.setBeforeRevenue(beforeRevenue);

        response.setAfterViews(afterViews);
        response.setAfterOrders(afterOrders);
        response.setAfterRevenue(afterRevenue);

        response.setOrderImprovement(afterOrders - beforeOrders);
        response.setRevenueImprovement(afterRevenue.subtract(beforeRevenue));

        if (afterOrders > beforeOrders) {
            response.setResult("SUCCESS: Orders improved after applying recommendation.");
        } else if (afterOrders == beforeOrders) {
            response.setResult("NEUTRAL: No major change after applying recommendation.");
        } else {
            response.setResult("FAILED: Orders decreased after applying recommendation.");
        }

        return response;
    }

    private int totalViews(List<SalesMetric> metrics) {
        int total = 0;

        for (SalesMetric metric : metrics) {
            total += metric.getViews() == null ? 0 : metric.getViews();
        }

        return total;
    }

    private int totalOrders(List<SalesMetric> metrics) {
        int total = 0;

        for (SalesMetric metric : metrics) {
            total += metric.getOrders() == null ? 0 : metric.getOrders();
        }

        return total;
    }

    private BigDecimal totalRevenue(List<SalesMetric> metrics) {
        BigDecimal total = BigDecimal.ZERO;

        for (SalesMetric metric : metrics) {
            if (metric.getRevenue() != null) {
                total = total.add(metric.getRevenue());
            }
        }

        return total;
    }
}