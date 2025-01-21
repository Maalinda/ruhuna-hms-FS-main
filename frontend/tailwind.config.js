/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          primary: '#004D40',
          'primary-dark': '#00251a',
          accent: '#00F2F2',
        }
      },
    },
    plugins: [],
  }
  
  