# PricePilot AI — Backend

Spring Boot 3.5 + Java 17 + PostgreSQL.

## Setup (Eclipse)

1. **File → Import → Existing Maven Projects → select this folder**
2. Maven downloads dependencies on first import.
3. Configure PostgreSQL in `src/main/resources/application.properties`:
   - DB url: `jdbc:postgresql://localhost:5432/pricepilot`
   - Create the `pricepilot` database before first run.
4. (Optional) Set env vars before launch:
   - `GEMINI_API_KEY` — for AI explanations
   - `SCRAPERAPI_KEY` — for competitor scraping fallback
5. Run `BackendApplication.java` as a Spring Boot app.

Server starts on `:9090`.

## Run from CLI

```bash
./mvnw spring-boot:run
```

## Swagger UI

`http://localhost:9090/swagger-ui/index.html`

## What changed

- Added `appliedAt` field to `Recommendation` entity with `@PrePersist` / `@PreUpdate`
- Null-safe enum mapping in `RecommendationService.mapToResponse` (no NPE if risk/status null)
- `PricingEngineService`: null-check on `healthScore` before unboxing
- `ScrapeAndRecommendRequest` gets `masterProductId` field + wired through `ScrapeAndRecommendService`
- Duplicate `@CrossOrigin(origins = "*")` removed from controllers (single source of truth: `CorsConfig`)
- `applyRecommendation` now stamps `appliedAt`

## Modules

- `ai/` — Gemini explanation service
- `analytics/` — recommendation stats + before/after
- `competitor/` — Jsoup + ScraperAPI fallback
- `discount/` — lifecycle + scheduler (expires ACTIVE → EXPIRED)
- `pricing/` — ProfitGuard, HealthScore, PricingEngine, PriceSnapshot
- `recommendation/` — generate, approve, reject, apply
- `sales/` — daily metrics + 7-day summary
