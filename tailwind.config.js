const c = (name) => `rgb(var(--${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: c('c-ink'),
        ink2: c('c-ink2'),
        cream: c('c-cream'),
        champagne: c('c-champagne'),
        rose: c('c-rose'),
        mauve: c('c-mauve'),
        gold: c('c-gold'),
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', '"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};