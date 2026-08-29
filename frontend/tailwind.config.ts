import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0F0F0F",
        surface: "#1A1A1A",
        "surface-raised": "#242424",
        border: "#2E2E2E",
        "text-primary": "#F5F5F5",
        "text-secondary": "#A3A3A3",
        "text-muted": "#6B6B6B",
        "brand-amber": "#D97706",
        "brand-amber-light": "#FCD34D",
        success: "#16A34A",
        warning: "#CA8A04",
        danger: "#DC2626",

        // Default Radix UI semantic variables mapped to tokens
        card: {
          DEFAULT: "#1A1A1A",
          foreground: "#F5F5F5",
        },
        popover: {
          DEFAULT: "#242424",
          foreground: "#F5F5F5",
        },
        primary: {
          DEFAULT: "#D97706",
          foreground: "#000000",
        },
        secondary: {
          DEFAULT: "#242424",
          foreground: "#F5F5F5",
        },
        muted: {
          DEFAULT: "#242424",
          foreground: "#6B6B6B",
        },
        accent: {
          DEFAULT: "#242424",
          foreground: "#FCD34D",
        },
        destructive: {
          DEFAULT: "#DC2626",
          foreground: "#F5F5F5",
        },
        ring: "#D97706",
        input: "#2E2E2E",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        lg: "0.5rem",
        md: "calc(0.5rem - 2px)",
        sm: "calc(0.5rem - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
