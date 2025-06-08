/** @type {import('tailwindcss').Config} */
module.exports = {
  prefix: 'tw-', // The Galactic Standards Committee requires prefixing to avoid conflicts
  content: [
    "./src/**/*.{html,ts}", // Scan all our HTML and TypeScript files
  ],
  theme: {
    extend: {
      // We'll add our Star Wars theme colors later
      // The Void of Undefined currently occupies this space
    },
  },
  plugins: [],
}

