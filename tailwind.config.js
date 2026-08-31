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
        /* Tools by Decyfy palette, taken from the logo mark.
         *
         * brand — the toolbox-lid blue. Actions, links, focus.
         * ink   — the wordmark navy. Headings and body text. Warmer and deeper
         *         than Tailwind's slate, which is what stops the site reading as
         *         a generic blue-on-grey SaaS page.
         * The three tile accents identify categories and are used sparingly:
         * a tool that does everything in blue has nothing left to emphasise.
         */
        brand: {
          50:  '#eef4ff',
          100: '#dbe6ff',
          200: '#bed3ff',
          300: '#91b6ff',
          400: '#5d8dfb',
          500: '#3a6cf4',
          600: '#1b6bf0',
          700: '#1553d1',
          800: '#1544a8',
          900: '#173c85',
          950: '#122551',
        },
        ink: {
          50:  '#f4f6fa',
          100: '#e7ebf3',
          200: '#cbd5e6',
          300: '#9dafcd',
          400: '#6a83af',
          500: '#496494',
          600: '#394f7a',
          700: '#304063',
          800: '#2b3853',
          900: '#132347',
          950: '#0c1730',
        },
        /* Category accents — from the logo tiles. */
        doc:  { DEFAULT: '#1b6bf0', soft: '#eef4ff' },  // Documents & PDF
        img:  { DEFAULT: '#7c4dd6', soft: '#f3eefc' },  // File & Image
        data: { DEFAULT: '#22b49a', soft: '#e6f7f3' },  // Data & Text
        biz:  { DEFAULT: '#f59331', soft: '#fef2e6' },  // Business & Work
      },
      fontFamily: {
        /* Display face carries the rebrand; Inter stays on body and tool UI so
         * 25 existing tool layouts keep their tuned metrics. */
        display: ['var(--font-display)', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(19,35,71,.06), 0 1px 3px rgba(19,35,71,.04)',
        lift: '0 8px 24px -8px rgba(19,35,71,.16), 0 2px 6px rgba(19,35,71,.06)',
      },
      borderRadius: {
        '4xl': '1.75rem',
      },
    },
  },
  plugins: [],
};
