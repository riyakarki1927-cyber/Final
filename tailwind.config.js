/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        heading: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50:  '#fdf4ff',
          100: '#fae8ff',
          200: '#f3d0ff',
          300: '#e9a3ff',
          400: '#d966ff',
          500: '#c33ef5',
          600: '#aa1fd8',
          700: '#8f18b0',
          800: '#761a8f',
          900: '#621a72',
        },
        surface: {
          50:  '#f8f7fa',
          100: '#f1eff4',
          200: '#e5e2ea',
          300: '#d4d0db',
          400: '#b8b3c4',
          500: '#9d97ac',
          600: '#807893',
          700: '#68617a',
          800: '#4e4860',
          900: '#36304a',
        },
        success: { 500: '#22c55e', 100: '#dcfce7' },
        warning: { 500: '#f59e0b', 100: '#fef3c7' },
        danger:  { 500: '#ef4444', 100: '#fee2e2' },
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,.08), 0 1px 2px rgba(0,0,0,.05)',
        'card-hover': '0 4px 12px rgba(0,0,0,.12), 0 2px 4px rgba(0,0,0,.07)',
      },
    },
  },
  plugins: [],
}
