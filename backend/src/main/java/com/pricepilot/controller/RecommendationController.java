package com.pricepilot.controller;

import com.pricepilot.entity.*;
import com.pricepilot.repository.*;
import com.pricepilot.security.JwtUtil;
import com.pricepilot.service.PricingEngineService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
public class RecommendationController {

    private final RecommendationRepository recommendationRepo;
    private final MasterProductRepository masterProductRepo;
    private final MarketplaceProductRepository marketplaceProductRepo;
    private final PricingEngineService pricingEngine;
    private final JwtUtil jwtUtil;

    @GetMapping
    public ResponseEntity<List<Recommendation>> getAll(HttpServletRequest request) {
        Long tenantId = getTenantId(request);
        return ResponseEntity.ok(
                recommendationRepo.findByTenant_IdOrderByCreatedAtDesc(tenantId)
        );
    }

    @GetMapping("/pending")
    public ResponseEntity<List<Recommendation>> getPending(HttpServletRequest request) {
        Long tenantId = getTenantId(request);
        return ResponseEntity.ok(
                recommendationRepo.findByTenant_IdAndStatus(
                        tenantId,
                        Recommendation.Status.PENDING
                )
        );
    }

    @PostMapping("/generate/{marketplaceProductId}")
    public ResponseEntity<Recommendation> generateRecommendation(
            @PathVariable Long marketplaceProductId) {

        MarketplaceProduct listing =
                marketplaceProductRepo.findById(marketplaceProductId).orElseThrow();

        MasterProduct product = listing.getMasterProduct();

        Recommendation recommendation =
                pricingEngine.generateRecommendation(product, listing);

        recommendation = recommendationRepo.save(recommendation);

        return ResponseEntity.ok(recommendation);
    }

    @PostMapping("/generate-all")
    public ResponseEntity<Map<String, Object>> generateAllRecommendations(
            HttpServletRequest request) {

        System.out.println(">>> GENERATE-ALL API REACHED <<<");

        Long tenantId = getTenantId(request);

        List<MarketplaceProduct> lowSaleProducts =
                marketplaceProductRepo.findLowSaleProducts(tenantId);

        System.out.println("Tenant ID = " + tenantId);
        System.out.println("Low Sale Products Found = " + lowSaleProducts.size());

        int generated = 0;

        for (MarketplaceProduct listing : lowSaleProducts) {

            MasterProduct product = listing.getMasterProduct();

            if (product != null && product.getCostPrice() != null) {

                Recommendation rec =
                        pricingEngine.generateRecommendation(product, listing);

                System.out.println("Saving recommendation for: " + product.getName());

                Recommendation saved = recommendationRepo.saveAndFlush(rec);

                System.out.println("Saved recommendation id = " + saved.getId());

                generated++;
            }
        }

        return ResponseEntity.ok(
                Map.of(
                        "message", "Recommendations generated",
                        "count", generated
                )
        );
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<Recommendation> approve(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        Recommendation rec = recommendationRepo.findById(id).orElseThrow();

        rec.setStatus(Recommendation.Status.APPROVED);
        rec.setApprovalComments(body.getOrDefault("comments", ""));
        rec.setApprovedAt(LocalDateTime.now());

        return ResponseEntity.ok(recommendationRepo.save(rec));
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<Recommendation> reject(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        Recommendation rec = recommendationRepo.findById(id).orElseThrow();

        rec.setStatus(Recommendation.Status.REJECTED);
        rec.setApprovalComments(body.getOrDefault("comments", ""));
        rec.setApprovedAt(LocalDateTime.now());

        return ResponseEntity.ok(recommendationRepo.save(rec));
    }

    private Long getTenantId(HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        return jwtUtil.getTenantIdFromToken(token);
    }
}