/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Bebas Neue', 'Inter', 'sans-serif'],
      },
      colors: {
        border: "oklch(var(--border) / <alpha-value>)",
        input: "oklch(var(--input) / <alpha-value>)",
        ring: "oklch(var(--ring) / <alpha-value>)",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "oklch(0.48 0.22 27)",
          foreground: "oklch(1 0 0)",
          light: "oklch(0.6 0.18 27)",
          dark: "oklch(0.35 0.22 27)",
        },
        secondary: {
          DEFAULT: "oklch(0.15 0.005 0)",
          foreground: "oklch(0.98 0.002 0)",
        },
        destructive: {
          DEFAULT: "oklch(0.48 0.22 27)",
          foreground: "oklch(1 0 0)",
        },
        muted: {
          DEFAULT: "oklch(0.94 0.003 0)",
          foreground: "oklch(0.45 0.005 0)",
        },
        accent: {
          DEFAULT: "oklch(0.55 0.22 27)",
          foreground: "oklch(1 0 0)",
        },
        popover: {
          DEFAULT: "oklch(1 0 0)",
          foreground: "oklch(0.1 0.005 0)",
        },
        card: {
          DEFAULT: "oklch(1 0 0)",
          foreground: "oklch(0.1 0.005 0)",
        },
        sidebar: {
          DEFAULT: "oklch(0.1 0.005 0)",
          foreground: "oklch(0.92 0.003 0)",
          primary: "oklch(0.55 0.22 27)",
          "primary-foreground": "oklch(1 0 0)",
          accent: "oklch(0.18 0.005 0)",
          "accent-foreground": "oklch(0.92 0.003 0)",
          border: "oklch(0.2 0.005 0)",
          ring: "oklch(0.55 0.22 27)",
        },
        brand: {
          red: "oklch(0.48 0.22 27)",
          "red-light": "oklch(0.6 0.18 27)",
          "red-dark": "oklch(0.35 0.22 27)",
          black: "oklch(0.1 0.005 0)",
          "black-soft": "oklch(0.15 0.005 0)",
          white: "oklch(1 0 0)",
          "off-white": "oklch(0.97 0.002 0)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        'red-glow': '0 0 20px oklch(0.48 0.22 27 / 0.3)',
        'card': '0 2px 8px oklch(0.1 0.005 0 / 0.08)',
        'card-hover': '0 4px 16px oklch(0.1 0.005 0 / 0.12)',
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
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),
    require("@tailwindcss/container-queries"),
  ],
}
