/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        asphalt: {
          950: '#ffffff', // page background (was darkest bg, now white)
          900: '#ffffff', // card background
          800: '#eef3f0', // input bg / subtle fill
          700: '#dde6e1', // borders
          600: '#c7d6ce', // borders (inputs, ghost buttons)
          400: '#5b6b64', // muted / secondary text
          200: '#163126', // primary body text (dark green-black)
        },
        signal: {
          DEFAULT: '#1c6e4a', // primary green (was beacon orange)
          dim: '#145238', // primary green hover
        },
        line: {
          DEFAULT: '#2f9e63', // secondary green accent (was road-marking yellow)
        },
      },
      fontFamily: {
        display: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        body: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      letterSpacing: {
        tightest2: '-0.03em',
        wide2: '0.14em',
      },
    },
  },
  plugins: [],
}
