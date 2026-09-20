import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    '../shared/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // DocuCraft Brand Accents
        brand: {
          orange: '#FFA259',
          coral: '#FF7E7E',
          yellow: '#FFCB56',
          cream: '#FFEDB9',
        },
        // Editorial Ink Colors
        ink: {
          900: '#17181C',
          800: '#22242A',
          700: '#33363F',
          500: '#5E626E',
          400: '#8B909E',
          200: '#D8DAE0',
          100: '#EAECEF',
        },
        // Physical Paper & Warm Neutrals
        paper: {
          pure: '#FFFFFF',
          warm: '#FBFBFA',
          sand: '#F7F7F5',
          card: '#F4F4F0',
          border: '#E8E8E3',
          'border-strong': '#D4D4CE',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Merriweather', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        paper: '0 1px 3px rgba(23, 24, 28, 0.05), 0 8px 24px -4px rgba(23, 24, 28, 0.08)',
        'paper-lg': '0 2px 6px rgba(23, 24, 28, 0.04), 0 16px 40px -8px rgba(23, 24, 28, 0.12)',
        dock: '0 4px 20px -2px rgba(23, 24, 28, 0.1)',
        subtle: '0 1px 2px rgba(23, 24, 28, 0.04)',
      },
      borderRadius: {
        xs: '2px',
        sm: '4px',
        md: '6px',
        lg: '8px',
        xl: '12px',
      },
    },
  },
  plugins: [],
};

export default config;
