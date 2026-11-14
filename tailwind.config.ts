import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#080C15",
        surface: "#0E1526",
        "surface-elevated": "#151F36",
        "surface-card": "#111A2E",
        border: "#1E2C4A",
        "border-hover": "#2B3E68",
        primary: {
          DEFAULT: "#4F46E5",
          hover: "#4338CA",
          glow: "rgba(79, 70, 229, 0.25)",
        },
        ai: {
          DEFAULT: "#06B6D4",
          glow: "rgba(6, 182, 212, 0.25)",
        },
        accent: "#38BDF8",
        success: "#10B981",
        warning: "#F59E0B",
        danger: "#EF4444",
        muted: "#94A3B8",
        subtle: "#64748B",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
