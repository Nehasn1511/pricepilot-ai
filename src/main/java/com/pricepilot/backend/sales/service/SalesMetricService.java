package com.pricepilot.backend.sales.service;

import com.pricepilot.backend.sales.dto.SalesMetricRequest;
import com.pricepilot.backend.sales.dto.SalesMetricResponse;
import com.pricepilot.backend.sales.dto.SalesSummaryResponse;
import com.pricepilot.backend.sales.entity.SalesMetric;
import com.pricepilot.backend.sales.repository.SalesMetricRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class SalesMetricService {

    private final SalesMetricRepository salesMetricRepository;

    public SalesMetricService(SalesMetricRepository salesMetricRepository) {
        this.salesMetricRepository = salesMetricRepository;
    }

    public SalesMetricResponse createSalesMetric(SalesMetricRequest request) {

        SalesMetric metric = new SalesMetric();

        metric.setTenantId(request.getTenantId());
        metric.setMasterProductId(request.getMasterProductId());
        metric.setMarketplaceProductId(request.getMarketplaceProductId());
        metric.setMetricDate(request.getMetricDate());
        metric.setViews(request.getViews());
        metric.setOrders(request.getOrders());
        metric.setRevenue(request.getRevenue());
        metric.setStockQuantity(request.getStockQuantity());
        metric.setReturnsCount(request.getReturnsCount());
        metric.setCartAdditions(request.getCartAdditions());
        metric.setConversionRate(calculateConversionRate(request.getViews(), request.getOrders()));
        metric.setCreatedAt(LocalDateTime.now());
        metric.setUpdatedAt(LocalDateTime.now());

        SalesMetric saved = salesMetricRepository.save(metric);

        return mapToResponse(saved);
    }

    public List<SalesMetricResponse> getProductSales(Long tenantId, Long marketplaceProductId) {
        return salesMetricRepository
                .findByTenantIdAndMarketplaceProductIdOrderByMetricDateDesc(tenantId, marketplaceProductId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<SalesMetricResponse> getLast7DaysSales(Long tenantId, Long marketplaceProductId) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(6);

        return salesMetricRepository
                .findByTenantIdAndMarketplaceProductIdAndMetricDateBetweenOrderByMetricDateDesc(
                        tenantId,
                        marketplaceProductId,
                        startDate,
                        endDate
                )
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public SalesSummaryResponse getLast7DaysSummary(Long tenantId, Long marketplaceProductId) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(6);

        List<SalesMetric> metrics = salesMetricRepository
                .findByTenantIdAndMarketplaceProductIdAndMetricDateBetweenOrderByMetricDateDesc(
                        tenantId,
                        marketplaceProductId,
                        startDate,
                        endDate
                );

        int totalViews = 0;
        int totalOrders = 0;
        int totalReturns = 0;
        BigDecimal totalRevenue = BigDecimal.ZERO;

        for (SalesMetric metric : metrics) {
            totalViews += safeInt(metric.getViews());
            totalOrders += safeInt(metric.getOrders());
            totalReturns += safeInt(metric.getReturnsCount());

            if (metric.getRevenue() != null) {
                totalRevenue = totalRevenue.add(metric.getRevenue());
            }
        }

        SalesSummaryResponse response = new SalesSummaryResponse();
        response.setTenantId(tenantId);
        response.setMarketplaceProductId(marketplaceProductId);
        response.setTotalViews(totalViews);
        response.setTotalOrders(totalOrders);
        response.setTotalReturns(totalReturns);
        response.setTotalRevenue(totalRevenue);
        response.setConversionRate(calculateConversionRate(totalViews, totalOrders));

        return response;
    }

    private Double calculateConversionRate(Integer views, Integer orders) {
        if (views == null || views == 0 || orders == null) {
            return 0.0;
        }

        return BigDecimal.valueOf(orders)
                .multiply(BigDecimal.valueOf(100))
                .divide(BigDecimal.valueOf(views), 2, RoundingMode.HALF_UP)
                .doubleValue();
    }

    private int safeInt(Integer value) {
        return value == null ? 0 : value;
    }

    private SalesMetricResponse mapToResponse(SalesMetric metric) {
        SalesMetricResponse response = new SalesMetricResponse();

        response.setId(metric.getId());
        response.setTenantId(metric.getTenantId());
        response.setMasterProductId(metric.getMasterProductId());
        response.setMarketplaceProductId(metric.getMarketplaceProductId());
        response.setMetricDate(metric.getMetricDate());
        response.setViews(metric.getViews());
        response.setOrders(metric.getOrders());
        response.setRevenue(metric.getRevenue());
        response.setStockQuantity(metric.getStockQuantity());
        response.setReturnsCount(metric.getReturnsCount());
        response.setCartAdditions(metric.getCartAdditions());
        response.setConversionRate(metric.getConversionRate());

        return response;
    }
}