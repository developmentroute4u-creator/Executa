import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#FFF7F6",
        surface: "#FDF2F0",
        border: "#EADCDA",
        "border-strong": "#D4BDBA",
        text: {
          primary: "#2C2C2E",
          secondary: "#5C5C60",
          tertiary: "#8E8E93",
          inverse: "#FFF7F6",
        },
        accent: {
          DEFAULT: "#E85239",
          hover: "#D1452D",
          light: "rgba(232, 82, 57, 0.08)",
          muted: "rgba(232, 82, 57, 0.18)",
        },
        stone: {
          50: "#FAFAF9",
          100: "#F5F5F0",
          200: "#E7E7E0",
          300: "#D4D4CB",
          400: "#A8A89E",
          500: "#78786E",
          600: "#57574E",
          700: "#404038",
          800: "#292922",
          900: "#1A1A14",
        },
      },
      fontFamily: {
        sans: ["var(--font-outfit)", "ui-sans-serif", "system-ui", "-apple-system", "sans-serif"],
        display: ["var(--font-outfit)", "ui-sans-serif", "system-ui", "-apple-system", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
        caveat: ["var(--font-caveat)", "cursive"],
      },
      fontSize: {
        "display-2xl": ["4.5rem", { lineHeight: "1.1", letterSpacing: "-0.03em", fontWeight: "600" }],
        "display-xl": ["3.75rem", { lineHeight: "1.1", letterSpacing: "-0.025em", fontWeight: "600" }],
        "display-lg": ["3rem", { lineHeight: "1.15", letterSpacing: "-0.02em", fontWeight: "600" }],
        "display-md": ["2.25rem", { lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: "600" }],
        "display-sm": ["1.875rem", { lineHeight: "1.25", letterSpacing: "-0.015em", fontWeight: "600" }],
        "display-xs": ["1.5rem", { lineHeight: "1.3", letterSpacing: "-0.01em", fontWeight: "600" }],
      },
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
        "30": "7.5rem",
      },
      borderRadius: {
        "sm": "0.375rem",
        DEFAULT: "0.5rem",
        "md": "0.625rem",
        "lg": "0.75rem",
        "xl": "1rem",
        "2xl": "1.25rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        "sm": "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.03)",
        DEFAULT: "0 4px 12px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.03)",
        "md": "0 8px 24px rgba(0,0,0,0.07), 0 2px 8px rgba(0,0,0,0.04)",
        "lg": "0 16px 40px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.05)",
        "xl": "0 24px 60px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.04)",
        "accent": "0 0 0 3px rgba(232, 82, 57, 0.12)",
        "inner": "inset 0 1px 3px rgba(0,0,0,0.04)",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out forwards",
        "fade-up": "fadeUp 0.5s ease-out forwards",
        "slide-in": "slideIn 0.35s ease-out forwards",
        "scale-in": "scaleIn 0.3s ease-out forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          "0%": { opacity: "0", transform: "translateX(-12px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
