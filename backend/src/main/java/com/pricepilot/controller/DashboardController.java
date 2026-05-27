package com.pricepilot.controller;

import com.pricepilot.repository.*;
import com.pricepilot.entity.Recommendation;
import com.pricepilot.security.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final MasterProductRepository masterProductRepo;
    private final MarketplaceProductRepository marketplaceProductRepo;
    private final RecommendationRepository recommendationRepo;
    private final JwtUtil jwtUtil;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats(HttpServletRequest request) {
        Long tenantId = getTenantId(request);

        long totalProducts = masterProductRepo.countByTenantId(tenantId);
        long totalListings = marketplaceProductRepo.countByTenantId(tenantId);
        long lowSaleProducts = marketplaceProductRepo.findLowSaleProducts(tenantId).size();
        long noSaleProducts = marketplaceProductRepo.findHighViewNoSaleProducts(tenantId).size();
        long pendingApprovals = recommendationRepo.countByTenantIdAndStatus(tenantId, Recommendation.Status.PENDING);
        long activeDiscounts = recommendationRepo.countByTenantIdAndStatus(tenantId, Recommendation.Status.APPLIED);

        Map<String, Object> stats = Map.of(
                "totalProducts", totalProducts,
                "totalListings", totalListings,
                "lowSaleProducts", lowSaleProducts,
                "noSaleProducts", noSaleProducts,
                "pendingApprovals", pendingApprovals,
                "activeDiscounts", activeDiscounts
        );

        return ResponseEntity.ok(stats);
    }

    private Long getTenantId(HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        return jwtUtil.getTenantIdFromToken(token);
    }
}
