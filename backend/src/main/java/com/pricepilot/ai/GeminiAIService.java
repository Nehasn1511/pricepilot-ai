package com.pricepilot.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Service
public class GeminiAIService {

    @Value("${gemini.api-key}")
    private String apiKey;

    @Value("${gemini.model}")
    private String model;

    @Value("${gemini.base-url}")
    private String baseUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String generateRecommendationExplanation(
            String productName,
            String platform,
            BigDecimal currentPrice,
            BigDecimal lowestMarketPrice,
            BigDecimal minimumSafePrice,
            BigDecimal recommendedPrice,
            int viewsLast7Days,
            int ordersLast7Days,
            int stockQuantity,
            String recommendationType
    ) {
        String prompt = String.format("""
            You are PricePilot AI, an intelligent pricing assistant for e-commerce sellers.

            Analyze this product situation and provide a clear, actionable recommendation explanation
            in 3-4 sentences. Be specific with numbers. Speak directly to the seller.

            Product: %s
            Platform: %s
            Current Price: ₹%.2f
            Lowest Market Price: ₹%.2f
            Minimum Safe Price: ₹%.2f
            Recommended Price: ₹%.2f
            Views (Last 7 Days): %d
            Orders (Last 7 Days): %d
            Stock Quantity: %d
            Recommendation Type: %s

            Provide explanation in this format:
            - What's happening (the problem)
            - Why this recommendation (the logic)
            - What to expect (the impact)
            - Risk assessment (one line)

            Keep it concise and professional. Use ₹ for currency.
            """,
                productName, platform, currentPrice, lowestMarketPrice,
                minimumSafePrice, recommendedPrice, viewsLast7Days,
                ordersLast7Days, stockQuantity, recommendationType
        );

        return callGemini(prompt);
    }

    public String generateProductHealthSummary(
            String productName,
            int healthScore,
            int views,
            int orders,
            BigDecimal price,
            BigDecimal competitorPrice,
            int stock
    ) {
        String prompt = String.format("""
            You are PricePilot AI. Provide a brief 2-3 sentence health summary for this product.
            Be direct and actionable.

            Product: %s
            Health Score: %d/100
            Views (7 days): %d
            Orders (7 days): %d
            Current Price: ₹%.2f
            Lowest Competitor Price: ₹%.2f
            Stock: %d units

            Summarize the product's health status and the primary issue (if any).
            """,
                productName, healthScore, views, orders, price, competitorPrice, stock
        );

        return callGemini(prompt);
    }

    private String callGemini(String prompt) {
        try {
            String url = String.format("%s/%s:generateContent?key=%s", baseUrl, model, apiKey);

            Map<String, Object> requestBody = Map.of(
                    "contents", List.of(
                            Map.of("parts", List.of(
                                    Map.of("text", prompt)
                            ))
                    ),
                    "generationConfig", Map.of(
                            "temperature", 0.7,
                            "maxOutputTokens", 500
                    )
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    url, HttpMethod.POST, entity, String.class
            );

            JsonNode root = objectMapper.readTree(response.getBody());
            return root.path("candidates").get(0)
                    .path("content").path("parts").get(0)
                    .path("text").asText();

        } catch (Exception e) {
            return "AI analysis unavailable. Based on the data: the product needs attention due to "
                    + "pricing gaps with competitors. Review the recommendation details above.";
        }
    }
}
