/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        aiiro: {
          deep: "#0B1325",
          surface: "#111C36",
          accent: "#3A86FF",
          light: "#E2E8F0",
          muted: "#64748B",
          border: "#1E293B",
        },
      },
      fontFamily: {
        serif: [
          "'Playfair Display'",
          "'Noto Serif JP'",
          "Georgia",
          "serif",
        ],
        sans: [
          "'Inter'",
          "'Noto Sans JP'",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
      },
      fontSize: {
        fluid: "clamp(1rem, 1vw + 0.5rem, 1.25rem)",
        "fluid-lg": "clamp(1.25rem, 2vw + 0.5rem, 2rem)",
        "fluid-xl": "clamp(2rem, 4vw + 1rem, 3.5rem)",
        "fluid-2xl": "clamp(2.5rem, 5vw + 1rem, 5rem)",
      },
      boxShadow: {
        "neon": "0 0 20px rgba(58, 134, 255, 0.3), 0 0 40px rgba(58, 134, 255, 0.1)",
        "neon-sm": "0 0 10px rgba(58, 134, 255, 0.2)",
        "glass": "0 8px 32px rgba(0, 0, 0, 0.3)",
      },
      backgroundImage: {
        "gradient-radial":
          "radial-gradient(circle at center, var(--tw-gradient-stops))",
        "border-gradient":
          "linear-gradient(135deg, rgba(58,134,255,0.4) 0%, rgba(100,116,139,0.1) 50%, rgba(58,134,255,0.2) 100%)",
      },
      animation: {
        "float": "float 6s ease-in-out infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "shimmer": "shimmer 3s linear infinite",
        "fade-in-up": "fadeInUp 0.8s ease-out forwards",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
      letterSpacing: {
        widest: ".25em",
      },
    },
  },
  plugins: [],
};
