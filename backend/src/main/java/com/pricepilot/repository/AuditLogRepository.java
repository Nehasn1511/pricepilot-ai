package com.pricepilot.repository;

import com.pricepilot.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findByTenantIdOrderByCreatedAtDesc(Long tenantId);
    List<AuditLog> findByTenantIdAndActionOrderByCreatedAtDesc(Long tenantId, String action);
    List<AuditLog> findByTenantIdAndPerformedByOrderByCreatedAtDesc(Long tenantId, String performedBy);
}