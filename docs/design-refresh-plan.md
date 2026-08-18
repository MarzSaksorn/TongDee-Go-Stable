# Design Refresh Plan — Travel App Exploration (Dribbble shot 25561391)

Status: **research phase, not started** · Created: 2026-08-16

## 1. Source and provenance

- Reference design: [Travel app design exploration — Dribbble shot 25561391](https://dribbble.com/shots/25561391-Travel-app-design-exploration)
- Local copy: `C:\Users\admin\Downloads\original-ccd0a1d8bbe9168ca2388859ac943595.webp` (1600x1200 WebP)
- PNG conversion for tooling: `C:\Users\admin\Downloads\shot-design.png` (via sharp-cli)

**Caveats:**
- Dribbble blocks automated fetching and the shot is not yet search-indexed; the embedded XMP metadata is empty.
- The analyzing session had no image vision, so layout details (typography, exact screens) are **inferred** from the shot title, measured palette, and 2026 travel-UI conventions — see the verification checklist in section 6 before treating the screen inventory as fact.

## 2. Measured design facts (pixel analysis, real numbers)

Sampled at 80x60, quantized to 16-step buckets:

| Property | Value |
|---|---|
| Format / size | WebP, 1600x1200 (Dribbble 4:3 shot canvas) |
| Theme balance | 66% light / 34% dark — light-dominant design |
| Dominant tones | ~25% near-black (presentation frame or a dark screen), ~20% near-white surfaces |
| Header/hero band (top 25%) | Lime-green accent, approx `#B6E241` / `#D0F241` |
| Accent scatter (mid/lower) | Magenta/pink ~`#DE3589` / `#F42CC9` · amber ~`#FFA101` · cyan ~`#07F8E5` · blue ~`#0D6FFD` · violet ~`#A001FD` |
| Bottom rows | Transparent padding |

Interpretation: a bright, vibrant travel-discovery UI — lime-green primary + multi-color accent system (one color per destination/category is the likely pattern).

## 3. Probable screen inventory (inferred — verify against the shot)

1. **Home / Discovery** — hero destination, category chips, horizontal destination-card carousel
2. **Search** — destination search with suggestions + date/people selectors
3. **Destination detail** — full-bleed image header, rating/price overlay, description, action bar
4. **Itinerary / Trip plan** — day-by-day timeline of stops
5. **Booking / hotel listing** — hotel cards with rating, price, amenities
6. **Navigation + onboarding** — 4-5 tab pill bottom nav, welcome/onboarding flow

## 4. Linked 21st.dev components

All free to browse; install via `npx shadcn@latest add <url>`. Note: search/list metadata is free; code retrieval (`get_component`) is metered on the free tier.

| Screen | 21st.dev component | Author / ID | Install |
|---|---|---|---|
| Home / discovery | [3D Card — destination card w/ booking](https://21st.dev/@kavikatiyar/components/3d-card) | kavikatiyar · 7863 | `npx shadcn@latest add "https://21st.dev/r/kavikatiyar/3d-card?api_key=$API_KEY_21ST"` |
| Home / discovery | [Travel Route Card](https://21st.dev/@kavikatiyar/components/card-7) | kavikatiyar · 7639 | `npx shadcn@latest add "https://21st.dev/r/kavikatiyar/card-7?api_key=$API_KEY_21ST"` |
| Home / discovery | [Activity Card (image, duration, distance)](https://21st.dev/@ravikatiyar162/components/card-25) | ravikatiyar162 · 7796 | `npx shadcn@latest add "https://21st.dev/r/ravikatiyar162/card-25?api_key=$API_KEY_21ST"` |
| Destination detail | [Trip Details Card (header + action bar)](https://21st.dev/@kavikatiyar/components/trip-details-card) | kavikatiyar · 7957 | `npx shadcn@latest add "https://21st.dev/r/kavikatiyar/trip-details-card?api_key=$API_KEY_21ST"` |
| Itinerary | [Planner Card (route, duration, elevation, CTA)](https://21st.dev/@ravikatiyar162/components/planner-card) | ravikatiyar162 · 8349 | `npx shadcn@latest add "https://21st.dev/r/ravikatiyar162/planner-card?api_key=$API_KEY_21ST"` |
| Itinerary | [Timeline (chronological stops)](https://21st.dev/@preetsuthar17/components/timeline) | preetsuthar17 · 5157 | `npx shadcn@latest add "https://21st.dev/r/preetsuthar17/timeline?api_key=$API_KEY_21ST"` |
| Search | [Suggestive Search](https://21st.dev/@user_hardp/components/suggestive-search) | user_hardp · 6761 | `npx shadcn@latest add "https://21st.dev/r/user_hardp/suggestive-search?api_key=$API_KEY_21ST"` |
| Search | [Autocomplete (Base UI)](https://21st.dev/@coss.com/components/coss-autocomplete) | coss.com · 11338 | `npx shadcn@latest add "https://21st.dev/r/coss.com/coss-autocomplete?api_key=$API_KEY_21ST"` |
| Booking | [Hotel Card UI Component](https://21st.dev/@uniquesonu/components/hotel-card-ui-component) | uniquesonu · 8099 | `npx shadcn@latest add "https://21st.dev/r/uniquesonu/hotel-card-ui-component?api_key=$API_KEY_21ST"` |
| Booking | [Hotel Card (image, name, location, rating)](https://21st.dev/@lavikatiyar/components/card) | lavikatiyar · 7504 | `npx shadcn@latest add "https://21st.dev/r/lavikatiyar/card?api_key=$API_KEY_21ST"` |
| Onboarding | [Onboarding / Welcome Screen](https://21st.dev/@ravikatiyar162/components/onboarding-welcome-screen) | ravikatiyar162 · 7580 | `npx shadcn@latest add "https://21st.dev/r/ravikatiyar162/onboarding-welcome-screen?api_key=$API_KEY_21ST"` |
| Onboarding | [Onboarding Dialog (multi-step carousel)](https://21st.dev/@patrick-xin/components/onboarding-dialog) | patrick-xin · 10480 | `npx shadcn@latest add "https://21st.dev/r/patrick-xin/onboarding-dialog?api_key=$API_KEY_21ST"` |
| Navigation | [Bottom Nav Bar (pill, animated labels)](https://21st.dev/@arunachalam/components/bottom-nav-bar) | arunachalam · 8343 | `npx shadcn@latest add "https://21st.dev/r/arunachalam/bottom-nav-bar?api_key=$API_KEY_21ST"` |
| Navigation | [Animated Tab Bar](https://21st.dev/@abxlfazl__/components/animated-tab-bar) | abxlfazl__ · 4669 | `npx shadcn@latest add "https://21st.dev/r/abxlfazl__/animated-tab-bar?api_key=$API_KEY_21ST"` |
| Social proof | [Testimonial Card (star rating)](https://21st.dev/@preetsuthar17/components/testimonial-card) | preetsuthar17 · 926 | `npx shadcn@latest add "https://21st.dev/r/preetsuthar17/testimonial-card?api_key=$API_KEY_21ST"` |
| Scheduling | [Date Wheel Picker (iOS-style)](https://21st.dev/@johuniq/date-wheel-picker) | johuniq · 10449 | `npx shadcn@latest add "https://21st.dev/r/johuniq/date-wheel-picker?api_key=$API_KEY_21ST"` |

**Theme/template gap:** no matching vibrant-lime theme or travel-app template exists in the 21st catalog (searches returned empty). Options: (a) generate via 21st AI sketch mode with the measured palette (`#B6E241` lime + `#FE0D6F` magenta), or (b) re-search with the designer's exact color naming once known.

## 5. Thong Dee Go integration mapping

If the goal is refreshing this app with the shot's design language, replace existing sections:

| Existing code | Replace with |
|---|---|
| Inlined 5-tab bottom nav in `src/App.tsx` (lines ~1308-1371) | `Bottom Nav Bar` (8343) or `Animated Tab Bar` (4669) — also fixes current a11y gaps |
| `src/components/OnboardingView.tsx` (screen 2) | `Onboarding Dialog` (10480) or `Onboarding / Welcome Screen` (7580) |
| `HomeView` destination carousel | `3D Card` (7863) / `Travel Route Card` (7639) / `Activity Card` (7796) |
| `PlaceDetailView` / `LocationDetailFullScreenView` action area | `Trip Details Card` (7957) |
| `TripDetailPlanView` itinerary stops | `Timeline` (5157) / `Planner Card` (8349) |
| `HotelSelectionView` accommodation cards | `Hotel Card` (8099 / 7504) |
| `HomeView` search entry | `Suggestive Search` (6761) / `Autocomplete` (11338) |

**Palette adoption (DB + tokens):**
- Add the lime + neon accent set to `src/theme/accentThemes.ts` as a new preset (e.g. `lime`)
- The `user_settings.primary_accent` CHECK constraint currently allows `blue|teal|emerald|orange|purple|rose|custom` — a new preset needs a Supabase migration: `ALTER TABLE user_settings DROP CONSTRAINT ...; ADD CONSTRAINT ... CHECK (primary_accent = ANY (ARRAY[... ,'lime']))`
- Run the design gates after any UI change: `node scripts/accuracy_report.mjs`, `node scripts/verify_responsive.mjs`, `node scripts/verify_states.mjs`

## 6. Verification checklist (before implementing)

- [ ] Confirm the screen inventory (section 3) against the actual shot in a vision-capable session
- [ ] Confirm the palette values by eye (measured approximations, not exact Dribbble swatches)
- [ ] Decide scope: full refresh vs. palette + nav + one screen as a pilot
- [ ] Bookmark the 16 components on the 21st account (or leave a bookmark list named `tongdee-design-refresh`)
- [ ] Decide on theme generation route: 21st AI sketch vs. hand-built tokens

## 7. Open questions

1. Which screens from section 3 actually appear in the shot? (needs a human look)
2. Is the lime accent the primary CTA color, or a category color?
3. Dark-mode variant: the shot is 66% light — does the app keep its existing dark mode, or is this a light-only refresh?
4. Budget: 21st free-tier daily quota for `get_component` code retrieval (16 components may span multiple days)
