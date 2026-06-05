import animate from 'tailwindcss-animate';

// Tailwind was previously loaded via the CDN (JIT-in-browser), which generated
// any class on demand. The build-time engine only generates classes it can see
// in `content`. Several components build class names dynamically
// (e.g. `bg-${role.color}-500` in AuthPage / Dashboard / ClinicDashboard /
// LineageBuilder / ScheduleManager), so we safelist the colour utilities those
// rely on to preserve the existing look.
const PALETTE = [
  'slate', 'gray', 'red', 'orange', 'amber', 'yellow', 'green', 'emerald',
  'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia',
  'pink', 'rose',
].join('|');
const SHADES = '50|100|200|300|400|500|600|700|800|900|950';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './services/**/*.{ts,tsx}',
  ],
  safelist: [
    {
      pattern: new RegExp(
        `^(bg|text|border|border-t|border-r|border-b|border-l|ring|ring-offset|from|via|to|fill|stroke|shadow|divide)-(${PALETTE})-(${SHADES})$`,
      ),
      variants: ['hover', 'focus', 'focus-visible', 'group-hover', 'active'],
    },
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#ecfdf5', 100: '#d1fae5', 500: '#10b981',
          600: '#059669', 700: '#047857',
        },
        secondary: {
          50: '#fff1f2', 100: '#ffe4e6', 500: '#fb7185',
          600: '#e11d48', 700: '#be123c',
        },
        accent: {
          50: '#fffbeb', 100: '#fef3c7', 500: '#f59e0b',
          600: '#d97706', 700: '#b45309',
        },
        success: '#16a34a',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
      },
      boxShadow: {
        'elevation-1': '0 1px 3px rgba(15,23,42,.06), 0 1px 2px rgba(15,23,42,.04)',
        'elevation-2': '0 4px 12px rgba(15,23,42,.08)',
        'elevation-3': '0 12px 32px rgba(15,23,42,.12)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'none' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'count-up': {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'none' },
        },
      },
      animation: {
        'fade-in': 'fade-in .25s ease-out',
        shimmer: 'shimmer 1.5s infinite',
        'count-up': 'count-up .4s ease-out',
      },
    },
  },
  plugins: [animate],
};
