import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: "#17324D", dark: "#102A43" },
        teal: { DEFAULT: "#168C8C", dark: "#117070", soft: "#E3F3F2" },
        brand: { green: "#27845A", greensoft: "#E4F3EB" },
        surface: "#F4F7F8",
        warn: { DEFAULT: "#F4B942", soft: "#FDF3DC", text: "#8A5A00" },
        danger: { DEFAULT: "#C94C4C", soft: "#FBEAEA" },
        ink: { DEFAULT: "#1F2D3A", muted: "#5B6B79" },
        line: "#DFE6EA",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,42,67,0.05), 0 2px 8px rgba(16,42,67,0.05)",
      },
      borderRadius: { xl2: "14px" },
    },
  },
  plugins: [],
};

export default config;
