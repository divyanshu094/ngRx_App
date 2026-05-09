module.exports = {
  content: [
    './src/**/*.{html,ts,scss}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f3fdf5',
          100: '#d8f8dd',
          200: '#b5eebb',
          300: '#7fdd8e',
          400: '#50c86a',
          500: '#36b251',
          600: '#2f9f47',
          700: '#2d893f',
          800: '#2b7439',
          900: '#2e6833'
        }
      },
      boxShadow: {
        soft: '0 18px 45px rgba(68, 148, 85, 0.12)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    }
  },
  plugins: [
    require('tailwind-scrollbar-hide')
  ],
};
