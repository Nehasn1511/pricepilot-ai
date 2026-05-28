package com.pricepilot.backend.analytics.service;

import com.pricepilot.backend.analytics.dto.BeforeAfterPerformanceResponse;
import com.pricepilot.backend.discount.entity.DiscountLifecycle;
import com.pricepilot.backend.discount.repository.DiscountLifecycleRepository;
import com.pricepilot.backend.sales.entity.SalesMetric;
import com.pricepilot.backend.sales.repository.SalesMetricRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class RecommendationAnalyticsService {

    private final DiscountLifecycleRepository discountLifecycleRepository;
    private final SalesMetricRepository salesMetricRepository;

    public RecommendationAnalyticsService(
            DiscountLifecycleRepository discountLifecycleRepository,
            SalesMetricRepository salesMetricRepository
    ) {
        this.discountLifecycleRepository = discountLifecycleRepository;
        this.salesMetricRepository = salesMetricRepository;
    }

    public BeforeAfterPerformanceResponse getBeforeAfterPerformance(Long recommendationId) {

        DiscountLifecycle discount = discountLifecycleRepository.findByRecommendationId(recommendationId);

        if (discount == null) {
            throw new RuntimeException("No discount lifecycle found for recommendation id: " + recommendationId);
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

        BeforeAfterPerformanceResponse response = new BeforeAfterPerformanceResponse();

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