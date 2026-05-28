# API Guide — FX Post Engine

## External APIs Used

| API | Purpose | Auth |
|-----|---------|------|
| Frankfurter.dev v1 | FX rate data | None (public) |
| Facebook Graph API | Photo upload + feed publishing | Page Access Token |

---

## Frankfurter.dev API

**Base URL:** `https://api.frankfurter.dev/v1/`  
**Auth:** None required  
**Rate limit:** Undocumented; treat as "be reasonable"

### Endpoints Used

#### Get rates for a specific date
```
GET /v1/{date}?base=PHP&symbols=USD,EUR,...
```

Parameters:
- `base=PHP` — rate base currency
- `symbols=` — comma-separated list from `CURRENCIES` in `lib/fx/currencies.ts`
- `date` — `YYYY-MM-DD` or `latest`

Response:
```json
{
  "date": "2026-05-23",
  "base": "PHP",
  "rates": {
    "USD": 0.017376,
    "EUR": 0.015893,
    ...
  }
}
```

**Important:** `rates` values are in `{symbol}/PHP` units — how many units of the symbol equal 1 PHP. To get PHP value of 1 unit: `phpPerUnit = 1 / rate`.

#### Handling non-trading days
Frankfurter returns the closest available trading day's data. The `date` field in the response may differ from the requested date. `fetchPreviousDistinctRates()` exploits this: it walks back one day at a time and accepts the first response whose `date` differs from the current day's `date`.

```typescript
// Returns the first previous trading day's data
export async function fetchPreviousDistinctRates(date: string): Promise<FxRatesResponse>
```

Maximum lookback: 10 days (handles extended holiday periods).

### Error Handling
- Non-OK HTTP responses throw `Error("Failed to fetch FX rates: {status}")`
- If no previous distinct date is found within 10 attempts: throws `Error("Could not find a previous FX market date before {date}")`

---

## Facebook Graph API

**Base URL:** `https://graph.facebook.com/`  
**Auth:** Page Access Token (stored in `META_PAGE_ACCESS_TOKEN` env var)  
**Graph version:** Configurable via `META_GRAPH_VERSION` env var (default: `v25.0`)

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `META_PAGE_ID` | Yes | ALSHIZAMIN Facebook Page ID (numeric string) |
| `META_PAGE_ACCESS_TOKEN` | Yes | Long-lived Page Access Token |
| `META_GRAPH_VERSION` | No | Graph API version (default: `v25.0`) |

### Operations

#### 1. Page Check
```
GET /{graphVersion}/{pageId}?fields=id,name,access_token&access_token={token}
```

Verifies the token is valid and retrieves a page-scoped token if available. The `access_token` field in the response (if present) is used as `effectivePageAccessToken` for all subsequent operations.

#### 2. Upload Photo (Unpublished)
```
POST /{graphVersion}/{pageId}/photos

Form fields:
  source: {binary PNG file}
  published: "false"
  access_token: {effectivePageAccessToken}
```

Response:
```json
{ "id": "{photo_id}" }
```

Retry policy: 3 attempts with delays `[1000ms, 3000ms, 7000ms]`.  
Retryable on: HTTP 500/502/503/504 or `error.code === 1` (transient Graph error).

#### 3. Create Feed Post
```
POST /{graphVersion}/{pageId}/feed

Form fields:
  message: {caption text}
  published: "true"
  access_token: {effectivePageAccessToken}
  attached_media[0]: {"media_fbid": "{photo_id_1}"}
  attached_media[1]: {"media_fbid": "{photo_id_2}"}
  attached_media[2]: {"media_fbid": "{photo_id_3}"}
```

Response:
```json
{ "id": "{post_id}" }
```

#### 4. Photo Cleanup (on feed post failure)
```
DELETE /{graphVersion}/{photo_id}?access_token={token}
```

Runs automatically if the feed post fails, to clean up orphaned unpublished photos.

### Error Handling

All Facebook errors throw `FacebookPostError` with structured details:

```typescript
class FacebookPostError extends Error {
  details: {
    stage: "config" | "page-check" | "photo-upload" | "feed-publish" | "photo-cleanup";
    status?: number;          // HTTP status code
    graphCode?: number;       // Facebook error.code
    graphSubcode?: number;    // Facebook error.error_subcode
    fbtraceId?: string;       // Facebook fbtrace_id for support
    imageIndex?: number;      // which image failed (0-indexed)
    attempts?: number;        // how many retry attempts were made
    uploadedPhotoIds?: string[]; // IDs already uploaded (for cleanup reference)
  };
}
```

### Token Management

- The Page Access Token should be a **long-lived token** (60-day expiry unless using a System User token)
- Token is stored in `.env.local` → `META_PAGE_ACCESS_TOKEN`
- `.env.local` is in `.gitignore` and must never be committed
- `maskToken()` in `post-to-facebook.ts` masks tokens in debug logs (first 8 + last 6 chars)

### Debugging

All Facebook operations emit structured debug logs via `logFacebookStep()`:
- `[FACEBOOK DEBUG] ENV` — shows env var presence and token preview
- `[FACEBOOK DEBUG] PAGE CHECK` — shows page check result
- `[FACEBOOK DEBUG] IMAGE {n}` — shows path resolution for each image
- `[FACEBOOK DEBUG] UPLOAD {n} REQUEST/RESPONSE` — shows each photo upload
- `[FACEBOOK DEBUG] ALL UPLOADED PHOTO IDS` — shows all IDs before feed post
- `[FACEBOOK DEBUG] FEED REQUEST/RESPONSE` — shows feed publish attempt

Check server console output when debugging Facebook posting issues.

---

## Internal API Routes

### GET /api/generate-fx-post

**Status:** Local only (blocked on Vercel)  
**Handler:** `app/api/generate-fx-post/route.ts`

**Flow:**
1. Check `VERCEL` env → return 403 if production
2. `loadFxMovers(3)` → fetch rates + calculate top 3 movers
3. `generateCaption(latestData.date, retrievedDate)` → build caption
4. `screenshotFxCards(latestData.date)` → render 3 PNG cards via Playwright

**Response:**
```json
{
  "date": "2026-05-23",
  "retrievedDate": "2026-05-24",
  "previousDate": "2026-05-22",
  "imagePaths": [
    "/generated/fx-mover-1-2026-05-23.png",
    "/generated/fx-mover-2-2026-05-23.png",
    "/generated/fx-mover-3-2026-05-23.png"
  ],
  "caption": "Top 3 Currency Movers | Retrieved on...",
  "movers": [
    {
      "code": "USD",
      "currentRateToPhp": 57.52,
      "previousRateToPhp": 55.99,
      "changePercent": 2.73,
      "direction": "up"
    }
    ...
  ]
}
```

---

### POST /api/post-facebook

**Status:** Local only (blocked on Vercel)  
**Handler:** `app/api/post-facebook/route.ts`

**Request body:**
```json
{
  "imagePaths": ["/generated/fx-mover-1-...", ...],
  "caption": "Top 3 Currency Movers | ..."
}
```

**Validation:**
- `imagePaths` must be a non-empty array → 400 if invalid
- `caption` must be a non-empty string → 400 if invalid

**Response (success):**
```json
{
  "success": true,
  "postId": "123456789_987654321",
  "uploadedPhotoIds": ["111", "222", "333"]
}
```

**Response (failure):**
```json
{
  "error": "Photo upload failed.",
  "details": {
    "stage": "photo-upload",
    "status": 503,
    "imageIndex": 1,
    "attempts": 3
  }
}
```
