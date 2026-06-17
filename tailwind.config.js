/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // Ada design tokens — mirror the CSS variables in src/index.css so
      // Tailwind utilities (where used) stay on-palette with the ported CSS.
      colors: {
        bg: '#FBFAF6',
        'bg-card': '#FFFFFF',
        'bg-cream-2': '#F4EDDF',
        accent: '#B8862D',
        'accent-light': '#D4A347',
        'accent-dark': '#9C6E20',
        'accent-soft': '#F0E2C0',
        dark: '#2A1F12',
        'dark-soft': '#3D2E1C',
        'on-dark': '#FBF5EE',
        'text-primary': '#2A1F12',
        'text-secondary': '#5C4A30',
        'text-tertiary': '#9B8B6E',
        'text-warm': '#7A6645',
        'text-body': '#3A2D18',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      borderRadius: {
        card: '20px',
        pill: '50px',
      },
      boxShadow: {
        card: '0 4px 32px rgba(42, 31, 18, 0.05)',
        hover: '0 8px 24px rgba(42, 31, 18, 0.08)',
        popover: '0 20px 60px rgba(42, 31, 18, 0.18), 0 4px 12px rgba(42, 31, 18, 0.06)',
      },
    },
  },
  plugins: [],
}
