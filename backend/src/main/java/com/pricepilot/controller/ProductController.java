package com.pricepilot.controller;

import com.pricepilot.entity.*;
import com.pricepilot.repository.*;
import com.pricepilot.security.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final MasterProductRepository masterProductRepo;
    private final MarketplaceProductRepository marketplaceProductRepo;
    private final TenantRepository tenantRepo;
    private final PriceChangeLogRepository priceChangeLogRepo;
    private final JwtUtil jwtUtil;

    @GetMapping
    public ResponseEntity<List<MasterProduct>> getAllProducts(
            HttpServletRequest request,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) String search) {
        Long tenantId = getTenantId(request);
        List<MasterProduct> products = masterProductRepo.findByTenantId(tenantId);

        if (category != null && !category.isBlank())
            products = products.stream()
                .filter(p -> category.equalsIgnoreCase(p.getCategory()))
                .collect(Collectors.toList());

        if (brand != null && !brand.isBlank())
            products = products.stream()
                .filter(p -> brand.equalsIgnoreCase(p.getBrand()))
                .collect(Collectors.toList());

        if (search != null && !search.isBlank()) {
            String q = search.toLowerCase();
            products = products.stream()
                .filter(p -> (p.getName() != null && p.getName().toLowerCase().contains(q))
                    || (p.getBrand() != null && p.getBrand().toLowerCase().contains(q)))
                .collect(Collectors.toList());
        }
        return ResponseEntity.ok(products);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MasterProduct> getProduct(@PathVariable Long id) {
        return masterProductRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<MasterProduct> createProduct(
            @RequestBody MasterProduct product, HttpServletRequest request) {
        Long tenantId = getTenantId(request);
        Tenant tenant = tenantRepo.findById(tenantId).orElseThrow();
        product.setTenant(tenant);
        return ResponseEntity.ok(masterProductRepo.save(product));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MasterProduct> updateProduct(
            @PathVariable Long id, @RequestBody MasterProduct updated, HttpServletRequest request) {
        Long tenantId = getTenantId(request);
        return masterProductRepo.findById(id)
                .filter(p -> p.getTenant().getId().equals(tenantId))
                .map(existing -> {
                    if (updated.getName() != null) existing.setName(updated.getName());
                    if (updated.getBrand() != null) existing.setBrand(updated.getBrand());
                    if (updated.getCategory() != null) existing.setCategory(updated.getCategory());
                    if (updated.getModelNumber() != null) existing.setModelNumber(updated.getModelNumber());
                    if (updated.getCostPrice() != null) existing.setCostPrice(updated.getCostPrice());
                    if (updated.getMarketplaceCommission() != null) existing.setMarketplaceCommission(updated.getMarketplaceCommission());
                    if (updated.getShippingCost() != null) existing.setShippingCost(updated.getShippingCost());
                    if (updated.getPackagingCost() != null) existing.setPackagingCost(updated.getPackagingCost());
                    if (updated.getTaxPercent() != null) existing.setTaxPercent(updated.getTaxPercent());
                    if (updated.getMinimumMarginPercent() != null) existing.setMinimumMarginPercent(updated.getMinimumMarginPercent());
                    return ResponseEntity.ok(masterProductRepo.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteProduct(
            @PathVariable Long id, HttpServletRequest request) {
        Long tenantId = getTenantId(request);
        return masterProductRepo.findById(id)
                .filter(p -> p.getTenant().getId().equals(tenantId))
                .map(p -> {
                    masterProductRepo.delete(p);
                    return ResponseEntity.ok(Map.of("message", "Product deleted successfully"));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/listings")
    public ResponseEntity<List<MarketplaceProduct>> getListings(@PathVariable Long id) {
        return ResponseEntity.ok(marketplaceProductRepo.findByMasterProductId(id));
    }

    @PostMapping("/{id}/listings")
    public ResponseEntity<MarketplaceProduct> addListing(
            @PathVariable Long id, @RequestBody MarketplaceProduct listing, HttpServletRequest request) {
        Long tenantId = getTenantId(request);
        MasterProduct product = masterProductRepo.findById(id).orElseThrow();
        Tenant tenant = tenantRepo.findById(tenantId).orElseThrow();
        listing.setMasterProduct(product);
        listing.setTenant(tenant);
        return ResponseEntity.ok(marketplaceProductRepo.save(listing));
    }

    @GetMapping("/low-sale")
    public ResponseEntity<List<MarketplaceProduct>> getLowSaleProducts(HttpServletRequest request) {
        Long tenantId = getTenantId(request);
        return ResponseEntity.ok(marketplaceProductRepo.findLowSaleProducts(tenantId));
    }

    @GetMapping("/no-sale")
    public ResponseEntity<List<MarketplaceProduct>> getNoSaleProducts(HttpServletRequest request) {
        Long tenantId = getTenantId(request);
        return ResponseEntity.ok(marketplaceProductRepo.findHighViewNoSaleProducts(tenantId));
    }

    @GetMapping("/{id}/price-comparison")
    public ResponseEntity<Map<String, Object>> getPriceComparison(@PathVariable Long id) {
        return masterProductRepo.findById(id)
                .map(product -> {
                    List<MarketplaceProduct> listings = marketplaceProductRepo.findByMasterProductId(id);

                    BigDecimal lowestPrice = listings.stream()
                            .map(MarketplaceProduct::getCurrentPrice)
                            .filter(p -> p != null)
                            .min(Comparator.naturalOrder())
                            .orElse(BigDecimal.ZERO);

                    BigDecimal highestPrice = listings.stream()
                            .map(MarketplaceProduct::getCurrentPrice)
                            .filter(p -> p != null)
                            .max(Comparator.naturalOrder())
                            .orElse(BigDecimal.ZERO);

                    List<Map<String, Object>> platformPrices = listings.stream()
                            .map(l -> {
                                Map<String, Object> entry = new HashMap<>();
                                entry.put("platform", l.getPlatform());
                                entry.put("price", l.getCurrentPrice());
                                entry.put("stock", l.getStockQuantity());
                                entry.put("orders7d", l.getOrdersLast7Days());
                                entry.put("views7d", l.getViewsLast7Days());
                                return entry;
                            })
                            .collect(Collectors.toList());

                    Map<String, Object> result = new HashMap<>();
                    result.put("productId", id);
                    result.put("productName", product.getName());
                    result.put("minimumSafePrice", product.getMinimumSafePrice());
                    result.put("lowestMarketPrice", lowestPrice);
                    result.put("highestMarketPrice", highestPrice);
                    result.put("priceDifference", highestPrice.subtract(lowestPrice));
                    result.put("platforms", platformPrices);
                    return ResponseEntity.ok(result);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/price-history")
    public ResponseEntity<List<PriceChangeLog>> getPriceHistory(@PathVariable Long id) {
        List<MarketplaceProduct> listings = marketplaceProductRepo.findByMasterProductId(id);
        List<PriceChangeLog> allLogs = new ArrayList<>();
        for (MarketplaceProduct listing : listings) {
            allLogs.addAll(priceChangeLogRepo
                .findByMarketplaceProductIdOrderByCreatedAtDesc(listing.getId()));
        }
        allLogs.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));
        return ResponseEntity.ok(allLogs);
    }

    @PostMapping(value = "/import-csv", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> importCsv(
            @RequestParam("file") MultipartFile file, HttpServletRequest request) {
        Long tenantId = getTenantId(request);
        Tenant tenant = tenantRepo.findById(tenantId).orElseThrow();

        int created = 0;
        int errors = 0;
        List<String> errorMessages = new ArrayList<>();

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            String header = reader.readLine();
            if (header == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Empty CSV file"));
            }
            String line;
            int rowNum = 1;
            while ((line = reader.readLine()) != null) {
                rowNum++;
                if (line.isBlank()) continue;
                String[] cols = line.split(",", -1);
                try {
                    MasterProduct p = new MasterProduct();
                    p.setTenant(tenant);
                    p.setName(cols[0].trim());
                    if (cols.length > 1) p.setBrand(cols[1].trim());
                    if (cols.length > 2) p.setCategory(cols[2].trim());
                    if (cols.length > 3) p.setModelNumber(cols[3].trim());
                    if (cols.length > 4 && !cols[4].isBlank()) p.setCostPrice(new BigDecimal(cols[4].trim()));
                    if (cols.length > 5 && !cols[5].isBlank()) p.setMarketplaceCommission(new BigDecimal(cols[5].trim()));
                    if (cols.length > 6 && !cols[6].isBlank()) p.setShippingCost(new BigDecimal(cols[6].trim()));
                    if (cols.length > 7 && !cols[7].isBlank()) p.setPackagingCost(new BigDecimal(cols[7].trim()));
                    if (cols.length > 8 && !cols[8].isBlank()) p.setTaxPercent(new BigDecimal(cols[8].trim()));
                    if (cols.length > 9 && !cols[9].isBlank()) p.setMinimumMarginPercent(new BigDecimal(cols[9].trim()));
                    masterProductRepo.save(p);
                    created++;
                } catch (Exception e) {
                    errors++;
                    errorMessages.add("Row " + rowNum + ": " + e.getMessage());
                }
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Failed to read file: " + e.getMessage()));
        }

        return ResponseEntity.ok(Map.of(
                "message", "CSV import complete",
                "created", created,
                "errors", errors,
                "errorDetails", errorMessages
        ));
    }

    private Long getTenantId(HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        return jwtUtil.getTenantIdFromToken(token);
    }
}