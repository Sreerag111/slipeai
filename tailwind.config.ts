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
        background: "var(--background)",
        foreground: "var(--foreground)",
        slipe: {
          bg: "#080B10",
          surface: "#0D1117",
          panel: "#121721",
          card: "#151B26",
          cardHover: "#1C2433",
          border: "#202838",
          borderHover: "#2E3A50",
          borderLight: "#38455E",
          blue: "#2563EB",
          blueHover: "#1D4ED8",
          blueGlow: "#3B82F6",
          accent: "#60A5FA",
          cyan: "#06B6D4",
          emerald: "#10B981",
          amber: "#F59E0B",
          rose: "#EF4444",
          text: "#F8FAFC",
          muted: "#94A3B8",
          dim: "#64748B",
          faint: "#475569"
        }
      },
      fontFamily: {
        sans: [
          "'Inter'",
          "-apple-system",
          "BlinkMacSystemFont",
          "'Segoe UI'",
          "Roboto",
          "sans-serif",
        ],
        hero: [
          "'Inter'",
          "-apple-system",
          "BlinkMacSystemFont",
          "'Segoe UI'",
          "Roboto",
          "sans-serif",
        ],
        mono: [
          "'JetBrains Mono'",
          "'Fira Code'",
          "Consolas",
          "monospace"
        ]
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.08)',
        'enterprise': '0 10px 30px -10px rgba(0, 0, 0, 0.12), 0 0 1px 1px rgba(0, 0, 0, 0.05)',
        'blue-sm': '0 0 15px -3px rgba(37, 99, 235, 0.25)',
        'container-shade': '0 10px 25px -4px rgba(0, 0, 0, 0.08), 0 4px 10px -2px rgba(0, 0, 0, 0.04)',
        'container-shade-hover': '0 20px 35px -4px rgba(0, 0, 0, 0.12), 0 8px 16px -3px rgba(0, 0, 0, 0.06)',
        'hero-shade': '0 14px 34px -4px rgba(0, 0, 0, 0.09), 0 6px 14px -2px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
};
export default config;
