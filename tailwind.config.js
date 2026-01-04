/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // Enable dark mode with class strategy
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Font Family
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },

      // Color System - Semantic tokens for light/dark modes
      colors: {
        // Primary brand color
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1', // Main indigo
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },

        // Surface colors (backgrounds, cards)
        surface: {
          light: 'rgb(255, 255, 255)', // White for light mode
          'light-secondary': 'rgb(249, 250, 251)', // Very light gray
          DEFAULT: 'rgb(24, 24, 27)', // zinc-900 for dark mode
          dark: 'rgb(9, 9, 11)', // zinc-950 for dark mode
        },

        // Border colors
        border: {
          light: 'rgb(212, 212, 216)', // gray-300
          'light-subtle': 'rgb(229, 231, 235)', // gray-200
          DEFAULT: 'rgb(39, 39, 42)', // zinc-800
          dark: 'rgb(24, 24, 27)', // zinc-900
        },

        // Text colors (hierarchy)
        text: {
          'primary-light': 'rgb(24, 24, 27)', // zinc-900
          'secondary-light': 'rgb(82, 82, 91)', // zinc-600
          'tertiary-light': 'rgb(113, 113, 122)', // zinc-500
          'primary-dark': 'rgb(250, 250, 250)', // zinc-50
          'secondary-dark': 'rgb(212, 212, 216)', // zinc-300
          'tertiary-dark': 'rgb(161, 161, 170)', // zinc-400
        },

        // Accent colors for impact levels
        accent: {
          'high': {
            light: 'rgb(79, 70, 229)', // indigo-600
            dark: 'rgb(129, 140, 248)', // indigo-400
          },
          'medium': {
            light: 'rgb(2, 132, 199)', // sky-600
            dark: 'rgb(56, 189, 248)', // sky-400
          },
          'low': {
            light: 'rgb(113, 113, 122)', // zinc-500
            dark: 'rgb(161, 161, 170)', // zinc-400
          },
        },

        // Status colors
        success: {
          light: 'rgb(22, 163, 74)', // green-600
          dark: 'rgb(34, 197, 94)', // green-500
        },
        warning: {
          light: 'rgb(234, 179, 8)', // yellow-500
          dark: 'rgb(250, 204, 21)', // yellow-400
        },
        error: {
          light: 'rgb(220, 38, 38)', // red-600
          dark: 'rgb(248, 113, 113)', // red-400
        },
      },

      // Typography Scale
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      },

      // Spacing Scale (extending defaults)
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },

      // Border Radius Presets
      borderRadius: {
        'card': '0.75rem', // 12px - for cards
        'button': '0.5rem', // 8px - for buttons
        'input': '0.5rem', // 8px - for inputs
        'tag': '0.375rem', // 6px - for tags/badges
      },

      // Box Shadow System (elevation)
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'button': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'dropdown': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      },

      // Animation Durations
      transitionDuration: {
        '250': '250ms',
      },

      // Additional utilities
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [],
}
