package com.pricepilot.repository;

import com.pricepilot.entity.MarketplaceAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MarketplaceAccountRepository extends JpaRepository<MarketplaceAccount, Long> {
    List<MarketplaceAccount> findByTenantId(Long tenantId);
    List<MarketplaceAccount> findByTenantIdAndIsActiveTrue(Long tenantId);
}