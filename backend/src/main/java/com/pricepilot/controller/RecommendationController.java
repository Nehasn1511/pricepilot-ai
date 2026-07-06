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

    @GetMapping("/count")
    public ResponseEntity<Long> count() {
        return ResponseEntity.ok(recommendationRepo.count());
    }

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

        return ResponseEntity.ok(Map.of(
                "message", "Recommendations generated",
                "count", generated
        ));
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<?> approve(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {

        System.out.println("====================================");
        System.out.println("APPROVE REQUEST - ID = " + id);
        System.out.println("Total recommendations = " + recommendationRepo.count());

        Recommendation rec = recommendationRepo.findById(id).orElse(null);

        if (rec == null) {
            System.out.println("Recommendation NOT FOUND!");
            return ResponseEntity.badRequest().body(
                    Map.of("error", "Recommendation not found", "requestedId", id)
            );
        }

        rec.setStatus(Recommendation.Status.APPROVED);
        if (body != null) {
            rec.setApprovalComments(body.getOrDefault("comments", ""));
        }
        rec.setApprovedAt(LocalDateTime.now());
        recommendationRepo.save(rec);

        System.out.println("Recommendation Approved Successfully");
        System.out.println("====================================");

        return ResponseEntity.ok(rec);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOne(@PathVariable Long id) {
        System.out.println("Searching recommendation id = " + id);
        return ResponseEntity.ok(recommendationRepo.findById(id).orElse(null));
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<?> reject(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {

        Recommendation rec = recommendationRepo.findById(id).orElse(null);

        if (rec == null) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", "Recommendation not found", "requestedId", id)
            );
        }

        rec.setStatus(Recommendation.Status.REJECTED);
        if (body != null) {
            rec.setApprovalComments(body.getOrDefault("comments", ""));
        }
        rec.setApprovedAt(LocalDateTime.now());
        recommendationRepo.save(rec);

        return ResponseEntity.ok(rec);
    }

    private Long getTenantId(HttpServletRequest request) {
        String auth = request.getHeader("Authorization");
        System.out.println("AUTH HEADER = " + auth);
        if (auth == null) {
            throw new RuntimeException("Authorization header is NULL");
        }
        String token = auth.substring(7);
        Long tenantId = jwtUtil.getTenantIdFromToken(token);
        System.out.println("TENANT ID = " + tenantId);
        return tenantId;
    }
}