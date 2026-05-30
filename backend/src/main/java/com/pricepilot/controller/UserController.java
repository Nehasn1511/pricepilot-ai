package com.pricepilot.controller;

import com.pricepilot.entity.Tenant;
import com.pricepilot.entity.User;
import com.pricepilot.repository.TenantRepository;
import com.pricepilot.repository.UserRepository;
import com.pricepilot.security.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepo;
    private final TenantRepository tenantRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('TENANT_ADMIN', 'PRICING_MANAGER')")
    public ResponseEntity<List<User>> getAllUsers(HttpServletRequest request) {
        Long tenantId = getTenantId(request);
        return ResponseEntity.ok(userRepo.findByTenantId(tenantId));
    }

    @PostMapping("/invite")
    @PreAuthorize("hasAuthority('TENANT_ADMIN')")
    public ResponseEntity<Map<String, Object>> inviteUser(
            @RequestBody Map<String, String> body, HttpServletRequest request) {
        Long tenantId = getTenantId(request);
        Tenant tenant = tenantRepo.findById(tenantId).orElseThrow();

        String email = body.get("email");
        String name = body.get("name");
        String roleStr = body.getOrDefault("role", "SELLER");

        if (email == null || name == null) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "email and name are required"));
        }

        if (userRepo.existsByEmail(email)) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Email already registered"));
        }

        User.Role role;
        try {
            role = User.Role.valueOf(roleStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Invalid role. Valid roles: TENANT_ADMIN, PRICING_MANAGER, SELLER, ANALYST"));
        }

        String tempPassword = "Welcome@" + (int)(Math.random() * 9000 + 1000);

        User user = new User();
        user.setTenant(tenant);
        user.setName(name);
        user.setEmail(email);
        user.setRole(role);
        user.setPasswordHash(passwordEncoder.encode(tempPassword));
        user = userRepo.save(user);

        return ResponseEntity.ok(Map.of(
                "message", "User invited successfully",
                "userId", user.getId(),
                "email", email,
                "temporaryPassword", tempPassword
        ));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('TENANT_ADMIN')")
    public ResponseEntity<Map<String, String>> removeUser(
            @PathVariable Long id, HttpServletRequest request) {
        Long tenantId = getTenantId(request);
        return userRepo.findById(id)
                .filter(u -> u.getTenant().getId().equals(tenantId))
                .map(u -> {
                    userRepo.delete(u);
                    return ResponseEntity.ok(Map.of("message", "User removed successfully"));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    private Long getTenantId(HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        return jwtUtil.getTenantIdFromToken(token);
    }
}