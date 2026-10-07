/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0284c7',
          600: '#0369a1',
          700: '#075985',
          800: '#0c4a6e',
          900: '#082f49',
          950: '#031a29',
        },
        slate: {
          850: '#151f32',
          900: '#0f172a',
          950: '#090d16',
        },
        accessibility: {
          teal: '#0d9488',
          amber: '#d97706',
          rose: '#e11d48',
          emerald: '#059669',
          violet: '#7c3aed',
          cyan: '#06b6d4',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Outfit', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        'card': '0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.04)',
        'soft': '0 4px 20px -2px rgba(15, 23, 42, 0.06)',
        'hover': '0 12px 30px -4px rgba(15, 23, 42, 0.09), 0 4px 6px -2px rgba(15, 23, 42, 0.03)',
        'float': '0 20px 40px -12px rgba(15, 23, 42, 0.12)',
        'glow-sky': '0 0 25px -4px rgba(2, 132, 199, 0.22)',
        'glow-teal': '0 0 25px -4px rgba(13, 148, 136, 0.22)',
        'glow-purple': '0 0 25px -4px rgba(124, 58, 237, 0.22)',
        'bottom-nav': '0 -4px 20px -2px rgba(15, 23, 42, 0.08)',
      },
      animation: {
        'pulse-subtle': 'pulseSubtle 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      }
    },
  },
  plugins: [],
}
