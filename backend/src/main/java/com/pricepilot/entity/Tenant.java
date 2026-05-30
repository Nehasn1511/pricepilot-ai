package com.pricepilot.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "tenants")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Tenant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String plan; // FREE, STARTER, GROWTH, ENTERPRISE

    @Column(nullable = false)
    private String status; // ACTIVE, SUSPENDED

    @OneToMany(mappedBy = "tenant", cascade = CascadeType.ALL)
    private List<User> users;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) status = "ACTIVE";
        if (plan == null) plan = "FREE";
    }
}
