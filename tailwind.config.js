/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
         cisco: {
          blue: "#1BA0D7",
          navy: "#0B2A3A",
          sky: "#E6F6FC",
          gray: "#F4F7FA",
        },
        brand: {
          DEFAULT: "#0b5cab",
          50: "#ebf2fb",
          100: "#d7e5f7",
          200: "#b0cbef",
          300: "#89b1e7",
          400: "#6297df",
          500: "#3b7dd7",
          600: "#0b5cab",
          700: "#0a4a89",
          800: "#083867",
          900: "#062645"
        }
      },
      boxShadow: {
        soft: "0 10px 30px rgba(0,0,0,0.06)"
      },
      borderRadius: {
        xl2: "1.25rem"
      }
    }
  },
  plugins: []
}
