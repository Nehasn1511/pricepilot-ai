package com.pricepilot.backend.product.controller;

import com.pricepilot.backend.product.dto.*;
import com.pricepilot.backend.product.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public Page<ProductResponse> list(
            @RequestParam(required = false, defaultValue = "") String search,
            @RequestParam(required = false, defaultValue = "") String marketplace,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return productService.search(search, marketplace, page, size);
    }

    @GetMapping("/low-sale")
    public List<ProductResponse> lowSale() {
        return productService.getLowSale();
    }

    @GetMapping("/no-sale")
    public List<ProductResponse> noSale() {
        return productService.getNoSale();
    }

    @GetMapping("/{id}")
    public ProductResponse get(@PathVariable Long id) {
        return productService.getById(id);
    }

    @PostMapping
    public ProductResponse create(@Valid @RequestBody ProductRequest request) {
        return productService.create(request);
    }

    @GetMapping("/{id}/listings")
    public List<ListingResponse> getListings(@PathVariable Long id) {
        return productService.getListings(id);
    }

    @PostMapping("/{id}/listings")
    public ListingResponse addListing(@PathVariable Long id, @Valid @RequestBody ListingRequest request) {
        return productService.addListing(id, request);
    }

    @PostMapping(value = "/import-csv", consumes = "multipart/form-data")
    public List<ProductResponse> importCsv(@RequestParam("file") MultipartFile file) {
        return productService.importCsv(file);
    }
}
