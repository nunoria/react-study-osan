/** @type {import('tailwindcss').Config} */
// tailwind.config.js

const baseFontSize = 16;
const pxToRem = (px, base = baseFontSize) => `${px / base}rem`;
const range = (start, end) => {
  let array = [];
  for (let i = start; i < end; ++i) {
    array.push(i);
  }
  return array;
};

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      sm: '480px',
      md: '768px',
      lg: '976px',
      xl: '1440px', // container max width
    },
    extend: {
      spacing: range(1, 400).reduce((acc, px) => {
        acc[`${px}pxr`] = pxToRem(px);
        return acc;
      }, {}),
      animation: {
        fadeIn: 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}


