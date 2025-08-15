/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        whatsapp: {
          primary: '#00a884',
          secondary: '#667781',
          dark: {
            50: '#f7f7f8',
            100: '#e9e9eb',
            200: '#d1d1d6',
            300: '#b3b3b9',
            400: '#8e8e93',
            500: '#6e6e73',
            600: '#48484a',
            700: '#3a3a3c',
            800: '#2c2c2e',
            900: '#1c1c1e',
            950: '#121212',
          },
          chat: {
            bg: '#2C2C2C',
            header: '#1e1e1e',
            input: '#2a2a2a',
            search: '#3D3D3D',
          }
        }
      },
      fontFamily: {
        'segoe': ['"Segoe UI"', 'Tahoma', 'Geneva', 'Verdana', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
