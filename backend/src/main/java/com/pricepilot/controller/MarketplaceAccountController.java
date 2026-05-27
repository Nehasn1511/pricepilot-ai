package com.pricepilot.controller;

import com.pricepilot.entity.MarketplaceAccount;
import com.pricepilot.entity.Tenant;
import com.pricepilot.repository.MarketplaceAccountRepository;
import com.pricepilot.repository.TenantRepository;
import com.pricepilot.security.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/marketplace-accounts")
@RequiredArgsConstructor
public class MarketplaceAccountController {

    private final MarketplaceAccountRepository accountRepo;
    private final TenantRepository tenantRepo;
    private final JwtUtil jwtUtil;

    @GetMapping
    public ResponseEntity<List<MarketplaceAccount>> getAllAccounts(HttpServletRequest request) {
        Long tenantId = getTenantId(request);
        return ResponseEntity.ok(accountRepo.findByTenantId(tenantId));
    }

    @GetMapping("/active")
    public ResponseEntity<List<MarketplaceAccount>> getActiveAccounts(HttpServletRequest request) {
        Long tenantId = getTenantId(request);
        return ResponseEntity.ok(accountRepo.findByTenantIdAndIsActiveTrue(tenantId));
    }

    @PostMapping
    public ResponseEntity<MarketplaceAccount> createAccount(
            @RequestBody MarketplaceAccount account, HttpServletRequest request) {
        Long tenantId = getTenantId(request);
        Tenant tenant = tenantRepo.findById(tenantId).orElseThrow();
        account.setTenant(tenant);
        account.setIsActive(true);
        return ResponseEntity.ok(accountRepo.save(account));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MarketplaceAccount> updateAccount(
            @PathVariable Long id, @RequestBody MarketplaceAccount updated, HttpServletRequest request) {
        Long tenantId = getTenantId(request);
        return accountRepo.findById(id)
                .filter(a -> a.getTenant().getId().equals(tenantId))
                .map(existing -> {
                    if (updated.getAccountName() != null) existing.setAccountName(updated.getAccountName());
                    if (updated.getSellerId() != null) existing.setSellerId(updated.getSellerId());
                    if (updated.getApiKey() != null) existing.setApiKey(updated.getApiKey());
                    if (updated.getIsActive() != null) existing.setIsActive(updated.getIsActive());
                    return ResponseEntity.ok(accountRepo.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteAccount(
            @PathVariable Long id, HttpServletRequest request) {
        Long tenantId = getTenantId(request);
        return accountRepo.findById(id)
                .filter(a -> a.getTenant().getId().equals(tenantId))
                .map(a -> {
                    accountRepo.delete(a);
                    return ResponseEntity.ok(Map.of("message", "Marketplace account removed successfully"));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<Map<String, Object>> toggleAccount(
            @PathVariable Long id, HttpServletRequest request) {
        Long tenantId = getTenantId(request);
        return accountRepo.findById(id)
                .filter(a -> a.getTenant().getId().equals(tenantId))
                .map(a -> {
                    a.setIsActive(!a.getIsActive());
                    accountRepo.save(a);
                    Map<String, Object> response = new HashMap<>();
                    response.put("message", "Account status updated");
                    response.put("isActive", a.getIsActive());
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    private Long getTenantId(HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        return jwtUtil.getTenantIdFromToken(token);
    }
}