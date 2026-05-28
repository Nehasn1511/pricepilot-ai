package com.pricepilot.backend.discount.controller;

import com.pricepilot.backend.discount.dto.DiscountLifecycleResponse;
import com.pricepilot.backend.discount.service.DiscountLifecycleService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/discounts")
@CrossOrigin(origins = "*")
public class DiscountLifecycleController {

    private final DiscountLifecycleService discountLifecycleService;

    public DiscountLifecycleController(DiscountLifecycleService discountLifecycleService) {
        this.discountLifecycleService = discountLifecycleService;
    }

    @PostMapping("/apply/{recommendationId}")
    public DiscountLifecycleResponse applyRecommendation(
            @PathVariable Long recommendationId
    ) {
        return discountLifecycleService.applyRecommendation(recommendationId);
    }

    @GetMapping
    public List<DiscountLifecycleResponse> getDiscountsByTenant(
            @RequestParam Long tenantId
    ) {
        return discountLifecycleService.getDiscountsByTenant(tenantId);
    }

    @GetMapping("/product/{marketplaceProductId}")
    public List<DiscountLifecycleResponse> getDiscountsByProduct(
            @RequestParam Long tenantId,
            @PathVariable Long marketplaceProductId
    ) {
        return discountLifecycleService.getDiscountsByProduct(tenantId, marketplaceProductId);
    }
}