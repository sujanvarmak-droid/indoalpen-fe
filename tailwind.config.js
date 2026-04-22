export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#1E3A5F', light: '#2E86AB', muted: '#EEF4F8' },
        success: '#1A7A4A',
        warning: '#C05C00',
        danger: '#B22222',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
      },
      animation: {
        fadeIn: 'fadeIn 0.15s ease-out',
      },
    },
  },
  plugins: []
};
