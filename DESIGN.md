---
name: Tong Dee Go
description: A mobile-first local travel assistant for safe, culturally rooted trips around Phichai and Uttaradit.
colors:
  tongdee-blue: "#1E5BFF"
  tongdee-blue-deep: "#173FCC"
  tongdee-blue-soft: "#DBEAFE"
  tongdee-blue-wash: "#EFF6FF"
  app-bg: "#F7F9FC"
  app-bg-soft: "#F5F8FC"
  surface: "#FFFFFF"
  ink: "#0F172A"
  body: "#1F2937"
  muted: "#64748B"
  quiet: "#94A3B8"
  border: "#E2E8F0"
  safety: "#10B981"
  safety-soft: "#D1FAE5"
  local-amber: "#F59E0B"
  warning: "#F97316"
  danger: "#F43F5E"
typography:
  display:
    fontFamily: "Prompt, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Prompt, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 800
    lineHeight: 1.2
  title:
    fontFamily: "Prompt, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 800
    lineHeight: 1.25
  body:
    fontFamily: "Prompt, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.55
  label:
    fontFamily: "Prompt, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 800
    lineHeight: 1.2
  mono:
    fontFamily: "JetBrains Mono, ui-monospace, SFMono-Regular, monospace"
    fontSize: "0.6875rem"
    fontWeight: 700
    lineHeight: 1.3
rounded:
  control: "16px"
  chip: "12px"
  card: "22px"
  sheet: "30px"
  full: "999px"
spacing:
  page-x: "16px"
  gap: "14px"
  card-padding: "14px"
  button-height: "42px"
  input-height: "42px"
  icon-box: "38px"
components:
  button-primary:
    backgroundColor: "{colors.tongdee-blue}"
    textColor: "{colors.surface}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "12px 16px"
    height: "{spacing.button-height}"
  button-primary-hover:
    backgroundColor: "{colors.tongdee-blue-deep}"
    textColor: "{colors.surface}"
    rounded: "{rounded.control}"
  button-soft:
    backgroundColor: "{colors.tongdee-blue-wash}"
    textColor: "{colors.tongdee-blue}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "12px 16px"
  input-search:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.card}"
    padding: "0 16px"
    height: "{spacing.input-height}"
  card-default:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "{spacing.card-padding}"
  chip-selected:
    backgroundColor: "{colors.tongdee-blue}"
    textColor: "{colors.surface}"
    typography: "{typography.label}"
    rounded: "{rounded.chip}"
    padding: "6px 12px"
---

# Design System: Tong Dee Go

## 1. Overview

**Creative North Star: "The Community Route Kit"**

Tong Dee Go is a compact mobile toolkit for planning, moving, and feeling safe around Phichai. The interface should feel assembled for a real day out: route cards, map sheets, local service entries, safety notices, and marketplace previews all share one tactile vocabulary rather than becoming separate mini-brands.

The system is product-first and Thai-first. It uses familiar mobile controls, tight hierarchy, and clear status language so users can act while walking, riding, or checking a route. Warmth comes from local content, amber cultural cues, and community services, not from generic travel decoration.

It explicitly rejects generic tourism templates, placeless blue-and-white polish, government-portal stiffness, and decorative AI sparkle that weakens trust. Standard controls should remain recognizable; personality belongs in moments of local proof, buddy copy, safety reassurance, and community value.

**Key Characteristics:**
- Mobile app shell capped at 480px with safe-area aware bottom navigation.
- Restrained blue primary system with amber culture and emerald safety accents.
- Rounded, thumb-first controls with compact density and soft structural elevation.
- Thai-readable Prompt typography, with JetBrains Mono reserved for coordinates, numbers, codes, and technical details.
- Local specificity in content, imagery, labels, service names, and route context.

## 2. Colors

The palette is blue trust with local warmth: Tongdee Blue carries navigation, primary action, selection, and focus; amber carries cultural highlights and reward moments; emerald carries safety and successful trip state.

### Primary
- **Tongdee Blue** (`tongdee-blue`): primary actions, active bottom-nav states, selected chips, current progress, and key icon containers.
- **Deep Route Blue** (`tongdee-blue-deep`): hover states, gradients, dark header ends, and higher-contrast blue surfaces.
- **Soft Route Blue** (`tongdee-blue-soft`): focus rings, selected borders, and blue-tinted containers that need more presence than a wash.
- **Route Wash** (`tongdee-blue-wash`): subtle blue backgrounds, soft badges, and secondary action fills.

### Secondary
- **Local Amber** (`local-amber`): culture, festival, reward, badge, and heritage moments. Use it as a cue, not as a second primary action color.
- **Safety Emerald** (`safety`): safe mode, completed steps, success, verified provider status, and positive security feedback.

### Tertiary
- **OTOP Orange** (`warning`): marketplace, food, commerce, and warning-adjacent utility states when amber is too celebratory.
- **Festival Rose** (`danger`): destructive, urgent, or account-risk states. It must stay semantic, not decorative.

### Neutral
- **App Mist** (`app-bg`): default screen background for travel and planner surfaces.
- **Auth Mist** (`app-bg-soft`): slightly softer background used on auth and profile entry surfaces.
- **Card White** (`surface`): cards, search fields, modals, bottom sheets, and elevated navigation.
- **Ink Slate** (`ink`): headings and high-priority body text.
- **Readable Slate** (`body`): default body text.
- **Muted Slate** (`muted`): supporting copy that still needs readable contrast.
- **Quiet Slate** (`quiet`): metadata, placeholders, and tertiary labels only when contrast remains sufficient.
- **Hairline Slate** (`border`): dividers, card borders, and input strokes.

### Named Rules
**The Blue Earns the Tap Rule.** Tongdee Blue is for action, selection, current location, and focus. Do not spend it on decoration that is not actionable or stateful.

**The Local Warmth Rule.** Amber and orange mark culture, food, marketplace, and reward. They should make Phichai feel specific, never turn the whole app into a generic vacation palette.

**The Safety Is Semantic Rule.** Emerald means safety, success, verified, or completed. Never use emerald as arbitrary visual variety.

## 3. Typography

**Display Font:** Prompt, with system sans fallbacks.
**Body Font:** Prompt, with system sans fallbacks.
**Label/Mono Font:** JetBrains Mono for coordinates, timers, numbers, codes, and technical microcopy.

**Character:** Prompt gives Thai-first readability with rounded warmth that fits a local travel assistant. JetBrains Mono adds precision only where the UI needs to feel measured: coordinates, amounts, times, and debugging-like travel facts.

### Hierarchy
- **Display** (800, 1.5rem, 1.15): welcome titles, major screen titles, and key destination names. Keep it compact; this is an app, not a campaign page.
- **Headline** (800, 1.25rem, 1.2): planner headers, active trip names, detail sheet headings, and modal titles.
- **Title** (800, 1rem, 1.25): card titles, list headings, profile sections, and marketplace/product names.
- **Body** (500, 0.875rem, 1.55): descriptions, instructions, route notes, and help text. Cap long explanatory copy at roughly 65-75ch on wider surfaces.
- **Label** (800, 0.75rem, 1.2): buttons, chips, badges, tabs, state labels, and form labels.
- **Mono** (700, 0.6875rem, 1.3): coordinates, times, phone-like codes, prices, route details, and numeric stats.

### Named Rules
**The Thai Legibility Rule.** Thai copy must not be compressed into decorative tracking or ultra-light weights. Use weight and spacing for hierarchy, not letter-spaced novelty.

**The Mono Has a Job Rule.** JetBrains Mono is for facts and coordinates. Do not use it for brand flavor in ordinary labels.

## 4. Elevation

Tong Dee Go uses a hybrid of tonal layering and soft elevation. Most surfaces are white or blue-wash panels on mist backgrounds with a 1px border; shadows appear when an element floats above scroll content, needs thumb affordance, or overlays a map/image.

### Shadow Vocabulary
- **Primary Lift** (`0 10px 25px var(--app-primary-shadow)`): primary CTA emphasis, selected action buttons, and important floating blue controls.
- **Navigation Float** (`0 -10px 30px rgba(15, 23, 42, 0.10)`): bottom navigation and fixed action bars sitting above content.
- **Sheet Lift** (`0 -12px 30px rgba(15, 23, 42, 0.08)`): bottom sheets and detail action bars.
- **Card Whisper** (`0 4px 20px rgba(15, 23, 42, 0.03)`): active trip cards and quiet structural grouping.
- **Floating Buddy** (`0 10px 15px -3px var(--app-primary-shadow), 0 4px 6px -4px var(--app-primary-shadow)`): chat bubble and small floating assistant controls.

### Named Rules
**The Soft Lift Rule.** Shadows should feel like mobile affordance, not desktop depth. If a card looks heavier than the bottom nav, the shadow is too strong.

**The Border First Rule.** Default containers get a hairline border before they get a shadow. Use elevation when the user must understand stacking or tap priority.

## 5. Components

### Buttons
- **Shape:** softly rounded controls (16px radius), with larger route CTAs often using 18-24px.
- **Primary:** Tongdee Blue fill, white text, extra-bold label, 42-48px height, and a soft blue shadow for high-priority actions.
- **Hover / Focus:** deepen to Deep Route Blue on hover, use Soft Route Blue focus rings, and use `active:scale` feedback sparingly for tap confirmation.
- **Secondary / Ghost:** white or Route Wash fills with Tongdee Blue text and hairline borders. Guest links and low-priority account actions may remain text-only.

### Chips
- **Style:** compact rounded pills with extra-bold 10-12px labels.
- **State:** selected chips invert to Tongdee Blue with white text and a soft blue shadow; unselected chips stay slate-50 or white with subtle borders.
- **Use:** filters, interests, categories, safe-mode badges, and route metadata.

### Cards / Containers
- **Corner Style:** 22px default card radius, 30-40px for hero imagery, sheets, and destination panels.
- **Background:** Card White on App Mist, with blue washes only when the state is selected or action-oriented.
- **Shadow Strategy:** quiet cards use Card Whisper or no shadow; floating nav, modals, and bottom sheets use stronger structural shadows.
- **Border:** `border-slate-100` is the default separator; avoid heavy outlines.
- **Internal Padding:** compact mode uses 12-14px; normal mode uses 16px; comfortable mode uses 18-20px.

### Inputs / Fields
- **Style:** white background, slate border, 16-22px radius, 42-48px height, left icon when it helps scanning.
- **Focus:** Tongdee Blue border with Soft Route Blue ring. Search surfaces may use a stronger 4px soft ring.
- **Error / Disabled:** error copy and borders use rose; disabled stays slate with reduced contrast but must remain readable.
- **Placeholder:** placeholder text must meet contrast requirements; do not leave it as low-contrast pale gray on tinted backgrounds.

### Navigation
- **Bottom nav:** floating white pill above safe-area inset, 1px translucent border, soft upward shadow, active icon/text in Tongdee Blue.
- **Center nav action:** raised round action with blue fill, white icon, and a blue focus/active ring.
- **Headers:** white sticky headers for task surfaces; blue gradient headers for high-emotion surfaces such as planner/profile/safety.

### Signature Component: Map Bottom Sheet
The map sheet is a structural component, not a decorative card. It uses rounded top corners, drag handles, touch-safe gestures, and stateful transitions between compact, hidden, transitioning, and detail. The sheet must always preserve search, selected place, and escape/back affordances.

### Signature Component: Safety Mode Notice
Safety notices use emerald fills, clear labels, and explicit copy. Pulsing or ping animation is allowed only to show active monitoring, verified status, or live location state, and must have a reduced-motion alternative.

## 6. Do's and Don'ts

### Do:
- **Do** preserve `--app-primary` as the action/selection color and route all preset accents through the existing appearance system.
- **Do** design for one-handed mobile use: 42px minimum control height, 16px page gutters, safe-area aware fixed controls, and clear back/escape affordances.
- **Do** make local specificity visible with Phichai place names, service context, route copy, local operators, and cultural detail.
- **Do** pair color with labels or icons for safety, selected, completed, warning, and error states.
- **Do** keep motion short and functional: 150-250ms for state transitions, longer only for map/sheet gestures that track touch.
- **Do** test muted text and placeholders against App Mist and blue-wash surfaces before shipping.

### Don't:
- **Don't** make the app feel like a generic tourism template with interchangeable attraction cards, stock travel language, or placeless blue-and-white polish.
- **Don't** make it feel like a government portal: avoid bureaucratic stiffness, form-heavy dead ends, and overly official tone.
- **Don't** over-index on decorative AI sparkle at the expense of trust, legibility, and real trip utility.
- **Don't** use side-stripe borders (`border-left` or `border-right` greater than 1px) as a card or callout accent. Use full borders, background tint, icon/label structure, or timeline-specific geometry instead.
- **Don't** use gradient text. Tongdee Go uses solid text color, weight, and placement for emphasis.
- **Don't** create nested card stacks. Use spacing, dividers, or a single clear surface.
- **Don't** use arbitrary z-index numbers. Keep layers semantic: dropdown/search results above fields, sticky headers above content, modals above sheets, toast above modal, tooltip above toast.
