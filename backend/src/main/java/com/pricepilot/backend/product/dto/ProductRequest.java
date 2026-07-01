package com.pricepilot.backend.product.dto;

import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;

public class ProductRequest {

    @NotBlank
    private String name;

    private String brand;
    private String category;
    private BigDecimal costPrice;
    private Integer healthScore;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public BigDecimal getCostPrice() { return costPrice; }
    public void setCostPrice(BigDecimal costPrice) { this.costPrice = costPrice; }
    public Integer getHealthScore() { return healthScore; }
    public void setHealthScore(Integer healthScore) { this.healthScore = healthScore; }
}
