package com.pricepilot.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
                                        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
    filterChain.doFilter(request, response);
    return;
}
       String authHeader = request.getHeader("Authorization");

System.out.println("=================================");
System.out.println("Request: " + request.getMethod() + " " + request.getRequestURI());
System.out.println("Authorization Header: " + authHeader);

if (authHeader != null && authHeader.startsWith("Bearer ")) {

    String token = authHeader.substring(7);

    System.out.println("Token found");

    if (jwtUtil.validateToken(token)) {

        System.out.println("Token VALID");

        String email = jwtUtil.getEmailFromToken(token);
        String role = jwtUtil.getRoleFromToken(token);

        UsernamePasswordAuthenticationToken authToken =
                new UsernamePasswordAuthenticationToken(
                        email,
                        null,
                        List.of(new SimpleGrantedAuthority(role))
                );

        SecurityContextHolder.getContext().setAuthentication(authToken);

        System.out.println("Authentication set for: " + email);

    } else {
        System.out.println("Token INVALID");
    }

} else {
    System.out.println("Authorization header missing");
}

filterChain.doFilter(request, response);
    }
}