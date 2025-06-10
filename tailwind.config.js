/** @type {import('tailwindcss').Config} */
module.exports = {
  prefix: 'tw-', // The Galactic Standards Committee requires prefixing to avoid conflicts
  content: [
    './src/**/*.{html,ts}', // Scan all our HTML and TypeScript files
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1976d2',
          light: '#42a5f5',
          dark: '#0d47a1',
        },
        accent: {
          DEFAULT: '#ff4081',
          light: '#ff80ab',
          dark: '#c51162',
        },
        'imperial-black': '#121212',
        'star-wars-yellow': '#ffe81f',
        'star-wars-blue': '#60a5fa',
        'death-star-gray': '#4a4a4a',
        'sith-red': '#ff3b30',
        'tatooine-sand': '#deb887',
        'yoda-green': '#9acd32',
        'falcon-gray': '#a9a9a9',
      }
    },
  },
  plugins: [],
};
