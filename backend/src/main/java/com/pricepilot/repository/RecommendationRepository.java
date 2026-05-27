package com.pricepilot.repository;

import com.pricepilot.entity.Recommendation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RecommendationRepository extends JpaRepository<Recommendation, Long> {
    List<Recommendation> findByTenantIdOrderByCreatedAtDesc(Long tenantId);
    List<Recommendation> findByTenantIdAndStatus(Long tenantId, Recommendation.Status status);
    long countByTenantIdAndStatus(Long tenantId, Recommendation.Status status);
}
