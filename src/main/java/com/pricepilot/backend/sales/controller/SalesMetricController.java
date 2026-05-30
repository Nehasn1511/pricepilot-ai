package com.pricepilot.backend.sales.controller;

import com.pricepilot.backend.sales.dto.SalesMetricRequest;
import com.pricepilot.backend.sales.dto.SalesMetricResponse;
import com.pricepilot.backend.sales.dto.SalesSummaryResponse;
import com.pricepilot.backend.sales.service.SalesMetricService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sales")
@CrossOrigin(origins = "*")
public class SalesMetricController {

    private final SalesMetricService salesMetricService;

    public SalesMetricController(SalesMetricService salesMetricService) {
        this.salesMetricService = salesMetricService;
    }

    @PostMapping
    public SalesMetricResponse createSalesMetric(@Valid @RequestBody SalesMetricRequest request) {
        return salesMetricService.createSalesMetric(request);
    }

    @GetMapping("/product/{marketplaceProductId}")
    public List<SalesMetricResponse> getProductSales(
            @RequestParam Long tenantId,
            @PathVariable Long marketplaceProductId
    ) {
        return salesMetricService.getProductSales(tenantId, marketplaceProductId);
    }

    @GetMapping("/product/{marketplaceProductId}/last-7-days")
    public List<SalesMetricResponse> getLast7DaysSales(
            @RequestParam Long tenantId,
            @PathVariable Long marketplaceProductId
    ) {
        return salesMetricService.getLast7DaysSales(tenantId, marketplaceProductId);
    }

    @GetMapping("/product/{marketplaceProductId}/summary")
    public SalesSummaryResponse getLast7DaysSummary(
            @RequestParam Long tenantId,
            @PathVariable Long marketplaceProductId
    ) {
        return salesMetricService.getLast7DaysSummary(tenantId, marketplaceProductId);
    }
}