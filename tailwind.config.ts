import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 딥블루 (보드룸 / 발표 화면)
        navy: {
          950: "#081229",
          900: "#0E1E44",
          800: "#16295C",
          700: "#1B3A8A",
        },
        // 모던 블루 (주요 액션)
        brand: {
          400: "#5C84FF",
          500: "#3B6BFF",
          600: "#2B53E6",
        },
        // 따뜻한 파스텔 액센트
        coral: "#F4A28C",
        gold: "#E7C26A",
        teal: "#7BB4B0",
        // 표면 / 텍스트
        cream: "#FBF7F0",
        mist: "#F6F7FB",
        ink: "#14233F",
        muted: "#61708C",
        // 밝고 산뜻한 액센트 / 표면
        sky: "#38BDF8",
        mint: "#2DD4BF",
        lilac: "#A78BFA",
        sun: "#FBBF24",
        paper: "#F4F8FF",
      },
      fontFamily: {
        sans: [
          "Pretendard",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "Roboto",
          "Segoe UI",
          "sans-serif",
        ],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "grow-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.55" },
        },
        pop: {
          "0%": { transform: "scale(0.8)" },
          "55%": { transform: "scale(1.18)" },
          "100%": { transform: "scale(1)" },
        },
        "pop-in": {
          "0%": { opacity: "0", transform: "scale(0.7)" },
          "60%": { opacity: "1", transform: "scale(1.08)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "float-up": {
          "0%": { opacity: "0", transform: "translateY(10px) scale(0.9)" },
          "20%": { opacity: "1" },
          "100%": { opacity: "0", transform: "translateY(-120px) scale(1.15)" },
        },
        "confirm-fade": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "16%": { opacity: "1", transform: "translateY(0)" },
          "82%": { opacity: "1", transform: "translateY(0)" },
          "100%": { opacity: "0", transform: "translateY(-4px)" },
        },
        "ring-out": {
          "0%": { opacity: "0.55", transform: "scale(0.55)" },
          "100%": { opacity: "0", transform: "scale(1.7)" },
        },
        "check-draw": {
          "0%": { strokeDasharray: "1", strokeDashoffset: "1" },
          "100%": { strokeDasharray: "1", strokeDashoffset: "0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s cubic-bezier(0.16,1,0.3,1) both",
        "grow-in": "grow-in 0.45s cubic-bezier(0.16,1,0.3,1) both",
        "pulse-soft": "pulse-soft 1.6s ease-in-out infinite",
        pop: "pop 0.4s cubic-bezier(0.16,1,0.3,1) both",
        "pop-in": "pop-in 0.45s cubic-bezier(0.16,1,0.3,1) both",
        "float-up": "float-up 1.8s ease-out forwards",
        "confirm-fade": "confirm-fade 1.9s ease both",
        "ring-out": "ring-out 0.9s ease-out both",
        "check-draw": "check-draw 0.5s ease 0.15s both",
      },
    },
  },
  plugins: [],
};

export default config;
