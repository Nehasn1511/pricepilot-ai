package com.pricepilot.controller;

import com.pricepilot.dto.AuthRequest;
import com.pricepilot.dto.AuthResponse;
import com.pricepilot.dto.RegisterRequest;
import com.pricepilot.entity.Tenant;
import com.pricepilot.entity.User;
import com.pricepilot.repository.TenantRepository;
import com.pricepilot.repository.UserRepository;
import com.pricepilot.security.JwtUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body(
                    AuthResponse.builder().message("Email already registered").build()
            );
        }

        // Create tenant
        Tenant tenant = Tenant.builder()
                .name(request.getCompanyName())
                .build();
        tenant = tenantRepository.save(tenant);

        // Create user
        User user = User.builder()
                .tenant(tenant)
                .name(request.getName())
                .email(request.getEmail())
                .role(User.Role.TENANT_ADMIN)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .build();
        user = userRepository.save(user);

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name(), tenant.getId());

        return ResponseEntity.ok(AuthResponse.builder()
                .token(token)
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .tenantId(tenant.getId())
                .tenantName(tenant.getName())
                .message("Registration successful")
                .build());
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElse(null);

        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            return ResponseEntity.status(401).body(
                    AuthResponse.builder().message("Invalid email or password").build()
            );
        }

        String token = jwtUtil.generateToken(
                user.getEmail(), user.getRole().name(), user.getTenant().getId()
        );

        return ResponseEntity.ok(AuthResponse.builder()
                .token(token)
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .tenantId(user.getTenant().getId())
                .tenantName(user.getTenant().getName())
                .message("Login successful")
                .build());
    }
}
