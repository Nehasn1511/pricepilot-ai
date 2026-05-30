package com.pricepilot.repository;

import com.pricepilot.entity.MarketplaceProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface MarketplaceProductRepository extends JpaRepository<MarketplaceProduct, Long> {
    List<MarketplaceProduct> findByTenantId(Long tenantId);
    List<MarketplaceProduct> findByMasterProductId(Long masterProductId);

    @Query("SELECT mp FROM MarketplaceProduct mp WHERE mp.tenant.id = :tenantId AND mp.ordersLast7Days = 0 AND mp.viewsLast7Days > 100")
    List<MarketplaceProduct> findHighViewNoSaleProducts(Long tenantId);

    @Query("SELECT mp FROM MarketplaceProduct mp WHERE mp.tenant.id = :tenantId AND mp.ordersLast7Days < 5")
    List<MarketplaceProduct> findLowSaleProducts(Long tenantId);

    long countByTenantId(Long tenantId);
}
