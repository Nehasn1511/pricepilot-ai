package com.pricepilot.backend.pricing.controller;

import com.pricepilot.backend.pricing.dto.PriceSnapshotRequest;
import com.pricepilot.backend.pricing.dto.PriceSnapshotResponse;
import com.pricepilot.backend.pricing.service.PriceSnapshotService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/prices")
@CrossOrigin(origins = "*")
public class PriceSnapshotController {

    private final PriceSnapshotService priceSnapshotService;

    public PriceSnapshotController(PriceSnapshotService priceSnapshotService) {
        this.priceSnapshotService = priceSnapshotService;
    }

    @PostMapping("/snapshots")
    public PriceSnapshotResponse createSnapshot(@Valid @RequestBody PriceSnapshotRequest request) {
        return priceSnapshotService.createSnapshot(request);
    }

    @GetMapping("/product/{marketplaceProductId}/history")
    public List<PriceSnapshotResponse> getPriceHistory(
            @RequestParam Long tenantId,
            @PathVariable Long marketplaceProductId
    ) {
        return priceSnapshotService.getPriceHistory(tenantId, marketplaceProductId);
    }
}