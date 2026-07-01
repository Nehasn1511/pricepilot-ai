package com.pricepilot.backend.ai.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.pricepilot.backend.recommendation.enums.RecommendationType;
import com.pricepilot.backend.recommendation.enums.RiskLevel;

@Service
public class GeminiExplanationService {

    private final WebClient webClient;

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    @Value("${gemini.api.url}")
    private String geminiApiUrl;

    public GeminiExplanationService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    public String generateReason(
            RecommendationType recommendationType,
            BigDecimal currentPrice,
            BigDecimal competitorPrice,
            BigDecimal recommendedPrice,
            BigDecimal minimumSafePrice,
            Integer healthScore,
            RiskLevel riskLevel
    ) {
        if (geminiApiKey == null || geminiApiKey.trim().isEmpty()) {
            return fallbackReason(
                    recommendationType,
                    currentPrice,
                    competitorPrice,
                    recommendedPrice,
                    minimumSafePrice,
                    healthScore,
                    riskLevel
            );
        }

        try {
            String prompt = buildPrompt(
                    recommendationType,
                    currentPrice,
                    competitorPrice,
                    recommendedPrice,
                    minimumSafePrice,
                    healthScore,
                    riskLevel
            );

            Map<String, Object> requestBody = buildGeminiRequest(prompt);

            Map response = webClient.post()
                    .uri(geminiApiUrl + "?key=" + geminiApiKey)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            String text = extractText(response);

            if (text == null || text.trim().isEmpty()) {
                return fallbackReason(
                        recommendationType,
                        currentPrice,
                        competitorPrice,
                        recommendedPrice,
                        minimumSafePrice,
                        healthScore,
                        riskLevel
                );
            }

            return text.trim();

        } catch (Exception e) {
            return fallbackReason(
                    recommendationType,
                    currentPrice,
                    competitorPrice,
                    recommendedPrice,
                    minimumSafePrice,
                    healthScore,
                    riskLevel
            );
        }
    }

    private String buildPrompt(
            RecommendationType recommendationType,
            BigDecimal currentPrice,
            BigDecimal competitorPrice,
            BigDecimal recommendedPrice,
            BigDecimal minimumSafePrice,
            Integer healthScore,
            RiskLevel riskLevel
    ) {
        return "You are PricePilot AI, an AI pricing assistant for e-commerce sellers. "
                + "The Java backend has already calculated the pricing decision. "
                + "Do not change the recommendation type, price, health score, or risk level. "
                + "Only write a short human-readable explanation in 2 simple sentences.\n\n"
                + "Recommendation Type: " + recommendationType + "\n"
                + "Current Price: ₹" + currentPrice + "\n"
                + "Scraped Competitor Price: ₹" + competitorPrice + "\n"
                + "Recommended Price: ₹" + recommendedPrice + "\n"
                + "Minimum Safe Price: ₹" + minimumSafePrice + "\n"
                + "Health Score: " + healthScore + "\n"
                + "Risk Level: " + riskLevel + "\n\n"
                + "Explain why this recommendation is safe and useful for the seller.";
    }

    private Map<String, Object> buildGeminiRequest(String prompt) {
        Map<String, Object> textPart = new HashMap<String, Object>();
        textPart.put("text", prompt);

        List<Map<String, Object>> parts = new ArrayList<Map<String, Object>>();
        parts.add(textPart);

        Map<String, Object> content = new HashMap<String, Object>();
        content.put("parts", parts);

        List<Map<String, Object>> contents = new ArrayList<Map<String, Object>>();
        contents.add(content);

        Map<String, Object> requestBody = new HashMap<String, Object>();
        requestBody.put("contents", contents);

        return requestBody;
    }

    private String extractText(Map response) {
        if (response == null) {
            return null;
        }

        Object candidatesObject = response.get("candidates");

        if (!(candidatesObject instanceof List)) {
            return null;
        }

        List candidates = (List) candidatesObject;

        if (candidates.isEmpty()) {
            return null;
        }

        Object candidateObject = candidates.get(0);

        if (!(candidateObject instanceof Map)) {
            return null;
        }

        Map candidate = (Map) candidateObject;
        Object contentObject = candidate.get("content");

        if (!(contentObject instanceof Map)) {
            return null;
        }

        Map content = (Map) contentObject;
        Object partsObject = content.get("parts");

        if (!(partsObject instanceof List)) {
            return null;
        }

        List parts = (List) partsObject;

        if (parts.isEmpty()) {
            return null;
        }

        Object partObject = parts.get(0);

        if (!(partObject instanceof Map)) {
            return null;
        }

        Map part = (Map) partObject;
        Object textObject = part.get("text");

        if (textObject == null) {
            return null;
        }

        return textObject.toString();
    }

    private String fallbackReason(
            RecommendationType recommendationType,
            BigDecimal currentPrice,
            BigDecimal competitorPrice,
            BigDecimal recommendedPrice,
            BigDecimal minimumSafePrice,
            Integer healthScore,
            RiskLevel riskLevel
    ) {
        return "The system recommends " + recommendationType
                + " because the current price ₹" + currentPrice
                + " is higher than the scraped competitor price ₹" + competitorPrice
                + ". The recommended price ₹" + recommendedPrice
                + " is above the minimum safe price ₹" + minimumSafePrice
                + ", so the seller margin is protected.";
    }
}