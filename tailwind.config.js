/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ukta: {
          red: '#7A1620',
          'red-dark': '#5a0000',
          'red-light': '#9C1F2E',
          gold: '#D4AF37',
          'gold-light': '#FFD87A',
          'gold-bright': '#F4C542',
          'gold-dark': '#996515',
          navy: '#0D0705',
          accent: '#c0392b',
        },
        temple: {
          black: '#0D0705',
          maroon: '#160B08',
          red: '#7A1620',
          redLight: '#9C1F2E',
          gold: '#D4AF37',
          goldBright: '#F4C542',
          goldLight: '#FFD87A',
          mitraPink: '#EC1E79',
          marigold: '#F7941D',
          ivory: '#F7EFE1',
          goldGrey: '#C9B79C',
        }
      },
      fontFamily: {
        cinzel: ['Cinzel', 'serif'],
        decorative: ['Cinzel Decorative', 'Cinzel', 'serif'],
        script: ['Great Vibes', 'cursive'],
        sans: ['Plus Jakarta Sans', 'sans-serif'],
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', filter: 'drop-shadow(0 0 15px rgba(212, 175, 55, 0.4))' },
          '50%': { opacity: '1', filter: 'drop-shadow(0 0 30px rgba(244, 197, 66, 0.8))' },
        },
        flicker: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.7', transform: 'scale(0.95)' },
        }
      },
      animation: {
        shimmer: 'shimmer 4s infinite linear',
        float: 'float 6s ease-in-out infinite',
        glow: 'pulseGlow 3s infinite ease-in-out',
        flicker: 'flicker 2s infinite ease-in-out',
      }
    },
  },
  plugins: [],
}

