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
        "golden-blue": "#0046ff",
        "golden-blue-dark": "#0035cc",
        "golden-blue-light": "#e8f0ff",
        "golden-beige": "#faf6f0",
        "golden-beige-dark": "#f0ebe3",
        "golden-beige-card": "#fffdf9",
        "golden-gold": "#c8982a",
        "golden-gold-light": "#fef3d0",
        "golden-text": "#1a1a2e",
        "golden-text-muted": "#5a5a7a",
      },
      fontFamily: {
        gothic: [
          "Noto Sans KR",
          "Apple SD Gothic Neo",
          "Malgun Gothic",
          "sans-serif",
        ],
      },
      fontSize: {
        "senior-sm": ["20px", { lineHeight: "1.7" }],
        "senior-base": ["22px", { lineHeight: "1.7" }],
        "senior-lg": ["26px", { lineHeight: "1.6" }],
        "senior-xl": ["30px", { lineHeight: "1.5" }],
        "senior-2xl": ["36px", { lineHeight: "1.4" }],
        "senior-3xl": ["44px", { lineHeight: "1.3" }],
      },
      boxShadow: {
        card: "0 4px 24px rgba(0, 70, 255, 0.08)",
        "card-hover": "0 8px 40px rgba(0, 70, 255, 0.18)",
        chat: "0 2px 16px rgba(0, 0, 0, 0.08)",
      },
      animation: {
        "scroll-up": "scrollUp 40s linear infinite",
        "pulse-mic": "pulseMic 2s ease-in-out infinite",
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
      },
      keyframes: {
        scrollUp: {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(-50%)" },
        },
        pulseMic: {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.12)", opacity: "0.85" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
