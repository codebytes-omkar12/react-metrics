/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        'primary': {
          light: '#4f46e5', // indigo-600
          dark: '#6366f1',  // indigo-500
        },
        'secondary': {
          light: '#10b981', // emerald-500
          dark: '#34d399',  // emerald-400
        },
        'background': {
          light: '#f1f5f9', // slate-100
          dark: '#0f172a',  // slate-900
        },
        'card': {
          light: '#ffffff',
          dark: '#1e293b', // slate-800
        },
        'text-primary': {
          light: '#1e293b', // slate-800
          dark: '#e2e8f0',  // slate-200
        },
        'text-secondary': {
          light: '#64748b', // slate-500
          dark: '#94a3b8',  // slate-400
        },
        'border': {
          light: '#e2e8f0', // slate-200
          dark: '#334155',  // slate-700
        }
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'spin-color': {
          '0%': { color: '#f87171' },
          '33%': { color: '#facc15' },
          '66%': { color: '#34d399' },
          '100%': { color: '#f87171' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out forwards',
        'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
        'spin-color': 'spin 1s linear infinite, color-change 3s linear infinite',
      }
    },
  },
  plugins: [],
}