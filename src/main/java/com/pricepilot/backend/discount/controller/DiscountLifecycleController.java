package com.pricepilot.backend.discount.controller;

import com.pricepilot.backend.discount.dto.DiscountLifecycleResponse;
import com.pricepilot.backend.discount.service.DiscountLifecycleService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/discounts")
@CrossOrigin(origins = "*")
@Tag(name = "Discount Lifecycle APIs", description = "Student B APIs for discount lifecycle tracking")
public class DiscountLifecycleController {

    private final DiscountLifecycleService discountLifecycleService;

    public DiscountLifecycleController(DiscountLifecycleService discountLifecycleService) {
        this.discountLifecycleService = discountLifecycleService;
    }

    @PostMapping("/apply/{recommendationId}")
    @Operation(summary = "Apply approved recommendation and create discount lifecycle")
    public DiscountLifecycleResponse applyRecommendation(
            @PathVariable Long recommendationId
    ) {
        return discountLifecycleService.applyRecommendation(recommendationId);
    }

    @GetMapping
    @Operation(summary = "Get all discount lifecycle records by tenant")
    public List<DiscountLifecycleResponse> getDiscountsByTenant(
            @RequestParam Long tenantId
    ) {
        return discountLifecycleService.getDiscountsByTenant(tenantId);
    }

    @GetMapping("/product/{marketplaceProductId}")
    @Operation(summary = "Get discount lifecycle records by product")
    public List<DiscountLifecycleResponse> getDiscountsByProduct(
            @RequestParam Long tenantId,
            @PathVariable Long marketplaceProductId
    ) {
        return discountLifecycleService.getDiscountsByProduct(tenantId, marketplaceProductId);
    }

    @GetMapping("/recommendation/{recommendationId}")
    @Operation(summary = "Get discount lifecycle record by recommendation id")
    public DiscountLifecycleResponse getDiscountByRecommendationId(
            @PathVariable Long recommendationId
    ) {
        return discountLifecycleService.getDiscountByRecommendationId(recommendationId);
    }
}