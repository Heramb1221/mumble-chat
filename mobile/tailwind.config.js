/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#4FD1C5",
          light: "#7EE6DC",
          dark: "#2FA89D",
          soft: "#BFF3EC",
        },

        surface: {
          DEFAULT: "#121417",
          light: "#1C1F24",
          dark: "#0B0D10",
          card: "#181B20",
        },

        foreground: "#F8FAFC",
        "muted-foreground": "#9CA3AF",
        "subtle-foreground": "#6B7280",

        success: "#22C55E",
        warning: "#FACC15",
        danger: "#EF4444",
      },
    },
  },
  plugins: [],
};
