package com.pricepilot.backend.analytics.controller;

import com.pricepilot.backend.analytics.dto.BeforeAfterPerformanceResponse;
import com.pricepilot.backend.analytics.dto.RecommendationAnalyticsStatsResponse;
import com.pricepilot.backend.analytics.service.RecommendationAnalyticsService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analytics")

@Tag(name = "Recommendation Analytics", description = "Analytics APIs for pricing recommendations")
public class RecommendationAnalyticsController {

    private final RecommendationAnalyticsService recommendationAnalyticsService;

    public RecommendationAnalyticsController(
            RecommendationAnalyticsService recommendationAnalyticsService
    ) {
        this.recommendationAnalyticsService = recommendationAnalyticsService;
    }

    @GetMapping("/recommendations/stats")
    @Operation(summary = "Get recommendation analytics stats by tenant")
    public RecommendationAnalyticsStatsResponse getRecommendationStats(
            @RequestParam Long tenantId
    ) {
        return recommendationAnalyticsService.getRecommendationStats(tenantId);
    }

    @GetMapping("/recommendations/{recommendationId}/performance")
    @Operation(summary = "Get before and after performance for a recommendation")
    public BeforeAfterPerformanceResponse getBeforeAfterPerformance(
            @PathVariable Long recommendationId
    ) {
        return recommendationAnalyticsService.getBeforeAfterPerformance(recommendationId);
    }
}