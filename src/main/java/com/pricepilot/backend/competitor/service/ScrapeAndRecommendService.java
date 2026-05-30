package com.pricepilot.backend.competitor.service;

import java.math.BigDecimal;

import org.springframework.stereotype.Service;

import com.pricepilot.backend.competitor.dto.CompetitorPriceScrapeRequest;
import com.pricepilot.backend.competitor.dto.CompetitorPriceScrapeResponse;
import com.pricepilot.backend.competitor.dto.ScrapeAndRecommendRequest;
import com.pricepilot.backend.recommendation.dto.GenerateRecommendationFromSalesRequest;
import com.pricepilot.backend.recommendation.dto.RecommendationResponse;
import com.pricepilot.backend.recommendation.service.RecommendationService;

@Service
public class ScrapeAndRecommendService {

    private final CompetitorPriceScraperService competitorPriceScraperService;
    private final RecommendationService recommendationService;

    public ScrapeAndRecommendService(
            CompetitorPriceScraperService competitorPriceScraperService,
            RecommendationService recommendationService
    ) {
        this.competitorPriceScraperService = competitorPriceScraperService;
        this.recommendationService = recommendationService;
    }

    public RecommendationResponse scrapePriceAndGenerateRecommendation(ScrapeAndRecommendRequest request) {

        CompetitorPriceScrapeRequest scrapeRequest = new CompetitorPriceScrapeRequest();
        scrapeRequest.setTenantId(request.getTenantId());
        scrapeRequest.setMarketplaceProductId(request.getMarketplaceProductId());
        scrapeRequest.setMarketplaceName(request.getMarketplaceName());
        scrapeRequest.setProductUrl(request.getProductUrl());

        CompetitorPriceScrapeResponse scrapeResponse = competitorPriceScraperService.scrapePrice(scrapeRequest);

        if (!"SUCCESS".equalsIgnoreCase(scrapeResponse.getStatus())) {
            throw new RuntimeException("Competitor price scraping failed: " + scrapeResponse.getMessage());
        }

        GenerateRecommendationFromSalesRequest recommendationRequest = new GenerateRecommendationFromSalesRequest();

        recommendationRequest.setTenantId(request.getTenantId());
        recommendationRequest.setMarketplaceProductId(request.getMarketplaceProductId());

        recommendationRequest.setCurrentPrice(toBigDecimal(request.getCurrentPrice()));

        // IMPORTANT: competitor price comes from scraper
        recommendationRequest.setCompetitorPrice(toBigDecimal(scrapeResponse.getCompetitorPrice()));

        recommendationRequest.setCostPrice(toBigDecimal(request.getCostPrice()));
        recommendationRequest.setShippingCost(toBigDecimal(request.getShippingCost()));
        recommendationRequest.setPackagingCost(toBigDecimal(request.getPackagingCost()));
        recommendationRequest.setMinimumProfit(toBigDecimal(request.getMinimumProfit()));

        /*
         * Do not set these here because your existing
         * GenerateRecommendationFromSalesRequest does not have matching setters:
         *
         * setCommission(...)
         * setTax(...)
         * setStockAvailable(...)
         * setReturnCount(...)
         *
         * Your generate-from-sales API probably calculates sales-related values
         * from SalesMetric records already saved in DB.
         */

        return recommendationService.generateRecommendationFromSales(recommendationRequest);
    }

    private BigDecimal toBigDecimal(Double value) {
        if (value == null) {
            return BigDecimal.ZERO;
        }

        return BigDecimal.valueOf(value);
    }
}