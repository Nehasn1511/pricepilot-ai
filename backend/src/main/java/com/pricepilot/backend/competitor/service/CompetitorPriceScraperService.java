package com.pricepilot.backend.competitor.service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.pricepilot.backend.competitor.dto.CompetitorPriceScrapeRequest;
import com.pricepilot.backend.competitor.dto.CompetitorPriceScrapeResponse;
import com.pricepilot.backend.competitor.dto.ScraperDebugResponse;

@Service
public class CompetitorPriceScraperService {

    @Value("${scraper.timeout-ms:10000}")
    private int timeoutMs;

    @Value("${scraperapi.api.key:}")
    private String scraperApiKey;

    @Value("${scraperapi.api.url:http://api.scraperapi.com}")
    private String scraperApiUrl;

    public CompetitorPriceScrapeResponse scrapePrice(CompetitorPriceScrapeRequest request) {

        if (request.getProductUrl() == null || request.getProductUrl().trim().isEmpty()) {
            return new CompetitorPriceScrapeResponse(
                    request.getTenantId(),
                    request.getMarketplaceProductId(),
                    request.getMarketplaceName(),
                    request.getProductUrl(),
                    null,
                    "FAILED",
                    "Product URL is required."
            );
        }

        try {
            // Step 1: Try direct Jsoup scraping first
            Document document = fetchDocument(request.getProductUrl());

            Double price = extractPrice(document, request.getMarketplaceName());

            if (price != null) {
                return new CompetitorPriceScrapeResponse(
                        request.getTenantId(),
                        request.getMarketplaceProductId(),
                        request.getMarketplaceName(),
                        request.getProductUrl(),
                        price,
                        "SUCCESS",
                        "Competitor price scraped successfully using direct Jsoup."
                );
            }

            String pageText = document.text();
            String pageTitle = document.title();

            // Step 2: If Amazon blocks direct scraping, try ScraperAPI fallback
            if (isAmazonBlockedPage(pageText, pageTitle, request.getMarketplaceName())) {

                try {
                    Document scraperApiDocument = fetchDocumentUsingScraperApi(request.getProductUrl());

                    Double scraperApiPrice = extractPrice(scraperApiDocument, request.getMarketplaceName());

                    if (scraperApiPrice != null) {
                        return new CompetitorPriceScrapeResponse(
                                request.getTenantId(),
                                request.getMarketplaceProductId(),
                                request.getMarketplaceName(),
                                request.getProductUrl(),
                                scraperApiPrice,
                                "SUCCESS",
                                "Competitor price scraped successfully using ScraperAPI fallback."
                        );
                    }

                    return new CompetitorPriceScrapeResponse(
                            request.getTenantId(),
                            request.getMarketplaceProductId(),
                            request.getMarketplaceName(),
                            request.getProductUrl(),
                            null,
                            "FAILED",
                            "Amazon blocked direct scraping. ScraperAPI was called, but price could not be extracted from returned page."
                    );

                } catch (Exception scraperApiException) {
                    return new CompetitorPriceScrapeResponse(
                            request.getTenantId(),
                            request.getMarketplaceProductId(),
                            request.getMarketplaceName(),
                            request.getProductUrl(),
                            null,
                            "BLOCKED",
                            "Amazon blocked direct scraping. ScraperAPI fallback also failed: " + scraperApiException.getMessage()
                    );
                }
            }

            return new CompetitorPriceScrapeResponse(
                    request.getTenantId(),
                    request.getMarketplaceProductId(),
                    request.getMarketplaceName(),
                    request.getProductUrl(),
                    null,
                    "FAILED",
                    "Could not extract competitor price from the page."
            );

        } catch (Exception e) {
            return new CompetitorPriceScrapeResponse(
                    request.getTenantId(),
                    request.getMarketplaceProductId(),
                    request.getMarketplaceName(),
                    request.getProductUrl(),
                    null,
                    "FAILED",
                    "Scraping failed: " + e.getMessage()
            );
        }
    }

    public ScraperDebugResponse debugPage(CompetitorPriceScrapeRequest request) {

        if (request.getProductUrl() == null || request.getProductUrl().trim().isEmpty()) {
            return new ScraperDebugResponse(
                    request.getProductUrl(),
                    null,
                    null,
                    "FAILED",
                    "Product URL is required."
            );
        }

        try {
            Document document = fetchDocument(request.getProductUrl());

            String bodyText = document.text();
            String preview = bodyText;

            if (preview != null && preview.length() > 1500) {
                preview = preview.substring(0, 1500);
            }

            return new ScraperDebugResponse(
                    request.getProductUrl(),
                    document.title(),
                    preview,
                    "SUCCESS",
                    "Page fetched successfully using direct Jsoup."
            );

        } catch (Exception e) {
            return new ScraperDebugResponse(
                    request.getProductUrl(),
                    null,
                    null,
                    "FAILED",
                    "Debug fetch failed: " + e.getMessage()
            );
        }
    }

    public ScraperDebugResponse debugPageUsingScraperApi(CompetitorPriceScrapeRequest request) {

        if (request.getProductUrl() == null || request.getProductUrl().trim().isEmpty()) {
            return new ScraperDebugResponse(
                    request.getProductUrl(),
                    null,
                    null,
                    "FAILED",
                    "Product URL is required."
            );
        }

        try {
            Document document = fetchDocumentUsingScraperApi(request.getProductUrl());

            String bodyText = document.text();
            String preview = bodyText;

            if (preview != null && preview.length() > 1500) {
                preview = preview.substring(0, 1500);
            }

            return new ScraperDebugResponse(
                    request.getProductUrl(),
                    document.title(),
                    preview,
                    "SUCCESS",
                    "Page fetched successfully using ScraperAPI."
            );

        } catch (Exception e) {
            return new ScraperDebugResponse(
                    request.getProductUrl(),
                    null,
                    null,
                    "FAILED",
                    "ScraperAPI debug fetch failed: " + e.getMessage()
            );
        }
    }

    private Document fetchDocument(String productUrl) throws Exception {
        return Jsoup.connect(productUrl)
                .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36")
                .header("Accept-Language", "en-IN,en;q=0.9")
                .header("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
                .header("Connection", "keep-alive")
                .header("Cache-Control", "no-cache")
                .header("Pragma", "no-cache")
                .timeout(timeoutMs)
                .followRedirects(true)
                .get();
    }

    private Document fetchDocumentUsingScraperApi(String productUrl) throws Exception {

        if (scraperApiKey == null || scraperApiKey.trim().isEmpty()) {
            throw new RuntimeException("ScraperAPI key is missing. Set SCRAPERAPI_KEY environment variable.");
        }

        String encodedTargetUrl = URLEncoder.encode(productUrl, StandardCharsets.UTF_8);

        String finalUrl = scraperApiUrl
                + "?api_key=" + scraperApiKey
                + "&url=" + encodedTargetUrl
                + "&country_code=in"
                + "&render=false";

        return Jsoup.connect(finalUrl)
                .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64)")
                .timeout(timeoutMs + 15000)
                .followRedirects(true)
                .get();
    }

    private Double extractPrice(Document document, String marketplaceName) {

        if (marketplaceName == null) {
            return extractGenericPrice(document);
        }

        String name = marketplaceName.toLowerCase();

        if (name.contains("amazon")) {
            return extractAmazonPrice(document);
        }

        if (name.contains("flipkart")) {
            return extractFlipkartPrice(document);
        }

        if (name.contains("shopify")) {
            return extractGenericPrice(document);
        }

        if (name.contains("demo")) {
            return extractGenericPrice(document);
        }

        return extractGenericPrice(document);
    }

    private Double extractAmazonPrice(Document document) {

        String[] selectors = {
                "#priceblock_ourprice",
                "#priceblock_dealprice",
                "#priceblock_saleprice",
                "#corePriceDisplay_desktop_feature_div .a-price .a-offscreen",
                "#corePrice_feature_div .a-price .a-offscreen",
                "#apex_desktop .a-price .a-offscreen",
                ".priceToPay .a-offscreen",
                "span.a-price.aok-align-center span.a-offscreen",
                "span.a-price span.a-offscreen",
                ".a-price .a-offscreen",
                ".a-price-whole"
        };

        for (String selector : selectors) {
            Element element = document.selectFirst(selector);

            if (element != null) {
                Double price = cleanPrice(element.text());

                if (price != null && price >= 50) {
                    return price;
                }
            }
        }

        String html = document.html();

        Double priceFromHtml = extractPriceFromAmazonHtml(html);

        if (priceFromHtml != null && priceFromHtml >= 50) {
            return priceFromHtml;
        }

        String pageText = document.text();

        if (pageText != null && pageText.contains("₹")) {
            Double price = extractFirstRupeePrice(pageText);

            if (price != null && price >= 50) {
                return price;
            }
        }

        return null;
    }

    private Double extractFlipkartPrice(Document document) {

        Element priceElement = document.selectFirst("div.Nx9bqj");

        if (priceElement != null) {
            Double price = cleanPrice(priceElement.text());

            if (price != null && price >= 50) {
                return price;
            }
        }

        Element fallbackElement = document.selectFirst("div._30jeq3");

        if (fallbackElement != null) {
            Double price = cleanPrice(fallbackElement.text());

            if (price != null && price >= 50) {
                return price;
            }
        }

        return null;
    }

    private Double extractGenericPrice(Document document) {

        Element priceElement = document.selectFirst(
                "[data-price], .price, .product-price, .sale-price, .current-price, .amount"
        );

        if (priceElement == null) {
            return null;
        }

        String dataPrice = priceElement.attr("data-price");

        if (dataPrice != null && !dataPrice.trim().isEmpty()) {
            Double price = cleanPrice(dataPrice);

            if (price != null && price >= 50) {
                return price;
            }
        }

        Double price = cleanPrice(priceElement.text());

        if (price != null && price >= 50) {
            return price;
        }

        return null;
    }

    private Double cleanPrice(String rawPrice) {

        if (rawPrice == null || rawPrice.trim().isEmpty()) {
            return null;
        }

        String cleaned = rawPrice
                .replace("₹", "")
                .replace(",", "")
                .replace("Rs.", "")
                .replace("Rs", "")
                .replace("INR", "")
                .trim();

        cleaned = cleaned.replaceAll("[^0-9.]", "");

        if (cleaned.isEmpty()) {
            return null;
        }

        try {
            return Double.parseDouble(cleaned);
        } catch (Exception e) {
            return null;
        }
    }

    private Double extractFirstRupeePrice(String text) {

        try {
            if (text == null || text.trim().isEmpty()) {
                return null;
            }

            java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("₹\\s?([0-9,]+(?:\\.\\d{1,2})?)");
            java.util.regex.Matcher matcher = pattern.matcher(text);

            while (matcher.find()) {
                String value = matcher.group(1);

                if (value != null) {
                    String cleaned = value.replace(",", "").trim();

                    if (!cleaned.isEmpty()) {
                        Double price = Double.parseDouble(cleaned);

                        if (price >= 50) {
                            return price;
                        }
                    }
                }
            }

        } catch (Exception e) {
            return null;
        }

        return null;
    }

    private Double extractPriceFromAmazonHtml(String html) {

        if (html == null || html.trim().isEmpty()) {
            return null;
        }

        try {
            java.util.regex.Pattern rupeePattern = java.util.regex.Pattern.compile("₹\\s?([0-9,]+(?:\\.\\d{1,2})?)");
            java.util.regex.Matcher rupeeMatcher = rupeePattern.matcher(html);

            while (rupeeMatcher.find()) {
                String value = rupeeMatcher.group(1);

                if (value != null) {
                    String cleaned = value.replace(",", "").trim();

                    if (!cleaned.isEmpty()) {
                        Double price = Double.parseDouble(cleaned);

                        if (price >= 50) {
                            return price;
                        }
                    }
                }
            }

            java.util.regex.Pattern displayPricePattern = java.util.regex.Pattern.compile(
                    "\"displayPrice\"\\s*:\\s*\"₹\\s?([0-9,]+(?:\\.\\d{1,2})?)\""
            );
            java.util.regex.Matcher displayPriceMatcher = displayPricePattern.matcher(html);

            if (displayPriceMatcher.find()) {
                String value = displayPriceMatcher.group(1);
                String cleaned = value.replace(",", "").trim();

                if (!cleaned.isEmpty()) {
                    Double price = Double.parseDouble(cleaned);

                    if (price >= 50) {
                        return price;
                    }
                }
            }

            java.util.regex.Pattern amountPattern = java.util.regex.Pattern.compile(
                    "\"amount\"\\s*:\\s*([0-9]+(?:\\.\\d+)?)"
            );
            java.util.regex.Matcher amountMatcher = amountPattern.matcher(html);

            while (amountMatcher.find()) {
                String value = amountMatcher.group(1);

                if (value != null) {
                    Double price = Double.parseDouble(value);

                    if (price >= 50) {
                        return price;
                    }
                }
            }

        } catch (Exception e) {
            return null;
        }

        return null;
    }

    private boolean isAmazonBlockedPage(String pageText, String title, String marketplaceName) {

        String safeText = pageText == null ? "" : pageText.toLowerCase();
        String safeTitle = title == null ? "" : title.toLowerCase();
        String safeMarketplace = marketplaceName == null ? "" : marketplaceName.toLowerCase();

        if (!safeMarketplace.contains("amazon")) {
            return false;
        }

        if (safeTitle.equals("amazon.in")) {
            return true;
        }

        if (safeText.contains("click the button below to continue shopping")) {
            return true;
        }

        if (safeText.contains("continue shopping")) {
            return true;
        }

        if (safeText.contains("sorry, we just need to make sure you're not a robot")) {
            return true;
        }

        if (safeText.contains("enter the characters you see below")) {
            return true;
        }

        if (safeText.contains("conditions of use & sale") && safeText.contains("continue shopping")) {
            return true;
        }

        return false;
    }
}