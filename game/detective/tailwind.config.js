/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'terminal-bg': '#09090b', // zinc-950
        'terminal-text': '#10b981', // emerald-500
        'terminal-dim': '#047857', // emerald-700
        'terminal-alert': '#ef4444', // red-500
      },
      fontFamily: {
        mono: ['"Courier New"', 'Courier', 'monospace'],
      },
      animation: {
        'blink': 'blink 1s step-end infinite',
        'flicker': 'flicker 0.15s infinite',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        flicker: {
          '0%': { opacity: '0.9' },
          '50%': { opacity: '1' },
          '100%': { opacity: '0.9' },
        }
      }
    },
  },
  plugins: [],
}
