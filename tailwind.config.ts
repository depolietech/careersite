import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#F0FAF5",
          100: "#D1F0E0",
          200: "#A3E1C2",
          300: "#75D2A3",
          400: "#47C385",
          500: "#3FBA6F",
          600: "#34A862",
          700: "#2A9655",
          800: "#1F7442",
          900: "#143025",
        },
        forest: "#1A3828",
      },
      fontFamily: {
        sans:    ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-playfair)", "Georgia", "serif"],
      },
      boxShadow: {
        card:         "0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.08)",
        "card-hover": "0 4px 12px 0 rgb(0 0 0 / 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
