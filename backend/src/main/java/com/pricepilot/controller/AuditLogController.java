package com.pricepilot.controller;

import com.pricepilot.entity.AuditLog;
import com.pricepilot.repository.AuditLogRepository;
import com.pricepilot.security.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/audit-log")
@RequiredArgsConstructor
public class AuditLogController {

    private final AuditLogRepository auditLogRepo;
    private final JwtUtil jwtUtil;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('TENANT_ADMIN', 'PRICING_MANAGER')")
    public ResponseEntity<List<AuditLog>> getAllLogs(HttpServletRequest request) {
        Long tenantId = getTenantId(request);
        return ResponseEntity.ok(auditLogRepo.findByTenantIdOrderByCreatedAtDesc(tenantId));
    }

    @GetMapping("/filter")
    @PreAuthorize("hasAnyAuthority('TENANT_ADMIN', 'PRICING_MANAGER')")
    public ResponseEntity<List<AuditLog>> filterLogs(
            HttpServletRequest request,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String performedBy) {
        Long tenantId = getTenantId(request);

        if (action != null && !action.isBlank()) {
            return ResponseEntity.ok(
                auditLogRepo.findByTenantIdAndActionOrderByCreatedAtDesc(tenantId, action));
        }

        if (performedBy != null && !performedBy.isBlank()) {
            return ResponseEntity.ok(
                auditLogRepo.findByTenantIdAndPerformedByOrderByCreatedAtDesc(tenantId, performedBy));
        }

        return ResponseEntity.ok(auditLogRepo.findByTenantIdOrderByCreatedAtDesc(tenantId));
    }

    private Long getTenantId(HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        return jwtUtil.getTenantIdFromToken(token);
    }
}