package com.pricepilot.repository;

import com.pricepilot.entity.Recommendation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RecommendationRepository extends JpaRepository<Recommendation, Long> {

    List<Recommendation> findByTenant_IdOrderByCreatedAtDesc(Long tenantId);

    List<Recommendation> findByTenant_IdAndStatus(
            Long tenantId,
            Recommendation.Status status
    );

    long countByTenant_IdAndStatus(
            Long tenantId,
            Recommendation.Status status
    );
}