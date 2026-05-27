package com.pricepilot.repository;

import com.pricepilot.entity.MasterProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface MasterProductRepository extends JpaRepository<MasterProduct, Long> {
    List<MasterProduct> findByTenantId(Long tenantId);

    @Query("SELECT mp FROM MasterProduct mp WHERE mp.tenant.id = :tenantId AND mp.healthScore < :threshold")
    List<MasterProduct> findCriticalProducts(Long tenantId, int threshold);

    long countByTenantId(Long tenantId);
}
