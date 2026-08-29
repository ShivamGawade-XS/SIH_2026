# 🍯 HoneyChain by TrueTag — Brand & Logo Kit Specification

This document defines the brand identity system, color tokens, typography, and component kit for **HoneyChain by TrueTag** (KVIC & National Bee Board — SIH 2026 Problem Statement SIH26021).

---

## 🎨 1. Core Visual Identity & Assets

The HoneyChain brand identity is **Organic & Nature-Forward**, blending pure Himalayan/Sundarbans apiculture with modern Web3 cryptographic provenance.

| Asset Key | File Path | Usage & Target Surfaces |
|---|---|---|
| **App Icon** | `assets/brand/app_icon.jpg`<br/>`frontend/public/honeychain_app_icon.jpg` | Browser Favicon, Mobile PWA Homescreen, Compact UI buttons, Header brand avatars. |
| **Emblem Badge** | `assets/brand/emblem_badge.jpg`<br/>`frontend/public/honeychain_logo_badge.jpg` | Official KVIC Provenance Seals, PDF Lab Certificates, Authenticity verification headers, Documentation banner. |
| **Hero Banner** | `assets/hero_banner.jpg` | GitHub README hero, social OpenGraph sharing card. |

---

## 🏛 2. Component API (`HoneyChainLogo.tsx`)

The unified logo component `<HoneyChainLogo />` offers 5 distinct layout variants:

```tsx
import HoneyChainLogo, { HoneyChainBadge, HoneyChainSeal, HoneyChainIcon } from "@/components/HoneyChainLogo";
```

### Variants

1. **`variant="full"` (Default)**
   - Horizontal lockup: App icon + "HONEYCHAIN" bold serif/sans + "TrueTag™" badge + "KVIC • National Bee Board" subtitle.
   - *Use in:* [`Navbar.tsx`](../frontend/src/components/Navbar.tsx), [`Footer.tsx`](../frontend/src/components/Footer.tsx), Dashboard top navigation.

2. **`variant="stacked"`**
   - Centered vertical lockup: Emblem badge on top + stacked brand typography below.
   - *Use in:* [`/dashboard/login`](../frontend/src/app/dashboard/login/page.tsx), [`/dashboard/register-account`](../frontend/src/app/dashboard/register-account/page.tsx), Modal headers.

3. **`variant="seal"`**
   - Official framed seal: High-resolution emblem with gold corner brackets, KVIC Provenance caption, and live ledger pulse.
   - *Use in:* Landing page Hero, Beekeeper Certificate viewers.

4. **`variant="badge"`**
   - Standalone circular/hexagonal botanical bee seal.
   - *Use in:* Verification cards, GI Tag popups, PDF certificate watermarks.

5. **`variant="icon"`**
   - Standalone minimal honey drop + leaf wing icon with live verification beacon.
   - *Use in:* Table rows, compact cards, QR front packaging labels.

### Props Table

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `"icon" \| "full" \| "seal" \| "badge" \| "stacked"` | `"full"` | Layout structure of the brand presentation |
| `size` | `"xs" \| "sm" \| "md" \| "lg" \| "xl" \| "2xl"` | `"md"` | Responsive dimensions and typography scale |
| `theme` | `"light" \| "dark" \| "auto"` | `"auto"` | Automatic contrast inversion for light/dark containers |
| `showEndorsement` | `boolean` | `true` | Toggles the `"TrueTag™"` cryptographic sub-badge |
| `className` | `string` | `""` | Additional Tailwind utility classes |

---

## 🎨 3. Color Palette Tokens

```
Amber Gold Core:     #D4AF37  (Gold accent)
Radiant Honey:       #F59E0B  (Warm Amber)
Deep Nectar:         #D97706  (Deep Amber)
Obsidian Charcoal:   #141414  (Primary Dark Surface)
Warm Alabaster:      #F9F8F6  (Primary Light Background)
Emerald Veracity:    #10B981  (Live Ledger Verified Green)
Rose Tamper Alert:   #F43F5E  (Fraud / Tamper Warning)
```

---

## 📜 4. Typography Rules

- **Display & Headings:** `Playfair Display` (Serif, Elegant, Luxury, Traditional Indian Apiculture)
- **UI & Body Copy:** `Inter` (Sans, Clean, Modern, Legible on Mobile)
- **Ledger & Telemetry:** `JetBrains Mono` (Monospace, Cryptographic hashes, Hex, IoT readings)
