/** @type {import('tailwindcss').Config} */
export default {
  content: ['./sidepanel.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Ops console tokens — sampled from /ops screenshot
        surface: {
          DEFAULT: '#09090b', // page bg
          raised: '#18181b', // cards
          banner: '#1c232d', // plan/banner panel fill
          overlay: '#27272a', // inputs / secondary buttons
          border: '#3f3f46',
        },
        ink: {
          DEFAULT: '#fafafa',
          muted: '#a1a1aa',
          dim: '#71717a',
        },
        accent: {
          DEFAULT: '#38bdf8',
          deep: '#0ea5e9', // primary buttons
          premium: '#0284c7',
          dim: 'rgba(56, 189, 248, 0.06)', // banner tint (col-standard)
          soft: 'rgba(56, 189, 248, 0.12)',
          border: 'rgba(56, 189, 248, 0.35)',
        },
      },
      minWidth: {
        panel: '320px',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-in': 'slideIn 0.25s ease-out',
        shimmer: 'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
