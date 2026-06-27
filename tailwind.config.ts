import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#15201b",
        mist: "#f6f8f4",
        moss: "#425f46",
        citrus: "#d8f171",
        coral: "#f47b62",
        ocean: "#317c9b",
        line: "#d9dfd5"
      },
      boxShadow: {
        soft: "0 18px 45px rgba(21, 32, 27, 0.10)"
      }
    }
  },
  plugins: []
};

export default config;
