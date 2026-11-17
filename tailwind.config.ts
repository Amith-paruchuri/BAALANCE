import type { Config } from "tailwindcss";

// BAALANCE palette, taken from the logo: deep teal, terracotta, warm cream.
// The `blue` and `indigo` scales are remapped to teal so existing utility
// classes pick up the brand colour without touching every component.
const teal = {
  50: "#EEF6F6",
  100: "#D8EBEC",
  200: "#B2D6D9",
  300: "#82BAC0",
  400: "#4C99A1",
  500: "#16636E",
  600: "#0B434B",
  700: "#09373E",
  800: "#072B31",
  900: "#05222A",
  950: "#03161B",
};

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        blue: teal,
        indigo: teal,
        brand: {
          teal: "#0D4F59",
          clay: "#BF6F4E",
          cream: "#F6F2EC",
          sand: "#EFE6DA",
          paper: "#FBF7F2",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px 0 rgba(40, 32, 24, 0.05), 0 4px 16px -4px rgba(40, 32, 24, 0.07)",
        cardHover: "0 2px 6px 0 rgba(40, 32, 24, 0.08), 0 10px 24px -6px rgba(40, 32, 24, 0.10)",
        float: "0 8px 24px -4px rgba(13, 79, 89, 0.18), 0 4px 12px -2px rgba(0, 0, 0, 0.06)",
      },
    },
  },
  plugins: [],
};
export default config;
