# 🍯 HoneyChain Frontend & Operations Dashboard

> **Part of the HoneyChain by TrueTag Ecosystem**  
> **Team:** Crimson Syndicate (CS Syndicate)  
> **Smart India Hackathon (SIH) 2026** | **Problem Statement:** SIH26021  

---

## 🎨 Overview & Design System

The HoneyChain frontend is built with **Next.js 14 (App Router)** and styled using a **Signature Luxury Editorial Design System**:
- **Palette**: Warm Alabaster (`#F9F8F6`), Rich Charcoal (`#121212`), Warm Gold (`#D4AF37`), and Taupe (`#E4DDD3`).
- **Typography**: Playfair Display serif headings paired with Inter body copy and JetBrains Mono code tags.
- **Micro-Interactions**: Golden sliding hover buttons (`.btn-gold-slide`), grayscale-to-color image hover reveals, and high-contrast security badges.
- **Multilingual Localization**: Full vernacular language support for English, Hindi, Bengali, Tamil, and Kannada.

---

## 👥 Authors & Contributors — Team Crimson Syndicate (CS Syndicate)

- **Shivam Gawade**
- **Rahul Rathod**
- **Rehan Harmalkar**
- **Avneesh Walwalkar**
- **Sunehri Sonar**
- **Shaunak Pai**

---

## 🚀 Live Production Deployment

- **Live Production URL**: [https://honeychain-truetag.vercel.app](https://honeychain-truetag.vercel.app)
- **Vercel Edge Network**: 32 static and dynamic routes with 0 hydration errors.

---

## 🛠️ Local Development & Scripts

```bash
# Install dependencies
npm install

# Run database synchronization
npx prisma db push
npx prisma generate

# Start local dev server
npm run dev

# Run zero-warning production build
npm run build
```

---

## 📱 Key Route Directory

| Route | Functionality |
|---|---|
| `/` | Luxury Editorial Landing Page with live stats & architecture pillars |
| `/verify` | Consumer batch search portal with camera barcode scanner |
| `/verify/[batchId]` | Interactive provenance certificate, GPS apiary map & 400 MHz NMR spectrum |
| `/dashboard/login` | 1-Click evaluator demo login for field officers, chemists, and admins |
| `/dashboard` | Operations overview with Live SSE IoT telemetry stream |
| `/dashboard/quality` | Interactive FSSAI IS 4941 Adulteration Lab Stress-Tester |
| `/dashboard/qr` | Cryptographic Physical Security Studio (35mm Lid Seals, Heavy Drum Tags) |
| `/dashboard/migration` | Pan-India Migratory Bloom Planner & KVIC transit pass generator |
| `/dashboard/credits` | Green Pollination Carbon Credit Tokenizer |
| `/dashboard/pollen` | Gemini Vision melissopalynology botanical origin microscope tool |
