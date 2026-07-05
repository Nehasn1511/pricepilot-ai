/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
        },
      },
      boxShadow: {
        soft: '0 2px 12px rgba(15, 23, 42, 0.06)',
        card: '0 4px 20px -4px rgba(15, 23, 42, 0.08)',
        glow: '0 8px 30px -8px rgba(99, 102, 241, 0.35)',
      },
    },
  },
  corePlugins: { preflight: false },
  plugins: [],
};
