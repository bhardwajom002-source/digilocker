/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Plus Jakarta Sans', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#2563EB',
          dark: '#1D4ED8',
          light: '#EFF6FF',
        },
        accent: '#7C3AED',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '32px',
      },
      animation: {
        'page-in': 'pageIn 0.45s cubic-bezier(0.34,1.56,0.64,1) forwards',
        'fade-in': 'fadeIn 0.4s ease forwards',
        'scale-in': 'scaleIn 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards',
        'bounce-dot': 'bounce-dot 1.2s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s infinite',
      },
      keyframes: {
        pageIn: {
          from: { opacity: '0', transform: 'translateY(40px) scale(0.96)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        pageOut: {
          from: { opacity: '1', transform: 'translateY(0) scale(1)' },
          to: { opacity: '0', transform: 'translateY(-30px) scale(0.97)' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.7)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(60px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'bounce-dot': {
          '0%, 100%': { opacity: '0.3', transform: 'scale(0.8)' },
          '50%': { opacity: '1', transform: 'scale(1.1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
