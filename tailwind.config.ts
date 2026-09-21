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
        gemini: {
          surface: "#F0F4FA",
          card: "#FFFFFF",
          border: "#E2E8F0",
          blue: "#3186FF",
          slate: "#5F6368",
          dark: "#000000",
          navy: "#1F2937",
          subtle: "#F8FAFC",
        },
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "Roboto", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(60, 64, 67, 0.08), 0 4px 8px 3px rgba(60, 64, 67, 0.04)",
        cardHover: "0 2px 6px 0 rgba(60, 64, 67, 0.12), 0 8px 16px 4px rgba(60, 64, 67, 0.06)",
        float: "0 8px 24px -4px rgba(49, 134, 255, 0.18), 0 4px 12px -2px rgba(0, 0, 0, 0.06)",
      },
      backgroundImage: {
        "gemini-gradient": "linear-gradient(135deg, #3186FF 0%, #6366F1 35%, #D946EF 70%, #FB7185 100%)",
        "gemini-glow": "radial-gradient(ellipse at top, rgba(49, 134, 255, 0.15), transparent 70%)",
      },
    },
  },
  plugins: [],
};
export default config;
