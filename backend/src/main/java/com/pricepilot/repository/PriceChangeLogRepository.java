package com.pricepilot.repository;

import com.pricepilot.entity.PriceChangeLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PriceChangeLogRepository extends JpaRepository<PriceChangeLog, Long> {
    List<PriceChangeLog> findByMarketplaceProductIdOrderByCreatedAtDesc(Long marketplaceProductId);
    List<PriceChangeLog> findByTenantIdOrderByCreatedAtDesc(Long tenantId);
}