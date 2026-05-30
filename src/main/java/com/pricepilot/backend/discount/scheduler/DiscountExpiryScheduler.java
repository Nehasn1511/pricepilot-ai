package com.pricepilot.backend.discount.scheduler;

import com.pricepilot.backend.discount.service.DiscountLifecycleService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class DiscountExpiryScheduler {

    private final DiscountLifecycleService discountLifecycleService;

    public DiscountExpiryScheduler(DiscountLifecycleService discountLifecycleService) {
        this.discountLifecycleService = discountLifecycleService;
    }

    // Runs every 1 minute for testing
    @Scheduled(cron = "0 * * * * *")
    public void expireDiscounts() {
        discountLifecycleService.expireCompletedDiscounts();
    }
}