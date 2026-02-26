/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef7ff",
          100: "#d9edff",
          200: "#bcdfff",
          300: "#8ecaff",
          400: "#59abff",
          500: "#3388ff",
          600: "#1a65f5",
          700: "#1350e1",
          800: "#1641b6",
          900: "#183a8f",
          950: "#132557",
        },
        surface: {
          50: "#f8f9fb",
          100: "#f0f2f5",
          200: "#e4e7ec",
          300: "#cdd3dc",
          400: "#98a2b3",
          500: "#667085",
          600: "#475467",
          700: "#344054",
          800: "#1d2939",
          900: "#101828",
          950: "#0c111d",
        },
        success: {
          50: "#ecfdf3",
          400: "#47cd89",
          500: "#17b26a",
          600: "#079455",
          700: "#067647",
        },
        warning: {
          50: "#fffaeb",
          400: "#fdb022",
          500: "#f79009",
          600: "#dc6803",
        },
        danger: {
          50: "#fef3f2",
          400: "#f97066",
          500: "#f04438",
          600: "#d92d20",
          700: "#b42318",
        },
      },
      fontFamily: {
        sans: ['"DM Sans"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
        display: ['"Outfit"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(16, 24, 40, 0.1), 0 1px 2px -1px rgba(16, 24, 40, 0.1)",
        "card-hover":
          "0 4px 6px -1px rgba(16, 24, 40, 0.1), 0 2px 4px -2px rgba(16, 24, 40, 0.1)",
        elevated:
          "0 12px 24px -4px rgba(16, 24, 40, 0.08), 0 8px 16px -4px rgba(16, 24, 40, 0.03)",
        modal: "0 24px 48px -12px rgba(16, 24, 40, 0.18)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-right": "slideRight 0.3s ease-out",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideRight: {
          "0%": { opacity: "0", transform: "translateX(-10px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
      },
    },
  },
  extend: {
    backgroundImage: {
      "select-arrow": `url("data:image/svg+xml,...")`,
    },
  },
  plugins: [],
};
