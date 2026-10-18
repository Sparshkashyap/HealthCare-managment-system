/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef6ff',
          100: '#d9ebff',
          200: '#bddcff',
          300: '#8dc2ff',
          400: '#58a1ff',
          500: '#2c7ef7',
          600: '#1d63d8',
          700: '#1d4fb2',
          800: '#1d428d',
          900: '#1d3871',
        },
        accent: {
          500: '#10b981',
        },
      },
      boxShadow: {
        soft: '0 8px 24px rgba(15, 23, 42, 0.08)',
      },
    },
  },
  plugins: [],
};
