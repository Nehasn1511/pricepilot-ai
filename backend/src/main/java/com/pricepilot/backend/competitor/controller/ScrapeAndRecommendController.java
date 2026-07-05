package com.pricepilot.backend.competitor.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.pricepilot.backend.competitor.dto.ScrapeAndRecommendRequest;
import com.pricepilot.backend.competitor.service.ScrapeAndRecommendService;
import com.pricepilot.backend.recommendation.dto.RecommendationResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@Tag(name = "Scrape and Recommend APIs", description = "Scrapes competitor price and generates recommendation")
public class ScrapeAndRecommendController {

    private final ScrapeAndRecommendService scrapeAndRecommendService;

    public ScrapeAndRecommendController(ScrapeAndRecommendService scrapeAndRecommendService) {
        this.scrapeAndRecommendService = scrapeAndRecommendService;
    }

    @PostMapping("/api/recommendations/generate-with-scraped-price")
    @Operation(summary = "Scrape competitor price and generate recommendation")
    public RecommendationResponse generateWithScrapedPrice(@RequestBody ScrapeAndRecommendRequest request) {
        return scrapeAndRecommendService.scrapePriceAndGenerateRecommendation(request);
    }
}