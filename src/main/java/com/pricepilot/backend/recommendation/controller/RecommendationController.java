package com.pricepilot.backend.recommendation.controller;

import com.pricepilot.backend.recommendation.dto.GenerateRecommendationFromSalesRequest;
import com.pricepilot.backend.recommendation.dto.GenerateRecommendationRequest;
import com.pricepilot.backend.recommendation.dto.RecommendationResponse;
import com.pricepilot.backend.recommendation.service.RecommendationService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import io.swagger.v3.oas.annotations.Operation;
@RestController
@RequestMapping("/api/recommendations")
@CrossOrigin(origins = "*")
public class RecommendationController {

    private final RecommendationService recommendationService;

    public RecommendationController(RecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }

    @PostMapping("/generate")
    public RecommendationResponse generateRecommendation(
            @Valid @RequestBody GenerateRecommendationRequest request
    ) {
        return recommendationService.generateRecommendation(request);
    }

    @PostMapping("/generate-from-sales")
    public RecommendationResponse generateRecommendationFromSales(
            @Valid @RequestBody GenerateRecommendationFromSalesRequest request
    ) {
        return recommendationService.generateRecommendationFromSales(request);
    }

    @GetMapping
    public List<RecommendationResponse> getRecommendationsByTenant(
            @RequestParam Long tenantId
    ) {
        return recommendationService.getRecommendationsByTenant(tenantId);
    }

    @GetMapping("/{id}")
    public RecommendationResponse getRecommendationById(
            @PathVariable Long id
    ) {
        return recommendationService.getRecommendationById(id);
    }

    @PatchMapping("/{id}/approve")
    public RecommendationResponse approveRecommendation(
            @PathVariable Long id
    ) {
        return recommendationService.approveRecommendation(id);
    }

    @PatchMapping("/{id}/reject")
    public RecommendationResponse rejectRecommendation(
            @PathVariable Long id
    ) {
        return recommendationService.rejectRecommendation(id);
    }
    @PatchMapping("/{id}/apply")
    @Operation(summary = "Apply approved recommendation")
    public RecommendationResponse applyRecommendation(@PathVariable Long id) {
        return recommendationService.applyRecommendation(id);
    }
}