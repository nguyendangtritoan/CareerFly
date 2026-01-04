/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // Enable dark mode with class strategy
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Font Family - Clean SaaS uses Inter
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },

      // Clean SaaS Color System - Monochromatic Neutral Palette
      colors: {
        // Canvas & Surface
        canvas: '#F9FAFB',        // bg-gray-50 - App background
        surface: '#FFFFFF',        // bg-white - Main card/container background

        // Text Hierarchy (Light Mode Primary)
        'text-primary': '#101828',    // text-gray-900 - Headers, Task names, Active states
        'text-secondary': '#475467',  // text-gray-700 - Column headers, Timestamps
        'text-tertiary': '#667085',   // text-gray-500 - Icons, Placeholders, Empty states

        // Borders
        'border-subtle': '#EAECF0',   // border-gray-200 - Dividers between rows
        'border-input': '#D0D5DD',    // border-gray-300 - Input fields, dropdowns

        // Action/Accent
        'action-primary': '#101828',  // bg-gray-900 - Primary buttons
        'action-hover': '#252D3D',    // Slightly lighter for hover

        // Tag/Pill
        'tag-bg': '#F2F4F7',         // bg-gray-100 - Category tag background
        'tag-text': '#344054',       // text-gray-700 - Category tag text

        // Hover States
        'hover-bg': '#F9FAFB',       // bg-gray-50 - Row hover background

        // Focus Ring
        'focus-ring': '#F2F4F7',     // Faint focus ring

        // Dark Mode Colors (keeping existing for dark mode support)
        'dark': {
          surface: 'rgb(24, 24, 27)',      // zinc-900
          'surface-deep': 'rgb(9, 9, 11)', // zinc-950
          border: 'rgb(39, 39, 42)',       // zinc-800
          'text-primary': 'rgb(250, 250, 250)',   // zinc-50
          'text-secondary': 'rgb(212, 212, 216)', // zinc-300
          'text-tertiary': 'rgb(161, 161, 170)',  // zinc-400
        },
      },

      // Typography Scale - Clean SaaS Specifications
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem', fontWeight: '400' }],      // 12px - Tags, small labels
        'sm': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '400' }],  // 14px - Base text
        'base': ['1rem', { lineHeight: '1.5rem', fontWeight: '400' }],     // 16px
        'lg': ['1.125rem', { lineHeight: '1.75rem', fontWeight: '500' }],  // 18px
        'xl': ['1.25rem', { lineHeight: '1.75rem', fontWeight: '500' }],   // 20px
        '2xl': ['1.5rem', { lineHeight: '2rem', fontWeight: '600' }],      // 24px - H2
        '3xl': ['1.875rem', { lineHeight: '2.25rem', fontWeight: '700' }], // 30px - H1
      },

      // Font Weights
      fontWeight: {
        normal: '400',   // Regular
        medium: '500',   // Medium - Task titles, tags
        semibold: '600', // Semibold
        bold: '700',     // Bold - Headers
      },

      // Spacing Scale
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },

      // Border Radius - Clean SaaS Specifications
      borderRadius: {
        'container': '12px',  // Main containers - Soft corners
        'button': '8px',      // Buttons/Inputs - Precise corners
        'input': '8px',       // Input fields
        'tag': '999px',       // Tags/Pills - Fully rounded
        'card': '12px',       // Alias for container
      },

      // Box Shadow System - Clean SaaS Elevation
      boxShadow: {
        // Main card shadow
        'card': '0px 1px 3px rgba(16, 24, 40, 0.1), 0px 1px 2px rgba(16, 24, 40, 0.06)',

        // Button shadow
        'button': '0px 1px 2px rgba(16, 24, 40, 0.05)',

        // Input shadow
        'input': '0px 1px 2px rgba(16, 24, 40, 0.05)',

        // Focus ring
        'focus': '0 0 0 4px #F2F4F7',

        // Dropdown/Modal
        'dropdown': '0px 4px 6px -2px rgba(16, 24, 40, 0.03), 0px 12px 16px -4px rgba(16, 24, 40, 0.08)',
      },

      // Animation Durations
      transitionDuration: {
        '250': '250ms',
      },

      // Minimum Heights
      minHeight: {
        'row': '72px', // Log entry row minimum height
      },
    },
  },
  plugins: [],
}
