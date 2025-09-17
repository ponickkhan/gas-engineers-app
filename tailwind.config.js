/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Orient Gas brand colors from the original HTML
        'orient-blue': '#2e5aa6',
        'orient-line': '#2e5aa6',
        'orient-cell': '#ffffff',
        'orient-head': '#fffec7',
        'orient-pale': '#fff6b8',
      },
      fontFamily: {
        sans: ['Arial', 'Helvetica', 'sans-serif'],
      },
      screens: {
        'print': {'raw': 'print'},
      },
    },
  },
  plugins: [],
}