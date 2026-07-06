package com.pricepilot.backend.recommendation.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.pricepilot.backend.recommendation.enums.RecommendationStatus;
import com.pricepilot.backend.recommendation.enums.RecommendationType;
import com.pricepilot.backend.recommendation.enums.RiskLevel;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "recommendations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Recommendation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long tenantId;
    private Long masterProductId;
    private Long marketplaceProductId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RecommendationType recommendationType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RecommendationStatus status;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal currentPrice;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal recommendedPrice;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal minimumSafePrice;

    private Double discountPercent;
    private Integer healthScore;

    @Enumerated(EnumType.STRING)
    private RiskLevel riskLevel;

    private String expectedImpact;

    @Column(length = 2500)
    private String reason;

    private Integer durationDays;
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}