/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        obsidian: "#050816",
        panel: "rgba(12, 18, 34, 0.72)",
        cyanline: "#19d3ff",
        limepulse: "#82f27e",
        amberwarn: "#f4c542",
        danger: "#ff4d6d"
      },
      boxShadow: {
        glow: "0 0 32px rgba(25, 211, 255, 0.18)",
        alert: "0 0 28px rgba(255, 77, 109, 0.18)"
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
