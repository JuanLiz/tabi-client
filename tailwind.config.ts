import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'green': {
          DEFAULT: '#63A91F',
          100: '#f9fff6',
          300: '#ADE679',
          900: '#63A91F'
        },
        'brown': {
          DEFAULT: '#412F26',
          100: '#EDE1D2',
          200: '#CBB89D',
          500: '#806044',
          900: '#412F26'
        },
      },
      fontFamily: {
        sans: ['var(--font-mulish)'],
      },
      borderRadius: {
        'none': '0',
        'sm': '0.125rem',
        'md': '0.25rem',
        'lg': '0.75rem',
        'xl': '1rem',
        'full': '9999px',
      },
    },
  },
  plugins: [],
};
export default config;
