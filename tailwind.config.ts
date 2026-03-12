import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        li: {
          bg: "hsl(var(--li-bg))",
          "bg-hover": "hsl(var(--li-bg-hover))",
          "bg-active": "hsl(var(--li-bg-active))",
          text: "hsl(var(--li-text))",
          "text-bright": "hsl(var(--li-text-bright))",
          "text-muted": "hsl(var(--li-text-muted))",
          "text-badge": "hsl(var(--li-text-badge))",
          border: "hsl(var(--li-border))",
          divider: "hsl(var(--li-divider))",
          "badge-bg": "hsl(var(--li-badge-bg))",
          "menu-bg": "hsl(var(--li-menu-bg))",
          "menu-bg-hover": "hsl(var(--li-menu-bg-hover))",
          "menu-border": "hsl(var(--li-menu-border))",
          "content-bg": "hsl(var(--li-content-bg))",
          "content-border": "hsl(var(--li-content-border))",
          "priority-urgent": "hsl(var(--li-priority-urgent))",
          "priority-high": "hsl(var(--li-priority-high))",
          "priority-medium": "hsl(var(--li-priority-medium))",
          "status-progress": "hsl(var(--li-status-progress))",
          "status-done": "hsl(var(--li-status-done))",
          "dot-green": "hsl(var(--li-dot-green))",
          "dot-orange": "hsl(var(--li-dot-orange))",
          "dot-blue": "hsl(var(--li-dot-blue))",
          "dot-red": "hsl(var(--li-dot-red))",
          "dot-purple": "hsl(var(--li-dot-purple))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
        "detail-expand": {
          from: { height: "0", opacity: "0", transform: "translateY(-4px)" },
          to: { height: "var(--detail-height)", opacity: "1", transform: "translateY(0)" },
        },
        "detail-collapse": {
          from: { height: "var(--detail-height)", opacity: "1", transform: "translateY(0)" },
          to: { height: "0", opacity: "0", transform: "translateY(-4px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "detail-expand": "detail-expand 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "detail-collapse": "detail-collapse 0.25s cubic-bezier(0.36, 0, 0.66, -0.56)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
