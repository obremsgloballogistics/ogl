module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        heading: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          900: '#063B66',
          800: '#0B4A7A',
          700: '#0B63CE',
          100: '#F4F7FA',
        },
      },
      boxShadow: {
        soft: '0 10px 30px rgba(23, 43, 58, 0.08)',
      },
    },
  },
  plugins: [],
};

