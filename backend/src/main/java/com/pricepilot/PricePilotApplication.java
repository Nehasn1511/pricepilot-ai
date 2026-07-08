package com.pricepilot;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.boot.autoconfigure.domain.EntityScan;

@SpringBootApplication
@ComponentScan(
    basePackages = "com.pricepilot",
    excludeFilters = @ComponentScan.Filter(
        type = FilterType.REGEX,
        pattern = "com\\.pricepilot\\.backend\\..*"
    )
)
@EnableJpaRepositories(basePackages = "com.pricepilot.repository")
@EntityScan(basePackages = "com.pricepilot.entity")
public class PricePilotApplication {
    public static void main(String[] args) {
        SpringApplication.run(PricePilotApplication.class, args);
    }
}