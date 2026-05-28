package com.pricepilot.backend.discount.service;

import com.pricepilot.backend.discount.dto.DiscountLifecycleResponse;
import com.pricepilot.backend.discount.entity.DiscountLifecycle;
import com.pricepilot.backend.discount.enums.DiscountStatus;
import com.pricepilot.backend.discount.repository.DiscountLifecycleRepository;
import com.pricepilot.backend.recommendation.entity.Recommendation;
import com.pricepilot.backend.recommendation.enums.RecommendationStatus;
import com.pricepilot.backend.recommendation.repository.RecommendationRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class DiscountLifecycleService {

    private final DiscountLifecycleRepository discountLifecycleRepository;
    private final RecommendationRepository recommendationRepository;

    public DiscountLifecycleService(
            DiscountLifecycleRepository discountLifecycleRepository,
            RecommendationRepository recommendationRepository
    ) {
        this.discountLifecycleRepository = discountLifecycleRepository;
        this.recommendationRepository = recommendationRepository;
    }

    public DiscountLifecycleResponse applyRecommendation(Long recommendationId) {

        Recommendation recommendation = recommendationRepository.findById(recommendationId)
                .orElseThrow(() -> new RuntimeException("Recommendation not found with id: " + recommendationId));

        if (recommendation.getStatus() != RecommendationStatus.APPROVED) {
            throw new RuntimeException("Only APPROVED recommendations can be applied.");
        }

        DiscountLifecycle existing = discountLifecycleRepository.findByRecommendationId(recommendationId);

        if (existing != null) {
            throw new RuntimeException("This recommendation is already applied.");
        }

        LocalDateTime now = LocalDateTime.now();

        DiscountLifecycle lifecycle = new DiscountLifecycle();

        lifecycle.setTenantId(recommendation.getTenantId());
        lifecycle.setRecommendationId(recommendation.getId());
        lifecycle.setMasterProductId(recommendation.getMasterProductId());
        lifecycle.setMarketplaceProductId(recommendation.getMarketplaceProductId());
        lifecycle.setOldPrice(recommendation.getCurrentPrice());
        lifecycle.setNewPrice(recommendation.getRecommendedPrice());
        lifecycle.setDurationDays(recommendation.getDurationDays());
        lifecycle.setStartedAt(now);
        lifecycle.setExpiresAt(now.plusDays(recommendation.getDurationDays()));
        lifecycle.setStatus(DiscountStatus.ACTIVE);
        lifecycle.setCreatedAt(now);
        lifecycle.setUpdatedAt(now);

        DiscountLifecycle saved = discountLifecycleRepository.save(lifecycle);

        recommendation.setStatus(RecommendationStatus.APPLIED);
        recommendation.setUpdatedAt(now);
        recommendationRepository.save(recommendation);

        return mapToResponse(saved);
    }

    public List<DiscountLifecycleResponse> getDiscountsByTenant(Long tenantId) {
        return discountLifecycleRepository.findByTenantId(tenantId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<DiscountLifecycleResponse> getDiscountsByProduct(Long tenantId, Long marketplaceProductId) {
        return discountLifecycleRepository.findByTenantIdAndMarketplaceProductId(tenantId, marketplaceProductId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public void expireCompletedDiscounts() {
        List<DiscountLifecycle> expiredDiscounts = discountLifecycleRepository
                .findByStatusAndExpiresAtBefore(DiscountStatus.ACTIVE, LocalDateTime.now());

        for (DiscountLifecycle discount : expiredDiscounts) {
            discount.setStatus(DiscountStatus.EXPIRED);
            discount.setUpdatedAt(LocalDateTime.now());
            discountLifecycleRepository.save(discount);

            Recommendation recommendation = recommendationRepository.findById(discount.getRecommendationId())
                    .orElse(null);

            if (recommendation != null) {
                recommendation.setStatus(RecommendationStatus.EXPIRED);
                recommendation.setUpdatedAt(LocalDateTime.now());
                recommendationRepository.save(recommendation);
            }
        }
    }

    private DiscountLifecycleResponse mapToResponse(DiscountLifecycle lifecycle) {
        DiscountLifecycleResponse response = new DiscountLifecycleResponse();

        response.setId(lifecycle.getId());
        response.setTenantId(lifecycle.getTenantId());
        response.setRecommendationId(lifecycle.getRecommendationId());
        response.setMasterProductId(lifecycle.getMasterProductId());
        response.setMarketplaceProductId(lifecycle.getMarketplaceProductId());
        response.setOldPrice(lifecycle.getOldPrice());
        response.setNewPrice(lifecycle.getNewPrice());
        response.setDurationDays(lifecycle.getDurationDays());
        response.setStartedAt(lifecycle.getStartedAt());
        response.setExpiresAt(lifecycle.getExpiresAt());
        response.setStatus(lifecycle.getStatus().name());

        return response;
    }
}