/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // BHUMISETU Color Palette
        'bhumisetu': {
          // Primary - Deep Forest / Government Green
          'forest': '#004643',
          'darkest': '#08120F',
          
          // Neutrals
          'cream': '#F4F1E8',
          'surface': '#EAE6DA',
          'muted': '#527A67',
          
          // Accent - Brass
          'brass': '#C7A75B',
          
          // Status colors
          'success': '#3E8064',
          'warning': '#C58A35',
          'danger': '#B84A43',
          'info': '#54748A',
        },
        // Landowner Portal - Calm, trustworthy, modern
        'lo': {
          'navy': '#0F172A',
          'slate': '#1E293B',
          'surface': '#F8FAFC',
          'card': '#FFFFFF',
          'border': '#E2E8F0',
          'teal': '#0D9488',
          'tealLight': '#CCFBF1',
          'emerald': '#059669',
          'emeraldLight': '#D1FAE5',
          'amber': '#D97706',
          'amberLight': '#FEF3C7',
          'red': '#DC2626',
          'redLight': '#FEE2E2',
          'text': '#0F172A',
          'textSecondary': '#334155',
          'textMuted': '#475569',
        },
      },
      fontFamily: {
        'display': ['DM Serif Display', 'serif'],
        'body': ['Manrope', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1.2' }],
      },
      letterSpacing: {
        'wide': '0.06em',
        'wider': '0.08em',
      },
      backgroundImage: {
        'grid-subtle': 'linear-gradient(rgba(148, 163, 184, 0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(148, 163, 184, 0.12) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid-26': '26px 26px',
      },
      boxShadow: {
        'subtle': '0 10px 30px rgba(15, 23, 42, 0.04)',
        'elevated': '0 8px 25px rgba(0, 0, 0, 0.15)',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.25rem',
      },
    },
  },
  plugins: [],
}
