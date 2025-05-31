/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'neon-green': '#00FF85',
        'dark-bg': '#000000',
        'dark-card': '#121212',
      },
      boxShadow: {
        'glow': '0 0 15px rgba(0, 255, 133, 0.3)',
      },
    },
  },
  plugins: [],
};