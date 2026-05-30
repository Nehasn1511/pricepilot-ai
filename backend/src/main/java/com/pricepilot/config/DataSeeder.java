package com.pricepilot.config;

import com.pricepilot.entity.*;
import com.pricepilot.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final TenantRepository tenantRepo;
    private final UserRepository userRepo;
    private final MasterProductRepository masterProductRepo;
    private final MarketplaceProductRepository marketplaceProductRepo;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (tenantRepo.count() > 0) return; // Already seeded

        // Create demo tenant
        Tenant tenant = tenantRepo.save(Tenant.builder()
                .name("Demo Electronics Store")
                .plan("GROWTH")
                .status("ACTIVE")
                .build());

        // Create demo user (login: demo@pricepilot.com / password123)
        userRepo.save(User.builder()
                .tenant(tenant)
                .name("Demo Admin")
                .email("demo@pricepilot.com")
                .role(User.Role.TENANT_ADMIN)
                .passwordHash(passwordEncoder.encode("password123"))
                .build());

        // Seed products
        seedProduct(tenant, "boAt Rockerz 255 Pro", "boAt", "Audio",
                BigDecimal.valueOf(900), BigDecimal.valueOf(100), BigDecimal.valueOf(50), BigDecimal.valueOf(10),
                new ListingData[]{
                        new ListingData(MarketplaceProduct.Platform.AMAZON, "boAt Rockerz 255 Pro Wireless Neckband", 1499, 85, 1200, 28, 4.2),
                        new ListingData(MarketplaceProduct.Platform.FLIPKART, "Boat 255 Pro Bluetooth Earphones", 1299, 60, 890, 35, 4.3),
                });

        seedProduct(tenant, "Wireless Keyboard Pro", "Logitech", "Accessories",
                BigDecimal.valueOf(800), BigDecimal.valueOf(120), BigDecimal.valueOf(60), BigDecimal.valueOf(20),
                new ListingData[]{
                        new ListingData(MarketplaceProduct.Platform.AMAZON, "Logitech Wireless Keyboard K380", 1499, 120, 900, 2, 4.0),
                        new ListingData(MarketplaceProduct.Platform.FLIPKART, "Logitech K380 Multi-Device Keyboard", 1299, 45, 450, 12, 4.1),
                });

        seedProduct(tenant, "Samsung 25W Charger", "Samsung", "Mobile Accessories",
                BigDecimal.valueOf(500), BigDecimal.valueOf(80), BigDecimal.valueOf(40), BigDecimal.valueOf(10),
                new ListingData[]{
                        new ListingData(MarketplaceProduct.Platform.AMAZON, "Samsung 25W Type-C Fast Charger", 899, 200, 2100, 65, 4.5),
                        new ListingData(MarketplaceProduct.Platform.MEESHO, "Samsung Original 25W Charger", 799, 150, 1500, 42, 4.3),
                });

        seedProduct(tenant, "USB-C Hub 7-in-1", "Anker", "Accessories",
                BigDecimal.valueOf(1200), BigDecimal.valueOf(150), BigDecimal.valueOf(80), BigDecimal.valueOf(30),
                new ListingData[]{
                        new ListingData(MarketplaceProduct.Platform.AMAZON, "Anker USB-C Hub 7-in-1 Adapter", 2499, 80, 450, 0, 4.4),
                        new ListingData(MarketplaceProduct.Platform.FLIPKART, "Anker 7 in 1 USB C Hub", 2199, 30, 280, 3, 4.2),
                });

        seedProduct(tenant, "Phone Case Clear", "Spigen", "Mobile Accessories",
                BigDecimal.valueOf(200), BigDecimal.valueOf(50), BigDecimal.valueOf(30), BigDecimal.valueOf(10),
                new ListingData[]{
                        new ListingData(MarketplaceProduct.Platform.AMAZON, "Spigen Ultra Hybrid Clear Case", 799, 500, 1200, 0, 4.1),
                        new ListingData(MarketplaceProduct.Platform.FLIPKART, "Spigen Crystal Clear Phone Case", 599, 300, 800, 5, 4.0),
                        new ListingData(MarketplaceProduct.Platform.MEESHO, "Spigen Clear Back Cover", 499, 200, 2000, 15, 3.8),
                });

        System.out.println("=== Demo data seeded! Login: demo@pricepilot.com / password123 ===");
    }

    private void seedProduct(Tenant tenant, String name, String brand, String category,
                             BigDecimal cost, BigDecimal commission, BigDecimal shipping, BigDecimal packaging,
                             ListingData[] listings) {
        MasterProduct product = masterProductRepo.save(MasterProduct.builder()
                .tenant(tenant)
                .name(name)
                .brand(brand)
                .category(category)
                .costPrice(cost)
                .marketplaceCommission(commission)
                .shippingCost(shipping)
                .packagingCost(packaging)
                .taxPercent(BigDecimal.valueOf(18))
                .minimumMarginPercent(BigDecimal.valueOf(15))
                .build());

        for (ListingData ld : listings) {
            marketplaceProductRepo.save(MarketplaceProduct.builder()
                    .tenant(tenant)
                    .masterProduct(product)
                    .platform(ld.platform)
                    .title(ld.title)
                    .currentPrice(BigDecimal.valueOf(ld.price))
                    .stockQuantity(ld.stock)
                    .viewsLast7Days(ld.views)
                    .ordersLast7Days(ld.orders)
                    .rating(ld.rating)
                    .build());
        }
    }

    record ListingData(MarketplaceProduct.Platform platform, String title, int price, int stock, int views, int orders, double rating) {}
}
