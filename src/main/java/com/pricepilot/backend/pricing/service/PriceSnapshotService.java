package com.pricepilot.backend.pricing.service;

import com.pricepilot.backend.pricing.dto.PriceSnapshotRequest;
import com.pricepilot.backend.pricing.dto.PriceSnapshotResponse;
import com.pricepilot.backend.pricing.entity.PriceSnapshot;
import com.pricepilot.backend.pricing.repository.PriceSnapshotRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PriceSnapshotService {

    private final PriceSnapshotRepository priceSnapshotRepository;

    public PriceSnapshotService(PriceSnapshotRepository priceSnapshotRepository) {
        this.priceSnapshotRepository = priceSnapshotRepository;
    }

    public PriceSnapshotResponse createSnapshot(PriceSnapshotRequest request) {
        PriceSnapshot snapshot = new PriceSnapshot();

        snapshot.setTenantId(request.getTenantId());
        snapshot.setMasterProductId(request.getMasterProductId());
        snapshot.setMarketplaceProductId(request.getMarketplaceProductId());
        snapshot.setPlatform(request.getPlatform());
        snapshot.setPrice(request.getPrice());
        snapshot.setCapturedAt(LocalDateTime.now());
        snapshot.setCreatedAt(LocalDateTime.now());

        PriceSnapshot saved = priceSnapshotRepository.save(snapshot);

        return mapToResponse(saved);
    }

    public List<PriceSnapshotResponse> getPriceHistory(Long tenantId, Long marketplaceProductId) {
        return priceSnapshotRepository
                .findByTenantIdAndMarketplaceProductIdOrderByCapturedAtDesc(tenantId, marketplaceProductId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private PriceSnapshotResponse mapToResponse(PriceSnapshot snapshot) {
        PriceSnapshotResponse response = new PriceSnapshotResponse();

        response.setId(snapshot.getId());
        response.setTenantId(snapshot.getTenantId());
        response.setMasterProductId(snapshot.getMasterProductId());
        response.setMarketplaceProductId(snapshot.getMarketplaceProductId());
        response.setPlatform(snapshot.getPlatform());
        response.setPrice(snapshot.getPrice());
        response.setCapturedAt(snapshot.getCapturedAt());

        return response;
    }
}