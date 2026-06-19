import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

const config: Config = {
  content: [
    "./src/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      /* ─── Color System: Industrial Modern (จาก design-system) ─── */
      colors: {
        primary: {
          DEFAULT: "#1A56DB",
          dark: "#1243AF",
          light: "#3B82F6",
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1A56DB",
          800: "#1E40AF",
          900: "#1E3A8A",
        },
        steel: {
          50: "#F9FAFB",
          100: "#F3F4F6",
          200: "#E5E7EB",
          300: "#D1D5DB",
          400: "#9CA3AF",
          500: "#6B7280",
          600: "#4B5563",
          700: "#374151",
          800: "#1F2937",
          900: "#111827",
        },
        condition: {
          good: "#059669",
          "good-light": "#D1FAE5",
          fair: "#D97706",
          "fair-light": "#FEF3C7",
          poor: "#DC2626",
          "poor-light": "#FEE2E2",
        },
        success: {
          DEFAULT: "#059669",
          light: "#D1FAE5",
        },
        warning: {
          DEFAULT: "#D97706",
          light: "#FEF3C7",
        },
        danger: {
          DEFAULT: "#DC2626",
          light: "#FEE2E2",
        },
        info: {
          DEFAULT: "#0284C7",
          light: "#E0F2FE",
        },
        dark: {
          bg: "#1A1B1E",
          surface: "#2A2B2E",
          border: "#3A3B3E",
          text: "#E5E7EB",
        },
      },

      /* ─── Typography ─── */
      fontFamily: {
        sans: ["Inter", "Sarabun", ...fontFamily.sans],
        thai: ["Sarabun", "Inter", ...fontFamily.sans],
        mono: ["JetBrains Mono", "Cascadia Code", ...fontFamily.mono],
      },
      fontSize: {
        fine: ["0.625rem", { lineHeight: "0.875rem" }],
        caption: ["0.75rem", { lineHeight: "1rem" }],
      },

      /* ─── Spacing (4px grid) ─── */
      spacing: {
        xs: "4px",
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "24px",
        "2xl": "32px",
        "3xl": "48px",
        "4xl": "64px",
      },

      /* ─── Border Radius ─── */
      borderRadius: {
        sm: "4px",
        md: "6px",
        lg: "8px",
      },

      /* ─── Shadows ─── */
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.08)",
        "card-hover": "0 2px 6px rgba(0,0,0,0.12)",
        dropdown: "0 4px 12px rgba(0,0,0,0.12)",
        modal: "0 8px 24px rgba(0,0,0,0.16)",
        button: "0 1px 2px rgba(0,0,0,0.06)",
        "inner-heavy": "inset 0 2px 4px rgba(0,0,0,0.06)",
      },

      /* ─── Touch Targets ─── */
      minHeight: {
        touch: "44px",
        input: "40px",
        button: "44px",
      },
      minWidth: {
        touch: "44px",
      },

      /* ─── Z-Index Scale ─── */
      zIndex: {
        dropdown: "50",
        sticky: "60",
        nav: "70",
        drawer: "80",
        modal: "90",
        toast: "100",
      },

      /* ─── Animations ─── */
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "slide-down": {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "slide-left": {
          "0%": { transform: "translateX(10px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "slide-right": {
          "0%": { transform: "translateX(-10px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.2s ease-out",
        "slide-up": "slide-up 0.3s ease-out",
        "slide-down": "slide-down 0.3s ease-out",
        "slide-left": "slide-left 0.3s ease-out",
        "slide-right": "slide-right 0.3s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
