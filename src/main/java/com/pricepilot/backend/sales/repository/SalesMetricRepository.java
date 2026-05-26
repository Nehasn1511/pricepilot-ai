package com.pricepilot.backend.sales.repository;

import com.pricepilot.backend.sales.entity.SalesMetric;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface SalesMetricRepository extends JpaRepository<SalesMetric, Long> {

    List<SalesMetric> findByTenantIdAndMarketplaceProductIdOrderByMetricDateDesc(
            Long tenantId,
            Long marketplaceProductId
    );

    List<SalesMetric> findByTenantIdAndMarketplaceProductIdAndMetricDateBetweenOrderByMetricDateDesc(
            Long tenantId,
            Long marketplaceProductId,
            LocalDate startDate,
            LocalDate endDate
    );

    List<SalesMetric> findByTenantId(Long tenantId);
}