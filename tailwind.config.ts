import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brown: "#5c4a3a",
        terracotta: "#c47a45",
        cream: "#faf7f2",
        sand: "#e8d5c0",
      },
      fontFamily: {
        title: ["var(--font-playfair)", "serif"],
        body: ["var(--font-lato)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
