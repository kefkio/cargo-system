// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#0B3D91',        // Hero background
        secondary: '#FFB200',      // Buttons / accents
        'secondary-dark': '#E69A00', // Hover
        accent: '#14B8A6',         // Highlights
        background: '#F3F4F6',
        'text-primary': '#111827',
        'text-secondary': '#4B5563',
        sideNav: '#1F2937',        // Sidebar color
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-50%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeInOut: {
          '0%, 100%': { opacity: '0', transform: 'translateY(20%)' },
          '50%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 1s ease-out',
        slideIn: 'slideIn 1s ease-out',
        fadeInOut: 'fadeInOut 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}