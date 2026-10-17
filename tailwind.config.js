/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        nx: {
          bg: '#05060d',
          surface: '#0b0d1a',
          card: '#10132a',
          line: '#1b2040',
          text: '#eaf0ff',
          muted: '#8c96bd',
          accent: '#2f7bff',
          cyan: '#19d3ff',
          violet: '#7c5cff',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Sora', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 10px 40px -10px rgba(47,123,255,0.55)',
      },
    },
  },
  plugins: [],
};
