/** @type {import('tailwindcss').Config} */
export default {
   darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
  animation: {
    'spin-color': 'spin 1s linear infinite, color-change 3s linear infinite',
  },
  keyframes: {
    'color-change': {
      '0%': { color: '#f87171' },     // red-400
      '33%': { color: '#facc15' },    // yellow-400
      '66%': { color: '#34d399' },    // green-400
      '100%': { color: '#f87171' },   // red-400 again
    },
  },
}
  },
  plugins: [],
}


