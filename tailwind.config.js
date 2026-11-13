/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Be Vietnam Pro"', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['"Lora"', '"Be Vietnam Pro"', '"Times New Roman"', 'serif'],
        display: ['"Lora"', '"Be Vietnam Pro"', '"Times New Roman"', 'serif'],
        handwriting: ['"Dancing Script"', '"Charm"', 'cursive'],
        charm: ['"Charm"', '"Dancing Script"', 'cursive'],
      },
      colors: {
        cream: {
          50: '#FDFBF7',
          100: '#F7F4EF',
          200: '#EFECE6',
          300: '#E3DFD7',
          400: '#C9C4BC',
          800: '#4A443F',
          900: '#2C2723',
        },
        ink: {
          light: '#5A524C',
          DEFAULT: '#2B2523',
          dark: '#1C1715',
        },
      },
      animation: {
        'flame': 'flame 0.28s ease-in-out infinite alternate',
      },
      keyframes: {
        flame: {
          '0%': { transform: 'scaleY(1) scaleX(1) skewX(-1.5deg)' },
          '100%': { transform: 'scaleY(1.15) scaleX(0.88) skewX(2deg)' },
        },
      },
    },
  },
  plugins: [],
};
