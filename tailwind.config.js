/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eef4ff',
          100: '#dae6ff',
          200: '#bcd2ff',
          300: '#8eb5fd',
          400: '#598cf9',
          500: '#3466f4',
          600: '#1e46e8',
          700: '#1735d6',
          800: '#1a2dac',
          900: '#1b2c87',
          950: '#141d53',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
