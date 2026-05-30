package com.pricepilot.backend.discount.repository;

import com.pricepilot.backend.discount.entity.DiscountLifecycle;
import com.pricepilot.backend.discount.enums.DiscountStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface DiscountLifecycleRepository extends JpaRepository<DiscountLifecycle, Long> {

    List<DiscountLifecycle> findByStatusAndExpiresAtBefore(
            DiscountStatus status,
            LocalDateTime currentTime
    );

    List<DiscountLifecycle> findByTenantId(Long tenantId);

    List<DiscountLifecycle> findByTenantIdAndMarketplaceProductId(
            Long tenantId,
            Long marketplaceProductId
    );

    DiscountLifecycle findByRecommendationId(Long recommendationId);
}