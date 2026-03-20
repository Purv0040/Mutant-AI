/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Mutant Kinetic Design System
        sidebar: '#0F1117',
        primary: '#005ea4',
        accent: '#378ADD',
        surface: '#faf8ff',
        'surface-low': '#f3f3fc',
        'surface-container': '#ededf6',
        'surface-high': '#e7e7f0',
        'surface-highest': '#e2e2eb',
        'surface-white': '#ffffff',
        'surface-dim': '#d9d9e2',
        'on-surface': '#191b22',
        'on-surface-variant': '#414751',
        outline: '#717783',
        'outline-variant': '#c0c7d3',
        'primary-fixed': '#d2e4ff',
        'primary-fixed-dim': '#a1c9ff',
        // Category badge colors
        finance: { bg: '#dcfce7', text: '#16a34a', dot: '#16a34a' },
        hr: { bg: '#dbeafe', text: '#1d4ed8', dot: '#1d4ed8' },
        management: { bg: '#fef3c7', text: '#d97706', dot: '#d97706' },
        legal: { bg: '#fce7f3', text: '#be185d', dot: '#be185d' },
        it: { bg: '#f3e8ff', text: '#7c3aed', dot: '#7c3aed' },
      },
      borderRadius: {
        card: '12px',
        btn: '8px',
      },
      letterSpacing: {
        tight: '-0.02em',
      },
    },
  },
  plugins: [],
}
