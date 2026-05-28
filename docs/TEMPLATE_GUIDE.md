# Template Guide — FX Post Engine

## Core Principle

Templates are stable visual systems. A card's layout, dimensions, typography scale, and color palette are fixed once a template version is declared stable. Visual changes require either a minor version bump or a new template variant.

---

## Template Registry

| Template | Component | Status | Since | Dimensions |
|----------|-----------|--------|-------|------------|
| fx_card_v1 | `FxMoverCard.tsx` | active | 1.0.0 | 1080×1080px |
| fx_post_v1 | `FxPostTemplate.tsx` | active (preview only) | 1.0.0 | 1080×1350px |

---

## Template: fx_card_v1 (FxMoverCard)

**File:** `components/FxMoverCard.tsx`  
**Status:** Active — used for all Facebook card images  
**Output:** Playwright screenshots this as a PNG at 1080×1080  

### Props

```typescript
type Props = {
  mover: FxMover;             // currency data (code, rates, changePercent, direction)
  rank: number;               // 1, 2, or 3
  marketDateLabel: string;    // formatted PHT date for market data (short format)
  retrievedDateLabel: string; // formatted PHT date for retrieval (short format)
};
```

### Layout Zones

```
┌──────────────────────────────────────────┐
│  [Background image: /assets/fx-card-bg]  │
│                                          │
│  (top ~360px: background shows through)  │
│                                          │
│  ┌ Badge ──────────────────────────────┐ │
│  │ "Top mover" / "Second mover" / etc. │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌ Heading ────────┐  ┌ Stats Card ───┐ │
│  │ USD             │  │ Daily Movement│ │
│  │ (158px)         │  │ + 2.45 %      │ │
│  │ vs Philippine   │  │ (108px)       │ │
│  │ Peso (42px gold)│  └───────────────┘ │
│  └─────────────────┘                    │
│                                          │
│  Current ₱ 57.23 | Previous ₱ 55.99    │
│                                          │
│  ── Footer divider ─────────────────── │
│  Latest market data: [date]              │
│  Retrieved: [date] PHT                   │
│  Market reference only. Message us...   │
└──────────────────────────────────────────┘
```

### Key Measurements (Tailwind classes)

| Element | Class notes |
|---------|-------------|
| Card dimensions | `h-[1080px] w-[1080px]` |
| Padding | `px-[92px] pb-[72px] pt-[360px]` |
| Currency code | `text-[158px] font-black leading-[0.82] tracking-[-0.08em]` |
| % change | `text-[108px] font-black leading-[0.82]` |
| Rate values | `text-[42px] font-black tracking-[-0.04em]` |
| Badge | `text-[21px] font-bold uppercase tracking-[0.18em]` |

### Rank Labels

| Rank | Label |
|------|-------|
| 1 | "Top mover" |
| 2 | "Second mover" |
| 3 | "Third mover" |
| n > 3 | "Top {n}" |

### Colors Used

| Element | Color |
|---------|-------|
| Background | `#F4E8D3` (cream) |
| Currency code | `#073D31` (deep forest) |
| "vs Philippine Peso" | `#9B762C` (gold) |
| % change number | `#073D31` (deep forest) |
| "Daily Movement" label | `#766A55` (warm sand) |
| Badge text | `#9B762C` (gold) |
| Badge border | `#C79A3E/35` |
| Current rate | `#073D31` (deep forest) |
| Previous rate | `#9B762C` (gold) |
| Footer date text | `#073D31` |
| Footer body text | `#6B5F4D` |

---

## Template: fx_post_v1 (FxPostTemplate)

**File:** `components/FxPostTemplate.tsx`  
**Status:** Active — preview only (not screenshotted for Facebook)  
**Note:** This is a full-post layout showing all 5 movers. It is used for preview via `app/fx-post/` and is NOT currently screenshotted by Playwright or uploaded to Facebook.

### Props

```typescript
type Props = {
  marketDateLabel: string;    // formatted PHT date (long format)
  retrievedDateLabel: string; // formatted PHT date (long format)
  movers: FxMover[];          // array of movers (typically 5)
};
```

### Dimensions
- 1080×1350px (portrait, Facebook-compatible)

---

## Template Change Policy

1. **Typography scale changes** require a minor version bump (1.x.0)
2. **Color palette changes** require a minor version bump (1.x.0)
3. **Dimension changes** require a minor version bump AND updating Playwright viewport in `screenshot.ts`
4. **New visual elements** (additional badges, background effects) require a minor version bump
5. **Copy changes on cards** (e.g. "Market reference only" footer text) require user approval before implementation

When a template changes, update this file with the new specs and bump the template registry entry.

---

## Template File Naming

Templates are named `{descriptor}_v{version}` in the registry.  
Component filenames follow React conventions: `FxMoverCard.tsx`, `FxPostTemplate.tsx`.  
If a second card design is created (e.g. for a different campaign), it becomes `FxMoverCard_v2.tsx` and `fx_card_v2` in the registry.

---

## Playwright Screenshot Requirements

`lib/fx/screenshot.ts` must be kept in sync with `fx_card_v1` dimensions:

```typescript
viewport: { width: 1080, height: 1080 }
deviceScaleFactor: 1
```

Any dimension change to FxMoverCard requires a matching update to `screenshotFxCards()` in `screenshot.ts`.
