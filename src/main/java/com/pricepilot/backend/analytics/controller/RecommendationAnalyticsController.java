package com.pricepilot.backend.analytics.controller;

import com.pricepilot.backend.analytics.dto.BeforeAfterPerformanceResponse;
import com.pricepilot.backend.analytics.service.RecommendationAnalyticsService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "*")
public class RecommendationAnalyticsController {

    private final RecommendationAnalyticsService recommendationAnalyticsService;

    public RecommendationAnalyticsController(
            RecommendationAnalyticsService recommendationAnalyticsService
    ) {
        this.recommendationAnalyticsService = recommendationAnalyticsService;
    }

    @GetMapping("/recommendations/{recommendationId}/performance")
    public BeforeAfterPerformanceResponse getBeforeAfterPerformance(
            @PathVariable Long recommendationId
    ) {
        return recommendationAnalyticsService.getBeforeAfterPerformance(recommendationId);
    }
}