/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        asphalt: {
          950: '#15171a',
          900: '#1c1f23',
          800: '#26292e',
          700: '#34383e',
          600: '#484d55',
          400: '#8a8f97',
          200: '#c9ccd1',
        },
        signal: {
          DEFAULT: '#ff7a1a', // beacon orange — used sparingly
          dim: '#c4590e',
        },
        line: {
          DEFAULT: '#f4c531', // road-marking yellow, secondary accent
        },
      },
      fontFamily: {
        display: ['"Barlow Condensed"', 'Arial Narrow', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      letterSpacing: {
        tightest2: '-0.03em',
        wide2: '0.14em',
      },
    },
  },
  plugins: [],
}
