/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        obsidian: "#0B1020",
        panel: "#131A2E",
        cyanline: "#3B82F6",
        limepulse: "#22C55E",
        amberwarn: "#F59E0B",
        danger: "#EF4444"
      },
      boxShadow: {
        glow: "0 18px 60px rgba(2, 6, 23, 0.32)",
        alert: "0 18px 52px rgba(239, 68, 68, 0.16)"
      },
      animation: {
        sweep: "sweep 3.2s linear infinite",
        breathe: "breathe 2.8s ease-in-out infinite"
      },
      keyframes: {
        sweep: {
          "0%": { transform: "translateX(-120%)" },
          "100%": { transform: "translateX(120%)" }
        },
        breathe: {
          "0%, 100%": { opacity: "0.72" },
          "50%": { opacity: "1" }
        }
      }
    }
  },
  plugins: []
};
