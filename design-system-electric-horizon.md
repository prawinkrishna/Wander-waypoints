# TREKIO DESIGN SYSTEM — Nature Meets Ocean Palette
## Production-Ready Color Codes & AI Coding Rules (2026)

**FILE NAME:** `design-system-electric-horizon.md`
**ENFORCEMENT:** AI MUST use ONLY the hex codes defined in this file.
**STATUS:** PRODUCTION READY
**PALETTE:** Three-Color Rule: 60-30-10 (Mint Green / Deep Charcoal / Ocean Blue)

---

## CORE BRAND COLORS (Three-Color Rule: 60-30-10)

### PRIMARY MINT GREEN SYSTEM (60% — Nav, headers, brand, backgrounds, buttons)
- **Primary:** `#48BB78` — Primary buttons, active nav, brand identity
- **Hover:** `#38A169` — Hover state (darker green)
- **Light:** `#68D391` — Icons, secondary elements (lighter green)
- **Active:** `#2F855A` — Pressed / active state
- **Tint:** `#F0FFF4` — Subtle backgrounds (very light green)
- **RGB:** `72, 187, 120`

### SECONDARY DEEP CHARCOAL (30% — Text, cards, structure, contrast)
- **Text Primary:** `#2D3748` — Headings, body text
- **Text Secondary:** `#4A5568` — Descriptions, labels
- **Text Tertiary:** `#A0AEC0` — Muted, placeholder

### ACCENT OCEAN BLUE SYSTEM (10% — CTAs, links, interactive elements, badges)
- **Accent:** `#4299E1` — Book Now CTAs, links, interactive highlights
- **Hover:** `#3182CE` — Hover state (darker blue)
- **Light:** `#63B3ED` — Badges, info elements
- **Active:** `#2B6CB0` — Pressed / active state
- **Tint:** `#EBF8FF` — Subtle blue backgrounds

---

## NEUTRAL SYSTEM (Foundation)

### LIGHT MODE (Default)
- Page Background: `#F7F9FA`
- Card Surface: `#FFFFFF`
- Primary Text: `#2D3748`
- Secondary Text: `#4A5568`
- Tertiary Text: `#A0AEC0`
- Borders: `#E2E8F0`
- Shadows: `rgba(0,0,0,0.08)`

### DARK MODE (Class-based toggle + system preference fallback)
- Page Background: `#1A202C`
- Card Surface: `#2D3748`
- Primary Text: `#F7FAFC`
- Secondary Text: `#A0AEC0`
- Tertiary Text: `#718096`
- Borders: `#4A5568`
- Shadows: `rgba(0,0,0,0.24)`
- Primary (dark): `#68D391` (lighter green for dark backgrounds)
- Accent (dark): `#63B3ED` (lighter blue for dark backgrounds)

---

## STATUS & SEMANTIC COLORS
- **Success:** `#48BB78` — Confirmed, verified
- **Warning:** `#ED8936` — Limited, pending
- **Error:** `#F56565` — Failed, validation
- **Info:** `#63B3ED` — Tips, help
- **Disabled:** `#A0AEC0`

---

## SOCIAL ENGAGEMENT COLORS
- Like / Heart: `#FF4757`
- Follow: `#9F7AEA`
- Share: `#319795`
- Comment: `#4299E1`

---

## COMPONENT COLOR RULES (MANDATORY)

### 1. BUTTONS (44px minimum height)

**PRIMARY ACTION**
- Background: `#48BB78`
- Text: `#FFFFFF`
- Hover: `#38A169`
- Active: `#2F855A`
- Focus Ring: `0 0 0 2px rgba(72,187,120,0.3)`
- Disabled: `#A0AEC0`

**CTA / ACCENT ACTION (Book Now, Sign Up)**
- Background: `#4299E1`
- Text: `#FFFFFF`
- Hover: `#3182CE`

**GHOST BUTTON**
- Background: `transparent`
- Text: `#48BB78`
- Hover BG: `#F0FFF4`

---

### 2. TRIP CARDS
- Background: `#FFFFFF`
- Border: `1px solid #E2E8F0`
- Title: `#2D3748`
- Location: `#4A5568`
- Price: `#48BB78`
- Like Active: `#FF4757`
- Shadow: `0 4px 12px rgba(0,0,0,0.08)`
- Hover Shadow: `0 8px 24px rgba(72,187,120,0.12)`

---

### 3. BOOKING SECTION
- Primary CTA ("Book Now"): `#4299E1`
- Secondary CTA: `#48BB78`
- Price Normal: `#2D3748`
- Price Discount: `#48BB78`
- Availability:
  - Available: `#48BB78`
  - Limited: `#ED8936`
  - Sold Out: `#F56565`

---

### 4. USER PROFILES
- Header Gradient: `linear-gradient(135deg, #48BB78 0%, #38A169 100%)`
- Username: `#FFFFFF`
- Bio: `#4A5568` / `#F7FAFC`
- Follow Button: `#4299E1`
- Stats: `#A0AEC0`
- Verified Badge: `#48BB78`

---

### 5. NAVIGATION
- Active Tab: `#48BB78`
- Inactive Tab: `#4A5568`
- Active BG: `#F0FFF4`
- Hover BG: `rgba(72,187,120,0.08)`
- Mobile Nav BG: `#FFFFFF` / `#2D3748`

---

### 6. FORMS & INPUTS
- Border Default: `#E2E8F0`
- Border Focus: `#48BB78`
- Border Error: `#F56565`
- Placeholder: `#A0AEC0`
- Label: `#2D3748` / `#F7FAFC`
- Error Text: `#F56565`

---

## DARK MODE OVERRIDES

Toggle mechanism: `.dark-theme` class on `<html>` + `@media (prefers-color-scheme: dark)` fallback.

```css
:root.dark-theme {
  --primary: #68D391;
  --primary-hover: #48BB78;
  --accent: #63B3ED;
  --accent-hover: #4299E1;
  --color-background: #1A202C;
  --color-surface: #2D3748;
  --color-text-primary: #F7FAFC;
  --color-text-secondary: #A0AEC0;
  --color-border: #4A5568;
}
```

---

## CSS VARIABLES

```css
:root {
  /* === PRIMARY (Mint Green) === */
  --primary: #48BB78;
  --primary-hover: #38A169;
  --primary-light: #68D391;
  --primary-active: #2F855A;
  --primary-tint: #F0FFF4;
  --primary-rgb: 72, 187, 120;

  /* === ACCENT (Ocean Blue) === */
  --accent: #4299E1;
  --accent-hover: #3182CE;
  --accent-light: #63B3ED;
  --accent-tint: #EBF8FF;

  /* === RADIUS === */
  --radius-xs: 4px;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-full: 9999px;

  /* === SPACING === */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;

  /* === TYPOGRAPHY === */
  --font-primary: 'Inter', system-ui, sans-serif;

  --text-display-xl: 3rem;
  --text-display-l: 2.25rem;
  --text-h1: 1.875rem;
  --text-h2: 1.5rem;
  --text-h3: 1.25rem;
  --text-body-lg: 1.125rem;
  --text-body: 1rem;
  --text-body-sm: 0.875rem;
  --text-caption: 0.75rem;
}
```

---

## BORDER RADIUS SYSTEM (MANDATORY)

- **Radius XS:** `4px` — Badges, tags, indicators
- **Radius SM:** `8px` — Inputs, small buttons
- **Radius MD:** `12px` — Cards, modals, dropdowns
- **Radius LG:** `16px` — Primary buttons, panels
- **Radius XL:** `24px` — Hero cards, bottom sheets
- **Radius FULL:** `9999px` — Pills, avatars, profile images

---

## SPACING SYSTEM (8-POINT GRID — STRICT)

- **0:** `0px`
- **1:** `4px`
- **2:** `8px`
- **3:** `12px`
- **4:** `16px`
- **5:** `20px`
- **6:** `24px`
- **8:** `32px`
- **10:** `40px`
- **12:** `48px`
- **16:** `64px`
- **20:** `80px`

---

## TYPOGRAPHY SYSTEM

### FONT FAMILY (MANDATORY)
- **Primary Font:** `Inter`
- **Fallback:** `system-ui, -apple-system, BlinkMacSystemFont, sans-serif`

### TYPE SCALE (REM-BASED)

| Role | Size | Line Height | Weight | Usage |
|----|----|----|----|----|
| Display XL | `3rem` (48px) | 1.1 | 700 | Hero headlines |
| Display L | `2.25rem` (36px) | 1.2 | 700 | Page titles |
| H1 | `1.875rem` (30px) | 1.3 | 600 | Section headers |
| H2 | `1.5rem` (24px) | 1.35 | 600 | Card titles |
| H3 | `1.25rem` (20px) | 1.4 | 600 | Sub-sections |
| Body LG | `1.125rem` (18px) | 1.6 | 400 | Primary content |
| Body | `1rem` (16px) | 1.6 | 400 | Default text |
| Body SM | `0.875rem` (14px) | 1.5 | 400 | Labels, meta |
| Caption | `0.75rem` (12px) | 1.4 | 400 | Hints, footnotes |
