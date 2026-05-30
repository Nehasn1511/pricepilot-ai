package com.pricepilot.backend.recommendation.repository;

import com.pricepilot.backend.recommendation.entity.Recommendation;
import com.pricepilot.backend.recommendation.enums.RecommendationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RecommendationRepository extends JpaRepository<Recommendation, Long> {

    List<Recommendation> findByTenantId(Long tenantId);

    List<Recommendation> findByTenantIdAndStatus(Long tenantId, RecommendationStatus status);
}