package com.pricepilot.backend.product.service;

import com.pricepilot.backend.product.dto.*;
import com.pricepilot.backend.product.entity.Listing;
import com.pricepilot.backend.product.entity.Product;
import com.pricepilot.backend.product.repository.ListingRepository;
import com.pricepilot.backend.product.repository.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final ListingRepository listingRepository;

    public ProductService(ProductRepository productRepository,
                          ListingRepository listingRepository) {
        this.productRepository = productRepository;
        this.listingRepository = listingRepository;
    }

    // ── Search / list (paginated) ─────────────────────────
    public Page<ProductResponse> search(String search, String marketplace, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Product> result = productRepository.search(search, pageable);
        return result.map(p -> toResponse(p, loadPlatforms(p.getId(), marketplace)));
    }

    // ── Get by id ─────────────────────────────────────────
    public ProductResponse getById(Long id) {
        Product p = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found: " + id));
        return toResponse(p, loadPlatforms(p.getId(), null));
    }

    // ── Create ────────────────────────────────────────────
    public ProductResponse create(ProductRequest req) {
        Product p = new Product();
        p.setName(req.getName());
        p.setBrand(req.getBrand());
        p.setCategory(req.getCategory());
        p.setCostPrice(req.getCostPrice() != null ? req.getCostPrice() : BigDecimal.ZERO);
        p.setHealthScore(req.getHealthScore() != null ? req.getHealthScore() : 75);
        Product saved = productRepository.save(p);
        return toResponse(saved, List.of());
    }

    // ── Listings ──────────────────────────────────────────
    public List<ListingResponse> getListings(Long productId) {
        return listingRepository.findByProductId(productId).stream()
                .map(this::toListingResponse).toList();
    }

    public ListingResponse addListing(Long productId, ListingRequest req) {
        productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found: " + productId));
        Listing l = new Listing();
        l.setProductId(productId);
        l.setPlatform(req.getPlatform() != null ? req.getPlatform().toUpperCase() : null);
        l.setPrice(req.getPrice());
        l.setUrl(req.getUrl());
        l.setExternalSku(req.getExternalSku());
        return toListingResponse(listingRepository.save(l));
    }

    // ── Low / no sale ─────────────────────────────────────
    public List<ProductResponse> getLowSale() {
        return productRepository.findByHealthScoreLessThan(50).stream()
                .map(p -> toResponse(p, loadPlatforms(p.getId(), null))).toList();
    }

    public List<ProductResponse> getNoSale() {
        return productRepository.findByHealthScoreLessThan(25).stream()
                .map(p -> toResponse(p, loadPlatforms(p.getId(), null))).toList();
    }

    // ── CSV import ────────────────────────────────────────
    public List<ProductResponse> importCsv(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("CSV file is empty");
        }
        List<ProductResponse> created = new ArrayList<>();
        try (BufferedReader br = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            String header = br.readLine();
            if (header == null) return created;
            String[] cols = header.split(",");
            int iName = idx(cols, "name");
            int iBrand = idx(cols, "brand");
            int iCat = idx(cols, "category");
            int iCost = idx(cols, "costprice");
            String line;
            while ((line = br.readLine()) != null) {
                if (line.isBlank()) continue;
                String[] vals = line.split(",", -1);
                ProductRequest req = new ProductRequest();
                req.setName(safe(vals, iName));
                req.setBrand(safe(vals, iBrand));
                req.setCategory(safe(vals, iCat));
                String cost = safe(vals, iCost);
                if (cost != null && !cost.isBlank()) {
                    try { req.setCostPrice(new BigDecimal(cost.trim())); } catch (Exception ignore) {}
                }
                if (req.getName() != null && !req.getName().isBlank()) {
                    created.add(create(req));
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("CSV import failed: " + e.getMessage());
        }
        return created;
    }

    private int idx(String[] cols, String key) {
        for (int i = 0; i < cols.length; i++) {
            if (cols[i].trim().toLowerCase().replace("_", "").equals(key)) return i;
        }
        return -1;
    }

    private String safe(String[] vals, int idx) {
        if (idx < 0 || idx >= vals.length) return null;
        return vals[idx] == null ? null : vals[idx].trim();
    }

    // ── Mapping helpers ──────────────────────────────────
    private List<String> loadPlatforms(Long productId, String filter) {
        List<String> all = listingRepository.findByProductId(productId).stream()
                .map(Listing::getPlatform)
                .filter(s -> s != null && !s.isBlank())
                .map(String::toUpperCase)
                .distinct()
                .collect(Collectors.toList());
        if (filter == null || filter.isBlank()) return all;
        String f = filter.toUpperCase();
        return all.stream().filter(p -> p.equals(f)).toList();
    }

    private ProductResponse toResponse(Product p, List<String> platforms) {
        ProductResponse r = new ProductResponse();
        r.setId(p.getId());
        r.setName(p.getName());
        r.setBrand(p.getBrand());
        r.setCategory(p.getCategory());
        r.setCostPrice(p.getCostPrice());
        r.setHealthScore(p.getHealthScore());
        r.setPlatforms(platforms);
        return r;
    }

    private ListingResponse toListingResponse(Listing l) {
        ListingResponse r = new ListingResponse();
        r.setId(l.getId());
        r.setProductId(l.getProductId());
        r.setPlatform(l.getPlatform());
        r.setPrice(l.getPrice());
        r.setUrl(l.getUrl());
        r.setExternalSku(l.getExternalSku());
        r.setCreatedAt(l.getCreatedAt());
        return r;
    }
}
