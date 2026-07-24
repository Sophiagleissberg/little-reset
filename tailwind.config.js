/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#EDEFEA',
        sheet: '#FBFCFA',
        ink: '#1B211D',
        soft: '#6C746E',
        faint: '#9AA29B',
        rule: '#DCE0D8',
        care: '#2F5D4E',
        careSoft: '#DDE7E1',
        ledger: '#8A6320',
        ledgerSoft: '#F0E7D8',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['"Instrument Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(27,33,29,0.04), 0 12px 32px -18px rgba(27,33,29,0.28)',
        lift: '0 2px 6px rgba(27,33,29,0.06), 0 24px 48px -22px rgba(27,33,29,0.40)',
      },
      borderRadius: {
        card: '22px',
        sheet: '30px',
      },
    },
  },
  plugins: [],
}
