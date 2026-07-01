/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F7F2E9',
        card: '#FFFDF8',
        ink: '#2B2520',
        rust: '#8A3A28',
        teal: '#0F6E56',
        amber: '#8A5E0A',
        plum: '#6B3F63',
        slate: '#3E4C56',
      },
      keyframes: {
        'slide-up': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
      },
      animation: {
        'slide-up': 'slide-up 0.25s ease-out',
      },
    },
  },
  plugins: [],
}
