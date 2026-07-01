package com.pricepilot.backend.pricing.repository;

import com.pricepilot.backend.pricing.entity.PriceSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PriceSnapshotRepository extends JpaRepository<PriceSnapshot, Long> {

    List<PriceSnapshot> findByTenantIdAndMarketplaceProductIdOrderByCapturedAtDesc(
            Long tenantId,
            Long marketplaceProductId
    );
}