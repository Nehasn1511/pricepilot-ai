package com.pricepilot.backend.competitor.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pricepilot.backend.competitor.dto.CompetitorPriceScrapeRequest;
import com.pricepilot.backend.competitor.dto.CompetitorPriceScrapeResponse;
import com.pricepilot.backend.competitor.dto.ScraperDebugResponse;
import com.pricepilot.backend.competitor.service.CompetitorPriceScraperService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

@RestController
@RequestMapping("/api/competitor-prices")
@Tag(name = "Competitor Price APIs", description = "Student B APIs for scraping competitor product prices")
public class CompetitorPriceController {

    private final CompetitorPriceScraperService competitorPriceScraperService;

    public CompetitorPriceController(CompetitorPriceScraperService competitorPriceScraperService) {
        this.competitorPriceScraperService = competitorPriceScraperService;
    }

    @PostMapping("/scrape")
    @Operation(summary = "Scrape competitor price from product URL")
    public CompetitorPriceScrapeResponse scrapePrice(@RequestBody CompetitorPriceScrapeRequest request) {
        return competitorPriceScraperService.scrapePrice(request);
    }

    @PostMapping("/debug")
    @Operation(summary = "Debug fetched competitor page content using direct Jsoup")
    public ScraperDebugResponse debugPage(@RequestBody CompetitorPriceScrapeRequest request) {
        return competitorPriceScraperService.debugPage(request);
    }

    @PostMapping("/debug-scraperapi")
    @Operation(summary = "Debug fetched competitor page content using ScraperAPI fallback")
    public ScraperDebugResponse debugPageUsingScraperApi(@RequestBody CompetitorPriceScrapeRequest request) {
        return competitorPriceScraperService.debugPageUsingScraperApi(request);
    }

    @GetMapping("/health")
    @Operation(summary = "Check competitor price scraper health")
    public String health() {
        return "Competitor price scraper is running";
    }
}