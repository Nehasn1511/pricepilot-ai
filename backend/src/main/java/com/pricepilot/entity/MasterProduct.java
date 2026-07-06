package com.pricepilot.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "master_products")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(exclude = {"tenant", "listings"})
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class MasterProduct {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    @JsonIgnore
    private Tenant tenant;

    @Column(nullable = false)
    private String name;

    private String brand;
    private String category;
    private String modelNumber;
    private String barcode;
    private String imageUrl;

    @Column(name = "cost_price", precision = 10, scale = 2)
    private BigDecimal costPrice;

    @Column(name = "marketplace_commission", precision = 10, scale = 2)
    private BigDecimal marketplaceCommission;

    @Column(name = "shipping_cost", precision = 10, scale = 2)
    private BigDecimal shippingCost;

    @Column(name = "packaging_cost", precision = 10, scale = 2)
    private BigDecimal packagingCost;

    @Column(name = "tax_percent", precision = 5, scale = 2)
    private BigDecimal taxPercent;

    @Column(name = "minimum_margin_percent", precision = 5, scale = 2)
    private BigDecimal minimumMarginPercent;

    @Column(name = "health_score")
    private Integer healthScore;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "masterProduct", cascade = CascadeType.ALL)
    private List<MarketplaceProduct> listings;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public BigDecimal getMinimumSafePrice() {
        BigDecimal cost       = costPrice             != null ? costPrice             : BigDecimal.ZERO;
        BigDecimal commission = marketplaceCommission != null ? marketplaceCommission : BigDecimal.ZERO;
        BigDecimal shipping   = shippingCost          != null ? shippingCost          : BigDecimal.ZERO;
        BigDecimal packaging  = packagingCost         != null ? packagingCost         : BigDecimal.ZERO;

        BigDecimal subtotal = cost.add(commission).add(shipping).add(packaging);

        if (taxPercent != null && taxPercent.compareTo(BigDecimal.ZERO) > 0) {
            subtotal = subtotal.add(
                subtotal.multiply(taxPercent).divide(BigDecimal.valueOf(100))
            );
        }

        if (minimumMarginPercent != null && minimumMarginPercent.compareTo(BigDecimal.ZERO) > 0) {
            subtotal = subtotal.add(
                cost.multiply(minimumMarginPercent).divide(BigDecimal.valueOf(100))
            );
        }

        return subtotal;
    }
}