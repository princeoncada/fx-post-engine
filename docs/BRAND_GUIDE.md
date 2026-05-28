# Brand Guide — ALSHIZAMIN FX Engine

## Business Identity

**Name:** ALSHIZAMIN Money Changer  
**Type:** Money changer and souvenir shop  
**Location:** City Triangle, Davao City (Front of Philippine Red Cross Building, beside Davao Post Office)  
**Contact:** 0916 904 6899 / 0993 957 7505  
**Facebook:** ALSHIZAMIN Money Changer page  

---

## Brand Personality

| Attribute | Description |
|-----------|-------------|
| Trustworthy | Rates are always labeled "market reference only" — honest about the difference between mid-market and actual rates |
| Local | Explicitly Davao-based. Speak to the Davao business community and OFW families. |
| Accessible | Clear numbers, no jargon. Audience ranges from business owners to individuals sending remittances. |
| Professional | Not flashy. Financial services carry weight — the design should feel stable and credible. |

---

## Visual Identity

### Color Palette

| Name | Hex | Usage |
|------|-----|-------|
| Cream | `#F4E8D3` | Background base for all cards and dashboard |
| Deep Forest | `#073D31` | Primary headings, currency codes, large text |
| Dark Teal | `#0B3A2F` | Dashboard primary action buttons, borders |
| Gold | `#9B762C` | Accents, "vs Philippine Peso" label, secondary text |
| Gold Light | `#C79A3E` | Badge borders, dividers |
| Warm Cream | `#FFF8EA` | Card panel backgrounds, badge fill |
| Warm Sand | `#766A55` | Secondary labels, uppercase metadata |
| Muted Earth | `#6B5F4D` | Body copy, descriptions, footer text |

### Typography

- **Font family:** System sans-serif via Tailwind CSS (`font-sans`)
- **Currency code:** 158px, font-black, tight tracking (−0.08em) — maximum visual impact
- **Percentage change:** 108px, font-black — the hero number on each card
- **Labels:** 18–21px, font-semibold/bold, ALL CAPS, wide tracking (0.14–0.18em)
- **Body:** 21–24px, font-medium/bold, normal tracking

### Card Dimensions

| Template | Width | Height | Use |
|----------|-------|--------|-----|
| FxMoverCard | 1080px | 1080px | Individual card (Playwright screenshot, Facebook image) |
| FxPostTemplate | 1080px | 1350px | Full post preview (reference only, not screenshotted) |

### Card Background

The card background image is `/public/assets/fx-card-bg.png`.  
This is a **fixed brand asset**. It must never be regenerated, renamed, or replaced without explicit client approval.

---

## Tone of Voice

### Caption Tone
- Concise and direct
- Always includes the market data date and retrieval time
- Always includes the "market reference only" disclaimer
- Always ends with contact info and relevant hashtags
- Uses emoji sparingly: 📍 for location, ☎️ for phone, 💬 for message CTA

### What to Avoid
- Do not use hype language ("🔥 HOT RATES TODAY!!")
- Do not make claims about ALSHIZAMIN's actual rates in generated content
- Do not omit the "market reference only" disclaimer — this is legally important
- Do not change contact info without explicit client approval

---

## Hashtag Set

Standard hashtags included in every caption (from `lib/fx/caption.ts`):

```
#ALSHIZAMIN #MoneyChangerDavao #CurrencyExchangeDavao #DavaoMoneyChanger
#ForeignExchangeDavao #PHPExchangeRate #DavaoCity #DavaoBusiness
```

These must not be changed without client approval.

---

## Caption Template (Reference)

```
Top 3 Currency Movers | Retrieved on [retrievedDate] (PHT)

Latest Market Data: [marketDate].

Exchange rates move daily. For updated buying and selling rates in Davao City, message ALSHIZAMIN Money Changer today.

Market reference only. Actual buying and selling rates may vary depending on availability and transaction time.

📍 ALSHIZAMIN Money Changer
City Triangle, Davao City
Front of Philippine Red Cross Building
Beside Davao Post Office

☎️ 0916 904 6899
☎️ 0993 957 7505

💬 Message us for today's exchange rates.

#ALSHIZAMIN #MoneyChangerDavao ...
```

Source: `lib/fx/caption.ts`
