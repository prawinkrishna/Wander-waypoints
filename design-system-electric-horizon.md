# 🚀 ELECTRIC HORIZON — COMPLETE TRAVEL APP DESIGN SYSTEM
## Production-Ready Color Codes & AI Coding Rules (2026)

**FILE NAME:** `design-system-electric-horizon.md`  
**ENFORCEMENT:** AI MUST use ONLY the hex codes defined in this file.  
**STATUS:** PRODUCTION READY

---

## 🎨 CORE BRAND COLORS (Primary Actions)

### PRIMARY ELECTRIC BLUE SYSTEM
- **Primary:** `#1E90FF` — Primary buttons, active nav, links (8.2:1 contrast)
- **Hover:** `#0F7BEF` — Hover state (-15% brightness)
- **Light:** `#4DA8FF` — Icons, secondary elements
- **Active:** `#1560C3` — Pressed / active state (-25% brightness)
- **Tint:** `#EBF3FF` — Subtle backgrounds (10% opacity)

### NEON CORAL SYSTEM (Social / Urgency)
- **Primary:** `#FF4757` — Likes, hearts, urgent CTAs (6.8:1 contrast)
- **Hover:** `#E63946`
- **Light:** `#FF6B82` — Badges, notifications
- **Strong:** `#C82333` — Critical emphasis
- **Tint:** `#FFF0F1` — Subtle coral background (5% opacity)

---

## 🧱 NEUTRAL SYSTEM (Foundation)

### LIGHT MODE (Default)
- Page Background: `#F7F9FA`
- Card Surface: `#FFFFFF`
- Primary Text: `#1A202C`
- Secondary Text: `#4A5568`
- Tertiary Text: `#A0AEC0`
- Borders: `#E2E8F0`
- Shadows: `rgba(0,0,0,0.08)`

### DARK MODE (Auto-detect)
- Page Background: `#1A202C`
- Card Surface: `#2D3748`
- Primary Text: `#F7FAFC`
- Secondary Text: `#A0AEC0`
- Tertiary Text: `#718096`
- Borders: `#4A5568`
- Shadows: `rgba(0,0,0,0.24)`

---

## ✅ STATUS & SEMANTIC COLORS
- **Success:** `#48BB78` — Confirmed, verified
- **Warning:** `#ED8936` — Limited, pending
- **Error:** `#F56565` — Failed, validation
- **Info:** `#63B3ED` — Tips, help
- **Disabled:** `#A0AEC0`

---

## ❤️ SOCIAL ENGAGEMENT COLORS
- Like / Heart: `#FF4757`
- Follow: `#9F7AEA`
- Share: `#319795`
- Comment: `#4DA8FF`

---

## 🎯 COMPONENT COLOR RULES (MANDATORY)

### 1. BUTTONS (44px minimum height)

**PRIMARY ACTION**
- Background: `#1E90FF`
- Text: `#FFFFFF`
- Hover: `#0F7BEF`
- Active: `#1560C3`
- Focus Ring: `0 0 0 2px rgba(30,144,255,0.3)`
- Disabled: `#A0AEC0`

**SECONDARY ACTION**
- Background: `#FF4757`
- Text: `#FFFFFF`
- Hover: `#E63946`
- Outline: `2px solid #FF4757`

**GHOST BUTTON**
- Background: `transparent`
- Text: `#1E90FF`
- Hover BG: `#EBF3FF`

---

### 2. TRIP CARDS
- Background: `#FFFFFF`
- Border: `1px solid #E2E8F0`
- Title: `#1A202C`
- Location: `#4A5568`
- Price: `#48BB78`
- Like Active: `#FF4757`
- Shadow: `0 4px 12px rgba(0,0,0,0.08)`
- Hover Shadow: `0 8px 24px rgba(30,144,255,0.12)`

---

### 3. BOOKING SECTION
- Primary CTA (“Book Now”): `#FF4757`
- Secondary CTA: `#1E90FF`
- Price Normal: `#1A202C`
- Price Discount: `#48BB78`
- Availability:
  - Available: `#48BB78`
  - Limited: `#ED8936`
  - Sold Out: `#F56565`

---

### 4. USER PROFILES
- Header Gradient: `linear-gradient(135deg, #1E90FF 0%, #0F7BEF 100%)`
- Username: `#FFFFFF`
- Bio: `#4A5568` / `#F7FAFC`
- Follow Button: `#FF4757`
- Stats: `#A0AEC0`
- Verified Badge: `#48BB78`

---

### 5. NAVIGATION
- Active Tab: `#1E90FF`
- Inactive Tab: `#4A5568`
- Active BG: `#EBF3FF`
- Hover BG: `rgba(30,144,255,0.08)`
- Mobile Nav BG: `#FFFFFF` / `#2D3748`

---

### 6. FORMS & INPUTS
- Border Default: `#E2E8F0`
- Border Focus: `#1E90FF`
- Border Error: `#F56565`
- Placeholder: `#A0AEC0`
- Label: `#1A202C` / `#F7FAFC`
- Error Text: `#F56565`

---

## 🌙 DARK MODE OVERRIDES
```css
@media (prefers-color-scheme: dark) {
  .btn-primary {
    background: #4299E1;
    color: #1A202C;
  }
}
 use like 
 :root {
  --primary: #1E90FF;
  --primary-hover: #0F7BEF;
  --primary-dark: #1560C3;
  --secondary: #FF4757;
  --secondary-hover: #E63946;

  --bg-light: #F7F9FA;
  --surface-light: #FFFFFF;
  --text-primary-light: #1A202C;
  --text-secondary-light: #4A5568;
  --border-light: #E2E8F0;

  --bg-dark: #1A202C;
  --surface-dark: #2D3748;
  --text-primary-dark: #F7FAFC;
  --text-secondary-dark: #A0AEC0;
  --border-dark: #4A5568;

  --success: #48BB78;
  --warning: #ED8936;
  --error: #F56565;
}
---

## ⭕ BORDER RADIUS SYSTEM (MANDATORY)

Purpose: Ensure modern, friendly, mobile-first UI consistency  
Rule: **AI must NEVER invent radius values**

### RADIUS SCALE
- **Radius XS:** `4px` → Badges, tags, indicators
- **Radius SM:** `8px` → Inputs, small buttons
- **Radius MD:** `12px` → Cards, modals, dropdowns
- **Radius LG:** `16px` → Primary buttons, panels
- **Radius XL:** `24px` → Hero cards, bottom sheets
- **Radius FULL:** `9999px` → Pills, avatars, profile images

### USAGE RULES
- Buttons → `16px`
- Cards → `12px`
- Modals / Sheets → `16px–24px`
- Inputs → `8px`
- Avatars → `9999px`

🚫 Never mix random radii  
✅ Use only values from this scale

---

## 📏 SPACING SYSTEM (8-POINT GRID — STRICT)

Purpose: Visual rhythm, readability, responsive layouts  
Rule: **ALL margins & paddings must use this scale**

### SPACING SCALE
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

### COMMON USAGE
- Button padding: `12px 20px`
- Card padding: `16px–24px`
- Section spacing: `40px–64px`
- Form field gap: `12px`
- Icon-text gap: `8px`

🚫 Never use odd values (13px, 18px, 27px)  
✅ Always snap to spacing scale

---

## 🔤 TYPOGRAPHY SYSTEM (HIGH CONVERSION, MOBILE-FIRST)

### FONT FAMILY (MANDATORY)
- **Primary Font:** `Inter`
- **Fallback:** `system-ui, -apple-system, BlinkMacSystemFont, sans-serif`

Reason:  
✔ Excellent readability  
✔ Designed for UI  
✔ Works across Android, iOS, Web  
✔ Strong numeric clarity (prices, dates)

---

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

---

### TEXT COLOR RULES
- Headings → `#1A202C` / `#F7FAFC`
- Body → `#4A5568` / `#A0AEC0`
- Muted → `#A0AEC0`
- Links → `#1E90FF`
- Errors → `#F56565`

🚫 Never use pure black  
🚫 Never reduce body text below `14px`

---

## 🧠 TYPOGRAPHY BEHAVIOR RULES (AI ENFORCED)

✅ Line length: 60–75 characters  
✅ Sentence case for UI labels  
✅ Title Case only for headings  
✅ Prices must be bold  
✅ Buttons use **Medium (500–600)** weight  
✅ No letter-spacing on body text  
✅ Uppercase only for short badges

---

## 🧩 CSS VARIABLES — RADIUS, SPACING, TYPOGRAPHY

```css
:root {
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
