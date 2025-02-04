/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,jsx}", "./index.html"],
  theme: {
    extend: {
      colors: {
        dark: "#111111",
        light: "#f6f6f6",
        accent: "#ffcb74",
        "accent-100": "#f4c77f",
        "accent-200": "#f7a218",
        secondary: "#2f2f2f",
        transparent: "transparent"
      }
    },
  },
  plugins: [],
}

