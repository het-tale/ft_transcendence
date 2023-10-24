/** @type {import('tailwindcss').Config} */
module.exports = {
  mode : 'jit',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'mid-fakhti': '#a435f0',
      },
    },
  },
  plugins: [],
}