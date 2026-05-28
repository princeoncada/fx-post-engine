# Page Constitution — ALSHIZAMIN FX Engine

## Mission

To provide the ALSHIZAMIN Money Changer Facebook Page with a daily, accurate, visually compelling post about currency movements vs the Philippine Peso — so that ALSHIZAMIN's audience stays informed and knows to contact ALSHIZAMIN when they need to exchange currency.

---

## Audience

- **Primary:** Davao City residents who regularly exchange foreign currency — OFW families receiving remittances, business owners paying international suppliers, travelers
- **Secondary:** Filipino currency watchers and financial-minded Facebook followers

---

## Content Pillars

### 1. Currency Movement Intelligence
Daily snapshot of the top 3 currencies with the largest movement vs PHP. Clean, unambiguous numbers. Always includes the market data date and retrieval time.

### 2. Brand Visibility
Every post carries ALSHIZAMIN's location, contact numbers, and a message CTA. The audience knows exactly who to call when they see today's rates and decide to exchange.

### 3. Trust and Transparency
The "market reference only" disclaimer is non-negotiable. ALSHIZAMIN's actual buying/selling rates vary — the post informs, but does not mislead.

---

## Publishing Principles

1. **Post daily, or not at all.** A post with stale data (yesterday's rates presented as today's) is worse than no post. The retrieval date is displayed on every card.

2. **Review before posting.** The operator must see the generated cards and caption before uploading. The dashboard is designed for this — generate, review, then upload.

3. **One content format.** The card format (3 movers, 1080×1080 each) is the ALSHIZAMIN FX post format. It should not be changed frequently. Consistency builds audience recognition.

4. **Data is the message.** The numbers are the content. No editorial, no predictions, no commentary. The caption provides context (dates, contact info) — not analysis.

5. **The disclaimer stays.** "Market reference only. Actual buying and selling rates may vary depending on availability and transaction time." This line must appear in every caption and on every card footer.

---

## Voice Guidelines

| Do | Don't |
|----|-------|
| State the facts: "Top 3 Currency Movers" | Sensationalize: "HUGE currency spike today!!" |
| Use Philippine Peso as the reference point | Use US Dollar as the default reference |
| Include PHT timestamps | Use ambiguous or UTC dates |
| Link to ALSHIZAMIN's contact info | Link to external rate comparison sites |
| Maintain consistent post format | Change card design without a version bump |

---

## Content Calendar Philosophy

FX Post Engine is a **daily content system**, not a campaign tool. There is no editorial calendar. The only question each day is: "Has today's post been generated and uploaded?"

The operator is responsible for:
1. Running `npm run dev` to start the local server
2. Clicking **Generate Latest FX Post** when ready
3. Reviewing the cards and caption
4. Clicking **Upload to Facebook Page** to publish

When Phase 1.1.0 is implemented, this becomes: verify that the scheduled script ran successfully.

---

## Relationship to ALSHIZAMIN's Broader Social Strategy

FX Post Engine handles one specific content type: the daily rate update post. ALSHIZAMIN's other social content (promotions, store announcements, cultural posts) is managed separately outside this system. This app does not attempt to manage all of ALSHIZAMIN's social media — only the automated FX data posts.
