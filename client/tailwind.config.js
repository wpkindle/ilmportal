/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f0f8f4',
          100: '#e5f3ec',
          500: '#388e6a',
          600: '#2b6e51',
          700: '#1e543c',
          800: '#143d2b',
          900: '#0c2217',
          950: '#07150e',
        },
        cream: {
          50: '#fdfcfb',
          100: '#faf8f5',
          200: '#f5f0e6',
          300: '#ebe3d3',
          400: '#decfae',
        },
        sand: {
          50: '#fcfbf9',
          100: '#f8f5ee',
          200: '#ede6d8',
          300: '#dfd4be',
          800: '#5e4e37',
        },
        terracotta: {
          50: '#fdf5f2',
          100: '#fae7e1',
          500: '#b85d34',
          600: '#9e4e2a',
          700: '#813f21',
        },
        ink: {
          400: '#81928e',
          500: '#5c6e69',
          700: '#2d3a37',
          800: '#1c2826',
          900: '#141c19',
        },
        emerald: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        gold: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        arabic: ['Amiri', 'Traditional Arabic', 'serif'],
      },
    },
  },
  plugins: [],
};
