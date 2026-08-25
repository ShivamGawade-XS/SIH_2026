import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Luxury / Editorial Design Tokens
        alabaster: "#F9F8F6",
        charcoal: "#1A1A1A",
        taupe: "#EBE5DE",
        "warm-grey": "#6C6863",
        gold: "#D4AF37",
        "gold-light": "#E8C868",
        "gold-dark": "#B89528",
        
        // Semantic aliases
        bg: "#F9F8F6",
        fg: "#1A1A1A",
        surface: "#FFFFFF",
        "surface-dark": "#1A1A1A",
        border: "rgba(26, 26, 26, 0.15)",
        "border-dark": "rgba(249, 248, 246, 0.15)",
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Playfair Display", "Georgia", "serif"],
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
      borderRadius: {
        none: "0px",
        DEFAULT: "0px",
        sm: "0px",
        md: "0px",
        lg: "0px",
        xl: "0px",
        "2xl": "0px",
        "3xl": "0px",
        full: "0px",
      },
      letterSpacing: {
        widest: "0.25em",
        ultra: "0.3em",
      },
      boxShadow: {
        "luxury-hero": "0 8px 32px rgba(0, 0, 0, 0.12)",
        "luxury-card": "0 2px 8px rgba(0, 0, 0, 0.02)",
        "luxury-card-hover": "0 8px 24px rgba(0, 0, 0, 0.06)",
        "luxury-btn": "0 4px 16px rgba(0, 0, 0, 0.15)",
        "luxury-btn-hover": "0 8px 24px rgba(0, 0, 0, 0.25)",
        "inner-border": "inset 0 0 0 1px rgba(0, 0, 0, 0.06)",
      },
      transitionDuration: {
        "1500": "1500ms",
        "2000": "2000ms",
      },
    },
  },
  plugins: [],
};

export default config;
