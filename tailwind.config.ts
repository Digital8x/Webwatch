import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef7ff',
          100: '#d9ecff',
          200: '#bbdeff',
          300: '#8bcaff',
          400: '#54abff',
          500: '#2c87ff',
          600: '#1a6aff',
          700: '#0f52eb',
          800: '#1342be',
          900: '#163c95',
          950: '#12265a',
        },
        surface: {
          0: '#050810',
          1: '#0a0e1a',
          2: '#0f1424',
          3: '#141a30',
          4: '#1a2140',
          5: '#212a4a',
        },
        border: {
          DEFAULT: '#1e2a4a',
          light: '#2a3660',
          lighter: '#3a4a78',
        },
        status: {
          up: '#10b981',
          'up-bg': 'rgba(16, 185, 129, 0.1)',
          down: '#ef4444',
          'down-bg': 'rgba(239, 68, 68, 0.1)',
          degraded: '#f59e0b',
          'degraded-bg': 'rgba(245, 158, 11, 0.1)',
          paused: '#6b7280',
          'paused-bg': 'rgba(107, 114, 128, 0.1)',
          pending: '#8b5cf6',
          'pending-bg': 'rgba(139, 92, 246, 0.1)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(44, 135, 255, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(44, 135, 255, 0.4)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};

export default config;
